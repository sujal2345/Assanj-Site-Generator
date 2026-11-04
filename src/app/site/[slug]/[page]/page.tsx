import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { SiteRenderer } from "@/components/site/SiteRenderer";
import { ADMIN_COOKIE, isAdminCookie } from "@/lib/auth";
import { getWebsiteBySlug } from "@/lib/db";
import type { SectionType, SiteConfig } from "@/lib/schema";
import { activeSections } from "@/lib/site-utils";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
const PAGE_SECTIONS: Record<string, SectionType> = {
  about: "about", benefits: "benefits", "why-us": "why", process: "process",
  testimonials: "testimonials", faq: "faq", contact: "cta",
};
function heading(site: SiteConfig, section: SectionType) {
  if (section === "about") return site.content.about.heading || "About us";
  if (section === "benefits") return site.content.benefits.heading || "Benefits of solar";
  if (section === "why") return site.content.why.heading || "Why choose us";
  if (section === "process") return site.content.process.heading || "Our process";
  if (section === "testimonials") return site.content.testimonials.heading || "Customer stories";
  if (section === "faq") return site.content.faq.heading || "Frequently asked questions";
  return site.content.cta.heading || "Contact us";
}
async function load(slug: string) {
  if (!isSupabaseConfigured()) return null;
  const admin = await isAdminCookie(cookies().get(ADMIN_COOKIE)?.value);
  const site = await getWebsiteBySlug(slug, admin);
  return site && (site.status === "published" || admin) ? site : null;
}
export async function generateMetadata({ params }: { params: { slug: string; page: string } }): Promise<Metadata> {
  const section = PAGE_SECTIONS[params.page];
  const site = await load(params.slug);
  if (!site || !section) return { title: "Not found", robots: { index: false } };
  return { title: `${heading(site, section)} | ${site.business.name || site.name}`, description: site.business.tagline || site.business.description.slice(0, 160) };
}
export default async function ContentPage({ params }: { params: { slug: string; page: string } }) {
  const section = PAGE_SECTIONS[params.page];
  const site = await load(params.slug);
  if (!site || !section || !activeSections(site).includes(section)) notFound();
  return <SiteRenderer config={site} mode={site.status === "published" ? "public" : "preview"} page={section}/>;
}
