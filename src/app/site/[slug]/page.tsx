import type { Metadata } from "next";
import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { SiteRenderer } from "@/components/site/SiteRenderer";
import { assetUrl } from "@/lib/assets";
import { ADMIN_COOKIE, isAdminCookie } from "@/lib/auth";
import { getBaseUrl } from "@/lib/base-url";
import { getWebsiteBySlug } from "@/lib/db";
import type { SiteConfig } from "@/lib/schema";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

async function fetchSite(slug: string) {
  if (!isSupabaseConfigured() || !/^[a-z0-9-]{3,60}$/.test(slug)) return null;
  const admin = await isAdminCookie(cookies().get(ADMIN_COOKIE)?.value);
  const site = await getWebsiteBySlug(slug, admin); // admins can open drafts; the public only sees published sites
  return site ? { site, admin } : null;
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const r = await fetchSite(params.slug);
  if (!r) return { title: "Not found", robots: { index: false } };
  const { site } = r;
  const published = site.status === "published";
  const title = site.seo.title || site.business.name || site.name;
  const description = site.seo.description || site.business.tagline || site.business.description.slice(0, 160);
  const canonical = site.seo.canonical || `${getBaseUrl()}/site/${site.slug}`;
  const og = assetUrl(site.seo.ogImage.path);
  const fav = assetUrl(site.business.favicon.path);
  return {
    title, description, alternates: { canonical },
    robots: published ? { index: true, follow: true } : { index: false, follow: false },
    openGraph: { title: site.seo.ogTitle || title, description: site.seo.ogDescription || description, url: canonical, type: "website", ...(og ? { images: [{ url: og }] } : {}) },
    twitter: { card: og ? "summary_large_image" : "summary", title: site.seo.ogTitle || title, description: site.seo.ogDescription || description },
    ...(fav ? { icons: { icon: fav } } : {}),
  };
}

function jsonLd(site: SiteConfig, url: string) {
  const b = site.business;
  const social = [b.facebook, b.instagram, b.linkedin, b.youtube].filter(Boolean);
  const hasAddress = b.address || b.city;
  const data: Record<string, unknown> = {
    "@context": "https://schema.org", "@type": "LocalBusiness", name: b.name || site.name, url,
    ...(b.phone ? { telephone: b.phone } : {}), ...(b.email ? { email: b.email } : {}),
    ...(b.description ? { description: b.description.slice(0, 300) } : {}),
    ...(assetUrl(b.logo.path) ? { logo: assetUrl(b.logo.path), image: assetUrl(b.logo.path) } : {}),
    ...(hasAddress ? { address: { "@type": "PostalAddress", ...(b.address ? { streetAddress: b.address } : {}), ...(b.city ? { addressLocality: b.city } : {}), ...(b.state ? { addressRegion: b.state } : {}), ...(b.postalCode ? { postalCode: b.postalCode } : {}), ...(b.country ? { addressCountry: b.country } : {}) } } : {}),
    ...(social.length ? { sameAs: social } : {}),
  };
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export default async function SitePage({ params }: { params: { slug: string } }) {
  const r = await fetchSite(params.slug);
  if (!r) notFound();
  const { site } = r;
  const published = site.status === "published";
  if (!published && !r.admin) notFound();
  const url = site.seo.canonical || `${getBaseUrl()}/site/${site.slug}`;
  return (
    <>
      {published && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(site, url) }} />}
      <SiteRenderer config={site} mode={published ? "public" : "preview"} banner={published ? undefined : "Draft: only you can see this page. Publish it from the generator to make it public."} />
    </>
  );
}
