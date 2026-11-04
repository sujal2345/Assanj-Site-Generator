import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ServiceIndex } from "@/components/site/DetailPage";
import { SiteShell } from "@/components/site/SiteRenderer";
import { ADMIN_COOKIE, isAdminCookie } from "@/lib/auth";
import { getWebsiteBySlug } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
async function load(slug: string) {
  if (!isSupabaseConfigured()) return null;
  const admin = await isAdminCookie(cookies().get(ADMIN_COOKIE)?.value);
  const site = await getWebsiteBySlug(slug, admin);
  return site && (site.status === "published" || admin) ? site : null;
}
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const site = await load(params.slug);
  return site ? { title: `Services | ${site.business.name || site.name}`, description: site.content.services.description || site.business.tagline } : { title: "Not found", robots: { index: false } };
}
export default async function ServicesPage({ params }: { params: { slug: string } }) {
  const site = await load(params.slug);
  if (!site || !site.services.some((s) => s.visible && s.name.trim())) notFound();
  return <SiteShell config={site} mode={site.status === "published" ? "public" : "preview"} includeCta><ServiceIndex c={site}/></SiteShell>;
}
