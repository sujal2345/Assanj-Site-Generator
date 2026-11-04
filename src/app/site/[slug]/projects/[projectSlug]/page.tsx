import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { ProjectDetail } from "@/components/site/DetailPage";
import { SiteShell } from "@/components/site/SiteRenderer";
import { ADMIN_COOKIE, isAdminCookie } from "@/lib/auth";
import { contentSlug } from "@/lib/content-slug";
import { getWebsiteBySlug } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
async function load(slug: string, projectSlug: string) {
  if (!isSupabaseConfigured()) return null;
  const admin = await isAdminCookie(cookies().get(ADMIN_COOKIE)?.value);
  const site = await getWebsiteBySlug(slug, admin);
  if (!site || (site.status !== "published" && !admin)) return null;
  const project = site.projects.find((p) => p.visible && contentSlug(p.name) === projectSlug);
  return project ? { site, project } : null;
}
export async function generateMetadata({ params }: { params: { slug: string; projectSlug: string } }): Promise<Metadata> {
  const data = await load(params.slug, params.projectSlug);
  return data ? { title: `${data.project.name} | ${data.site.business.name || data.site.name}`, description: data.project.description } : { title: "Not found", robots: { index: false } };
}
export default async function ProjectPage({ params }: { params: { slug: string; projectSlug: string } }) {
  const data = await load(params.slug, params.projectSlug);
  if (!data) notFound();
  return <SiteShell config={data.site} mode={data.site.status === "published" ? "public" : "preview"} includeCta><ProjectDetail c={data.site} project={data.project}/></SiteShell>;
}
