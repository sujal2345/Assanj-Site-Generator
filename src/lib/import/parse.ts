import * as XLSX from "xlsx";
import { HttpError } from "@/lib/supabase/server";

export type ImportCompany = Record<string, string>;
const MAX = 5 * 1024 * 1024;
const aliases: Record<string, string> = {
  name: "name", businessname: "name", company: "name", title: "name", category: "category", rating: "rating", reviewcount: "review_count",
  address: "address", street: "street", city: "city", state: "state", postalcode: "postal_code", zip: "postal_code", pincode: "postal_code", country: "country",
  phone: "phone", mobile: "phone", tel: "phone", telephone: "phone", contact: "phone", website: "website", url: "website", site: "website", web: "website", email: "email", hours: "hours", description: "description", attributes: "attributes", latitude: "latitude", lat: "latitude", longitude: "longitude", lng: "longitude", lon: "longitude", pluscode: "plus_code", googlemapsurl: "google_maps_url", placeid: "place_id", photos: "photos", reviews: "reviews", sourcelisturl: "source_list_url", scrapedat: "scraped_at", searchquery: "search_query",
};
const normalizeHeader = (s: string) => aliases[s.toLowerCase().replace(/[\s_-]/g, "")] ?? "";
function normalizeRows(input: unknown[][]): { rows: ImportCompany[]; mapping: Record<string, string> } {
  const headers = (input[0] ?? []).map((v) => String(v ?? "").trim());
  const mapping: Record<string, string> = {};
  const indexes = headers.map((h, i) => { const key = normalizeHeader(h); if (key) mapping[h] = key; return key ? i : -1; });
  const rows = input.slice(1).filter((r) => r.some((v) => String(v ?? "").trim())).map((r) => Object.fromEntries(indexes.flatMap((idx, i) => idx < 0 ? [] : [[normalizeHeader(headers[i]), String(r[idx] ?? "").trim()]])));
  return { rows, mapping };
}
export async function parseImportFile(file: File) {
  if (file.size > MAX) throw new HttpError(413, "File exceeds the 5 MB limit.");
  const ext = file.name.toLowerCase().split(".").pop();
  if (!["json", "csv", "tsv", "xlsx"].includes(ext ?? "")) throw new HttpError(415, "Supported formats: .json, .csv, .tsv, .xlsx.");
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (ext === "json") {
    let parsed: unknown;
    try { parsed = JSON.parse(new TextDecoder().decode(bytes).replace(/^\uFEFF/, "")); } catch { throw new HttpError(400, "The JSON file could not be read."); }
    const list = Array.isArray(parsed) ? parsed : (parsed as { places?: unknown[] })?.places;
    if (!Array.isArray(list)) throw new HttpError(400, "JSON must be an array of companies or an object with a places array.");
    const rows = list.map((item) => Object.fromEntries(Object.entries(item as Record<string, unknown>).map(([k, v]) => [normalizeHeader(k) || k, typeof v === "string" ? v : JSON.stringify(v ?? "")])));
    return { rows: rows.slice(0, 500), mapping: Object.fromEntries(Object.keys(rows[0] ?? {}).map((k) => [k, k])), warnings: rows.length > 500 ? ["Only the first 500 rows were read."] : [] };
  }
  let matrix: unknown[][];
  if (ext === "xlsx") {
    const book = XLSX.read(bytes, { type: "array" });
    const sheet = book.Sheets[book.SheetNames[0]];
    if (!sheet) throw new HttpError(400, "The workbook has no sheets.");
    matrix = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "", raw: false }) as unknown[][];
  } else {
    const text = new TextDecoder("utf-8").decode(bytes).replace(/^\uFEFF/, "");
    const delimiter = ext === "tsv" || (!text.split(/\r?\n/)[0].includes(",") && text.split(/\r?\n/)[0].includes("\t")) ? "\t" : ",";
    matrix = parseDelimited(text, delimiter);
  }
  const result = normalizeRows(matrix);
  return { rows: result.rows.slice(0, 500), mapping: result.mapping, warnings: result.rows.length > 500 ? ["Only the first 500 rows were read."] : [] };
}
function parseDelimited(text: string, delimiter: string): string[][] {
  const out: string[][] = []; let row: string[] = []; let cell = ""; let quoted = false;
  for (let i = 0; i < text.length; i++) { const c = text[i]; if (quoted) { if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; } else if (c === '"') quoted = false; else cell += c; } else if (c === '"') quoted = true; else if (c === delimiter) { row.push(cell); cell = ""; } else if (c === "\n" || c === "\r") { if (c === "\r" && text[i + 1] === "\n") i++; row.push(cell); out.push(row); row = []; cell = ""; } else cell += c; }
  row.push(cell); out.push(row); return out;
}
