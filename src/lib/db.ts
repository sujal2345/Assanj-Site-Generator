import { BUCKET } from "./assets";
import { uid } from "./defaults";
import { SECTION_TYPES, SECTION_LABELS, SiteConfig, SectionType } from "./schema";
import { getServiceClient, HttpError } from "./supabase/server";

type Row = Record<string, any>;
const OWNER_ID: string | null = null; // single-admin mode. Replace with the signed-in user's id when auth is added.

export type WebsiteSummary = { id: string; name: string; slug: string; status: "draft" | "published"; city: string; phone: string; whatsapp: string; country: string; createdAt: string; updatedAt: string };

function fail(error: { message: string; code?: string } | null, what: string): asserts error is null {
  if (!error) return;
  if (error.code === "23505") throw new HttpError(409, "That slug is already used by another website.");
  if (error.message === "forbidden") throw new HttpError(403, "You do not have access to this website.");
  if (error.code === "42501") {
    throw new HttpError(503, "Supabase denied access to the website tables. Check that SUPABASE_SERVICE_ROLE_KEY is the service_role secret (not the anon key), then run the updated supabase/migrations/0001_init.sql migration.");
  }
  if (["PGRST202", "PGRST204", "42P01", "42703"].includes(error.code ?? "")) {
    throw new HttpError(503, "The Supabase database schema is missing or out of date. Run supabase/migrations/0001_init.sql in the Supabase SQL Editor, then retry.");
  }
  throw new HttpError(500, `${what}: ${error.message}`);
}

/* ---------------------------------------------------------- mapping */
function toPayload(c: SiteConfig, status: "draft" | "published") {
  const ord = (i: number) => i;
  const sections: { section_type: string; title: string; content: unknown; is_enabled: boolean; display_order: number }[] = c.sectionOrder.map((type, i) => ({
    section_type: type, title: SECTION_LABELS[type], content: (c.content as Row)[type] ?? {}, is_enabled: c.sectionEnabled[type], display_order: i,
  }));
  // footer settings are stored as a pseudo-section so they persist with the other section content
  sections.push({ section_type: "footer", title: "Footer", content: c.content.footer, is_enabled: true, display_order: 99 });
  return {
    website: {
      id: c.id, owner_id: OWNER_ID, name: c.name, slug: c.slug, status,
      business_details: c.business, theme_config: c.theme, layout_config: c.layout, seo_config: c.seo, section_order: c.sectionOrder,
    },
    navigation: [
      ...c.navigation.map((n, i) => ({ id: n.id, label: n.label, destination: n.destination, link_type: n.linkType, is_visible: n.visible, display_order: ord(i) })),
      { id: uid(), label: c.navCta.label, destination: c.navCta.destination, link_type: "cta", is_visible: c.navCta.visible, display_order: 999 },
    ],
    sections,
    services: c.services.map((s, i) => ({ id: s.id, name: s.name, description: s.description, details: s.details, image_path: s.image.path, image_alt: s.image.alt, icon: s.icon, price_label: s.priceLabel, cta_label: s.ctaLabel, cta_url: s.ctaUrl, is_visible: s.visible, display_order: i })),
    projects: c.projects.map((p, i) => ({ id: p.id, name: p.name, description: p.description, location: p.location, category: p.category, image_paths: p.images, metadata: { capacity: p.capacity, completedAt: p.completedAt, results: p.results }, is_visible: p.visible, display_order: i })),
    testimonials: c.testimonials.map((t, i) => ({ id: t.id, customer_name: t.customerName, testimonial: t.text, photo_path: t.photo.path, photo_alt: t.photo.alt, company: t.company, location: t.location, rating: t.rating, source_url: t.sourceUrl, is_visible: t.visible, display_order: i })),
    faqs: c.faqs.map((f, i) => ({ id: f.id, question: f.question, answer: f.answer, is_visible: f.visible, display_order: i })),
  };
}

