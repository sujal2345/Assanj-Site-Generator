import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ServiceDetail } from "@/components/site/DetailPage";
import { SiteShell } from "@/components/site/SiteRenderer";
import { ADMIN_COOKIE, isAdminCookie } from "@/lib/auth";
import { contentSlug } from "@/lib/content-slug";
import { getWebsiteBySlug } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
async function load(slug: string, serviceSlug: string) {
  if (!isSupabaseConfigured()) return null;
  const admin = await isAdminCookie(cookies().get(ADMIN_COOKIE)?.value);
  const site = await getWebsiteBySlug(slug, admin);
  if (!site || (site.status !== "published" && !admin)) return null;
  const service = site.services.find((s) => s.visible && contentSlug(s.name) === serviceSlug);
  return service ? { site, service } : null;
}
export async function generateMetadata({ params }: { params: { slug: string; serviceSlug: string } }): Promise<Metadata> {
  const data = await load(params.slug, params.serviceSlug);
  return data ? { title: `${data.service.name} | ${data.site.business.name || data.site.name}`, description: data.service.description, openGraph: { title: data.service.name, description: data.service.description, type: "website" } } : { title: "Not found", robots: { index: false } };
}
export default async function ServicePage({ params }: { params: { slug: string; serviceSlug: string } }) {
  const data = await load(params.slug, params.serviceSlug);
  if (!data) notFound();
  return <SiteShell config={data.site} mode={data.site.status === "published" ? "public" : "preview"}><ServiceDetail c={data.site} service={data.service}/></SiteShell>;
}
