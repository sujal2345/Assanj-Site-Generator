import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handle } from "@/lib/api";
import { saveWebsite } from "@/lib/db";
import { siteConfigSchema } from "@/lib/schema";
import { getServiceClient, HttpError } from "@/lib/supabase/server";
import { mapCompany, slugify } from "@/lib/import/map-to-config";
import type { ImportCompany } from "@/lib/import/parse";

export const dynamic = "force-dynamic";
const requestSchema = z.object({ rows: z.array(z.object({ row: z.record(z.string()), selected: z.boolean().default(true), slug: z.string().optional(), force: z.boolean().optional() })).max(500), showRating: z.boolean().default(false), importReviews: z.boolean().default(false), reviewsConfirmed: z.boolean().default(false) });
export const POST = (req: NextRequest) => handle(async () => {
  const body = requestSchema.parse(await req.json()); const sb = getServiceClient();
  if (body.importReviews && !body.reviewsConfirmed) throw new HttpError(400, "Confirm you have permission to show these reviews before importing them.");
  const { data, error } = await sb.from("websites").select("slug,name,business_details");
  if (error) throw new HttpError(500, `Could not check existing websites: ${error.message}`);
  const usedSlugs = new Set((data ?? []).map((w) => w.slug as string)); const known = data ?? [];
  const results: { name: string; status: "created" | "skipped" | "failed"; reason: string; id?: string; slug?: string }[] = [];
  for (const item of body.rows) {
    if (!item.selected) continue;
    const row = item.row as ImportCompany; const name = (row.name ?? "").trim();
    const placeId = (row.place_id ?? "").trim(); const phone = (row.phone ?? "").replace(/\D/g, "");
    const duplicate = known.find((w) => (placeId && w.business_details?.importSource?.placeId === placeId) || (name && phone.length >= 7 && String(w.name).toLowerCase() === name.toLowerCase() && String(w.business_details?.phone ?? "").replace(/\D/g, "") === phone));
    if (duplicate && !item.force) { results.push({ name, status: "skipped", reason: "Already imported" }); continue; }
    try {
      const base = slugify(item.slug || `${name}-${row.city ?? ""}`); let slug = base; let suffix = 2;
      while (usedSlugs.has(slug) || ["api", "login", "preview", "projects", "leads", "settings", "demo", "live"].includes(slug)) slug = `${base.slice(0, 54)}-${suffix++}`;
      const config = siteConfigSchema.parse(mapCompany(row, slug, body.showRating, body.importReviews));
      const saved = await saveWebsite(config, "publish"); usedSlugs.add(slug);
      results.push({ name: config.name, status: "created", reason: "Published automatically", id: saved.id, slug });
    } catch (error) { results.push({ name, status: "failed", reason: error instanceof Error ? error.message : "Could not publish website" }); }
  }
  return NextResponse.json({ results });
});
