import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { BUCKET } from "@/lib/assets";
import { handle } from "@/lib/api";
import { getServiceClient, HttpError } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
const MAX = 5 * 1024 * 1024;
const FOLDERS = ["logo", "favicon", "hero", "about", "benefits", "services", "projects", "testimonials", "backgrounds", "seo"];

function sniff(b: Uint8Array): { mime: string; ext: string } | null {
  const hex = (n: number) => Array.from(b.slice(0, n)).map((x) => x.toString(16).padStart(2, "0")).join("");
  if (hex(8) === "89504e470d0a1a0a") return { mime: "image/png", ext: "png" };
  if (hex(3) === "ffd8ff") return { mime: "image/jpeg", ext: "jpg" };
  if (hex(4) === "47494638") return { mime: "image/gif", ext: "gif" };
  if (hex(4) === "52494646" && Buffer.from(b.slice(8, 12)).toString() === "WEBP") return { mime: "image/webp", ext: "webp" };
  if (hex(4) === "00000100") return { mime: "image/x-icon", ext: "ico" };
  return null;
}

export const POST = (req: NextRequest) =>
  handle(async () => {
    const form = await req.formData();
    const file = form.get("file");
    const websiteId = z.string().uuid().parse(form.get("websiteId"));
    const folder = z.enum(FOLDERS as [string, ...string[]]).parse(form.get("folder"));
    if (!(file instanceof File)) throw new HttpError(400, "No file received.");
    if (file.size > MAX) throw new HttpError(413, "Image is larger than 5 MB.");
    const bytes = new Uint8Array(await file.arrayBuffer());
    const kind = sniff(bytes); // trust the file signature, not the client's mime type or extension
    if (!kind) throw new HttpError(415, "Use a PNG, JPG, WebP, GIF or ICO image (SVG is not accepted).");
    const path = `websites/${websiteId}/${folder}/${crypto.randomUUID()}.${kind.ext}`;
    const { error } = await getServiceClient().storage.from(BUCKET).upload(path, bytes, { contentType: kind.mime, cacheControl: "31536000", upsert: false });
    if (error) throw new HttpError(500, `Upload failed: ${error.message}`);
    return NextResponse.json({ path });
  });