async function load(where: (q: any) => any): Promise<SiteConfig | null> {
  const sb = getServiceClient();
  const { data: w, error } = await where(sb.from("websites").select("*")).maybeSingle();
  fail(error, "Could not load website");
  if (!w) return null;
  const ordered = (t: string) => sb.from(t).select("*").eq("website_id", w.id).order("display_order");
  const [nav, sec, svc, prj, tst, faq] = await Promise.all([
    ordered("website_navigation"), ordered("website_sections"), ordered("website_services"),
    ordered("website_projects"), ordered("website_testimonials"), ordered("website_faqs"),
  ]);
  for (const r of [nav, sec, svc, prj, tst, faq]) fail(r.error, "Could not load website data");

  const sectionRows = (sec.data ?? []) as Row[];
  const content: Row = {};
  const enabled: Row = {};
  for (const s of sectionRows) {
    content[s.section_type] = s.content;
    enabled[s.section_type] = s.is_enabled;
  }
  const order = ((w.section_order as SectionType[]) ?? []).filter((t) => (SECTION_TYPES as readonly string[]).includes(t));
  for (const t of SECTION_TYPES) if (!order.includes(t)) order.push(t);
  const navRows = (nav.data ?? []) as Row[];
  const cta = navRows.find((n) => n.link_type === "cta");
  const img = (path: string, alt: string) => ({ path: path ?? "", alt: alt ?? "" });

  return {
    id: w.id, name: w.name, slug: w.slug, status: w.status, updatedAt: w.updated_at,
    business: { latitude: null, longitude: null, ...w.business_details }, seo: w.seo_config, theme: w.theme_config, layout: w.layout_config,
    navigation: navRows.filter((n) => n.link_type !== "cta").map((n) => ({ id: n.id, label: n.label, destination: n.destination, linkType: n.link_type, visible: n.is_visible })),
    navCta: cta ? { label: cta.label, destination: cta.destination, linkType: /^https?:/i.test(cta.destination) ? "external" : "section", visible: cta.is_visible } : { label: "", destination: "", linkType: "section", visible: false },
    sectionOrder: order, sectionEnabled: enabled as SiteConfig["sectionEnabled"],
    content: { ...content, footer: content.footer } as SiteConfig["content"],
    services: ((svc.data ?? []) as Row[]).map((s) => ({ id: s.id, name: s.name, description: s.description, details: s.details, image: img(s.image_path, s.image_alt), icon: s.icon, priceLabel: s.price_label, ctaLabel: s.cta_label, ctaUrl: s.cta_url, visible: s.is_visible })),
    projects: ((prj.data ?? []) as Row[]).map((p) => ({ id: p.id, name: p.name, description: p.description, location: p.location, category: p.category, images: p.image_paths ?? [], capacity: p.metadata?.capacity ?? "", completedAt: p.metadata?.completedAt ?? "", results: p.metadata?.results ?? "", visible: p.is_visible })),
    testimonials: ((tst.data ?? []) as Row[]).map((t) => ({ id: t.id, customerName: t.customer_name, text: t.testimonial, photo: img(t.photo_path, t.photo_alt), company: t.company, location: t.location, rating: t.rating ?? 0, sourceUrl: t.source_url, visible: t.is_visible })),
    faqs: ((faq.data ?? []) as Row[]).map((f) => ({ id: f.id, question: f.question, answer: f.answer, visible: f.is_visible })),
  };
}

/* ------------------------------------------------------------ queries */
export const getWebsiteById = (id: string) => load((q) => q.eq("id", id));
export const getWebsiteBySlug = (slug: string, includeDrafts = false) =>
  load((q) => (includeDrafts ? q.eq("slug", slug) : q.eq("slug", slug).eq("status", "published")));

export async function listWebsites(onlyPublished = false): Promise<WebsiteSummary[]> {
  const sb = getServiceClient();
  const pageSize = 1000;
  const rows: Row[] = [];
  for (let start = 0; ; start += pageSize) {
    let q = sb.from("websites").select("id,name,slug,status,business_details,created_at,updated_at").order("updated_at", { ascending: false }).order("id", { ascending: true }).range(start, start + pageSize - 1);
    if (onlyPublished) q = q.eq("status", "published");
    const { data, error } = await q;
    fail(error, "Could not list websites");
    const page = (data ?? []) as Row[];
    rows.push(...page);
    if (page.length < pageSize) break;
  }
  return rows.map((w) => ({ id: w.id, name: w.business_details?.name || w.name, slug: w.slug, status: w.status, city: w.business_details?.city ?? "", phone: String(w.business_details?.phone ?? ""), whatsapp: String(w.business_details?.whatsapp ?? ""), country: String(w.business_details?.countryCode ?? w.business_details?.country_code ?? w.business_details?.country ?? ""), createdAt: w.created_at, updatedAt: w.updated_at }));
}

export async function saveWebsite(config: SiteConfig, action: "draft" | "generate" | "publish" | "unpublish") {
  const sb = getServiceClient();
  const { data: ex, error: e1 } = await sb.from("websites").select("status,owner_id").eq("id", config.id).maybeSingle();
  fail(e1, "Could not check website");
  if (ex && ex.owner_id !== OWNER_ID) throw new HttpError(403, "You do not have access to this website.");
  // never trust client-supplied status: only the explicit publish/unpublish actions change it
  const status = action === "publish" ? "published" : action === "unpublish" ? "draft" : ex?.status ?? "draft";
  const { error } = await sb.rpc("save_website", { p: toPayload(config, status) });
  fail(error, "Could not save website");
  const saved = await getWebsiteById(config.id);
  if (!saved) throw new HttpError(500, "Website saved but could not be reloaded.");
  return saved;
}

