import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handle } from "@/lib/api";
import { getWebsiteBySlug, insertLead } from "@/lib/db";
import { validateLead } from "@/lib/lead";
import { HttpError } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Best-effort in-memory limiter. On serverless hosts each instance has its own memory:
// for stronger protection add a shared store (Upstash/Redis) or a CAPTCHA.
const hits = new Map<string, number[]>();
function limited(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const arr = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(key, arr);
  if (hits.size > 5000) hits.clear();
  return arr.length > max;
}

const body = z.object({
  slug: z.string().max(80), source: z.enum(["hero", "final_cta"]),
  values: z.record(z.string().max(2000)), hp: z.string().max(200).optional(), elapsedMs: z.number().optional(),
});

export const POST = (req: NextRequest) =>
  handle(async () => {
    if (!req.headers.get("content-type")?.includes("application/json")) throw new HttpError(415, "Expected JSON");
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    if (limited(`ip:${ip}`, 5, 10 * 60_000)) throw new HttpError(429, "Too many requests. Please try again in a few minutes.");
    const b = body.parse(await req.json());
    // bots: honeypot filled or form submitted impossibly fast. Pretend success, store nothing.
    if (b.hp || (b.elapsedMs !== undefined && b.elapsedMs < 1200)) return NextResponse.json({ ok: true });
    if (limited(`site:${b.slug}`, 60, 10 * 60_000)) throw new HttpError(429, "This form is receiving a lot of traffic. Please try again shortly.");
    const site = await getWebsiteBySlug(b.slug); // published sites only
    if (!site) throw new HttpError(404, "This website is not accepting requests.");
    const cfg = b.source === "hero" ? site.content.hero.form : site.content.cta.form;
    const { errors, clean } = validateLead(b.values, cfg);
    if (Object.keys(errors).length) throw new HttpError(422, "Please check the highlighted fields.", errors);
    await insertLead(site.id, b.source, clean);
    return NextResponse.json({ ok: true }); // only reached after the database confirmed the insert
  });
