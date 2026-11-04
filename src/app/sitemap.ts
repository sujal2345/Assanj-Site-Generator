import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/base-url";
import { getWebsiteBySlug, listWebsites } from "@/lib/db";
import { contentSlug } from "@/lib/content-slug";
import { activeSections } from "@/lib/site-utils";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (!isSupabaseConfigured()) return [];
  try {
    const base = getBaseUrl();
    const websites = await listWebsites(true);
    const entries: MetadataRoute.Sitemap = [];
    for (const w of websites) {
      const site = await getWebsiteBySlug(w.slug);
      if (!site) continue;
      const root = `${base}/site/${w.slug}`;
      entries.push({ url: root, lastModified: w.updatedAt });
      const pageBySection: Record<string, string> = { about: "about", benefits: "benefits", why: "why-us", process: "process", testimonials: "testimonials", faq: "faq", cta: "contact" };
      for (const [section, page] of Object.entries(pageBySection)) {
        if (activeSections(site).includes(section as keyof typeof site.sectionEnabled)) entries.push({ url: `${root}/${page}`, lastModified: w.updatedAt });
      }
      const services = site.services.filter((x) => x.visible && x.name.trim());
      if (services.length) entries.push({ url: `${root}/services`, lastModified: w.updatedAt });
      services.forEach((service) => entries.push({ url: `${root}/services/${contentSlug(service.name)}`, lastModified: w.updatedAt }));
      const projects = site.projects.filter((x) => x.visible && x.name.trim());
      if (projects.length) entries.push({ url: `${root}/projects`, lastModified: w.updatedAt });
      projects.forEach((project) => entries.push({ url: `${root}/projects/${contentSlug(project.name)}`, lastModified: w.updatedAt }));
    }
    return entries;
  } catch {
    return [];
  }
}