async function listObjects(sb: ReturnType<typeof getServiceClient>, prefix: string): Promise<string[]> {
  const out: string[] = [];
  const { data } = await sb.storage.from(BUCKET).list(prefix, { limit: 1000 });
  for (const item of data ?? []) {
    const p = `${prefix}/${item.name}`;
    if (item.id) out.push(p);
    else out.push(...(await listObjects(sb, p)));
  }
  return out;
}

export async function deleteWebsite(id: string) {
  const sb = getServiceClient();
  const { data, error } = await sb.from("websites").select("id,owner_id").eq("id", id).maybeSingle();
  fail(error, "Could not find website");
  if (!data) throw new HttpError(404, "Website not found.");
  if (data.owner_id !== OWNER_ID) throw new HttpError(403, "You do not have access to this website.");
  const del = await sb.from("websites").delete().eq("id", id);
  fail(del.error, "Could not delete website");
  const files = await listObjects(sb, `websites/${id}`).catch(() => []);
  if (files.length) await sb.storage.from(BUCKET).remove(files);
}

export async function duplicateWebsite(id: string) {
  const sb = getServiceClient();
  const src = await getWebsiteById(id);
  if (!src) throw new HttpError(404, "Website not found.");
  const newId = uid();
  const oldPrefix = `websites/${id}/`;
  const newPrefix = `websites/${newId}/`;
  // copy storage objects so the duplicate never depends on the original's files
  const files = await listObjects(sb, `websites/${id}`).catch(() => [] as string[]);
  for (const f of files) await sb.storage.from(BUCKET).copy(f, f.replace(oldPrefix, newPrefix));
  let json = JSON.stringify(src).split(oldPrefix).join(newPrefix);
  const copy = JSON.parse(json) as SiteConfig;
  json = "";
  // fresh ids for every child record (they are primary keys)
  copy.id = newId;
  copy.navigation.forEach((x) => (x.id = uid()));
  copy.services.forEach((x) => (x.id = uid()));
  copy.projects.forEach((x) => (x.id = uid()));
  copy.testimonials.forEach((x) => (x.id = uid()));
  copy.faqs.forEach((x) => (x.id = uid()));
  const c = copy.content;
  [c.hero.trust, c.about.stats, c.about.highlights, c.benefits.items, c.why.items, c.process.steps, c.cta.bullets, c.floating.actions].forEach((arr) => (arr as { id: string }[]).forEach((x) => (x.id = uid())));
  copy.name = `${src.name} (copy)`;
  const base = `${src.slug}-copy`.slice(0, 54);
  const { data: taken } = await sb.from("websites").select("slug").like("slug", `${base}%`);
  const used = new Set((taken ?? []).map((r: Row) => r.slug));
  let slug = base;
  for (let n = 2; used.has(slug); n++) slug = `${base}-${n}`;
  copy.slug = slug;
  return saveWebsite(copy, "draft");
}

/* -------------------------------------------------------------- leads */
export async function insertLead(websiteId: string, source: "hero" | "final_cta", v: Record<string, string | undefined>) {
  const sb = getServiceClient();
  const since = new Date(Date.now() - 2 * 60_000).toISOString();
  if (v.phone) {
    const { data } = await sb.from("website_leads").select("id").eq("website_id", websiteId).eq("phone", v.phone).gte("created_at", since).limit(1);
    if (data?.length) return; // duplicate submit within 2 minutes: already stored
  }
  const { error } = await sb.from("website_leads").insert({
    website_id: websiteId, name: v.name ?? "", phone: v.phone ?? null, email: v.email ?? null, property_type: v.propertyType ?? null,
    monthly_bill: v.monthlyBill ? Number(v.monthlyBill) : null, postal_code: v.postalCode ?? null, city: v.city ?? null,
    service_interest: v.serviceInterest ?? null, message: v.message ?? null, source,
  });
  fail(error, "Could not save your request");
}

export type LeadRow = { id: string; name: string; phone: string | null; email: string | null; websiteName: string; source: string; createdAt: string; propertyType: string | null; monthlyBill: number | null };
export async function listLeads(limit = 200): Promise<LeadRow[]> {
  const sb = getServiceClient();
  const { data, error } = await sb.from("website_leads").select("id,name,phone,email,source,created_at,property_type,monthly_bill,websites(name)").order("created_at", { ascending: false }).limit(limit);
  fail(error, "Could not load leads");
  return ((data ?? []) as Row[]).map((l) => ({ id: l.id, name: l.name, phone: l.phone, email: l.email, websiteName: l.websites?.name ?? "—", source: l.source, createdAt: l.created_at, propertyType: l.property_type, monthlyBill: l.monthly_bill }));
}
