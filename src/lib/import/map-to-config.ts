import { createDefaultConfig, uid } from "@/lib/defaults";
import type { SiteConfig } from "@/lib/schema";
import type { ImportCompany } from "./parse";

const clean = (v: string | undefined, max: number) => (v ?? "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, max);
export function slugify(value: string) { return value.normalize("NFKD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 55).replace(/-$/, "") || "solar-company"; }
export function mapCompany(row: ImportCompany, slug: string, showRating = false, importReviews = false): SiteConfig {
  const c = createDefaultConfig();
  const name = clean(row.name, 120);
  const city = clean(row.city, 100);
  c.name = name || "Solar Company"; c.slug = slug;
  // Imported company records have no verified installation portfolio.
  c.projects = [];
  c.business.name = name; c.business.description = clean(row.description, 1500);
  c.business.address = clean(row.street || row.address, 300); c.business.city = city;
  c.business.state = clean(row.state, 100); c.business.postalCode = clean(row.postal_code, 20); c.business.country = clean(row.country, 100);
  const digits = (row.phone ?? "").replace(/\D/g, "");
  c.business.phone = digits.length >= 7 ? clean(row.phone, 30) : "";
  c.business.whatsapp = c.business.phone.replace(/[\s()-]/g, "").slice(0, 30);
  const website = clean(row.website, 500); c.business.contactUrl = /^https?:\/\/[^\s]+$/i.test(website) ? website : "";
  const email = clean(row.email, 200); c.business.email = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) ? email : "";
  c.business.hours = clean(row.hours, 300);
  const lat = Number(row.latitude), lng = Number(row.longitude);
  c.business.latitude = row.latitude?.trim() !== "" && row.latitude !== undefined && Number.isFinite(lat) && lat >= -90 && lat <= 90 ? lat : null;
  c.business.longitude = row.longitude?.trim() !== "" && row.longitude !== undefined && Number.isFinite(lng) && lng >= -180 && lng <= 180 ? lng : null;
  c.business.importSource = { category: clean(row.category, 120), placeId: clean(row.place_id, 300), mapsUrl: /^https?:\/\//i.test(row.google_maps_url ?? "") ? clean(row.google_maps_url, 500) : "", listUrl: clean(row.source_list_url, 500), importedAt: new Date().toISOString(), rating: clean(row.rating, 20), reviewCount: clean(row.review_count, 20), plusCode: clean(row.plus_code, 100), attributes: clean(row.attributes, 1500), scrapedAt: clean(row.scraped_at, 40), searchQuery: clean(row.search_query, 200) };
  c.content.hero.headline = name ? `Solar solutions from ${name}`.slice(0, 140) : "Solar solutions for your property";
  c.content.hero.description = c.business.description.slice(0, 400);
  c.content.about.heading = name ? `About ${name}`.slice(0, 140) : "About Us";
  if (showRating && row.rating) { const rating = Number(row.rating); if (rating >= 0 && rating <= 5) c.content.hero.ratingLabel = `${rating}★ on Google${row.review_count ? ` (${row.review_count} reviews)` : ""}`.slice(0, 80); }
  if (importReviews && row.reviews) {
    try {
      const reviews: unknown = JSON.parse(row.reviews);
      if (Array.isArray(reviews)) c.testimonials = reviews.flatMap((entry: unknown) => {
        if (!entry || typeof entry !== "object") return [];
        const review = entry as Record<string, unknown>; const reviewText = clean(typeof review.text === "string" ? review.text : "", 800);
        const reviewRating = Number(review.rating); const author = clean(typeof review.author === "string" ? review.author : "", 100);
        if (!reviewText || !author || !Number.isFinite(reviewRating) || reviewRating < 4 || reviewRating > 5) return [];
        return [{ id: uid(), customerName: author, text: reviewText, photo: { path: "", alt: "" }, company: "", location: "", rating: Math.round(reviewRating), sourceUrl: /^https?:\/\//i.test(row.google_maps_url ?? "") ? clean(row.google_maps_url, 500) : "", visible: true }];
      }).slice(0, 6);
    } catch { /* malformed review data is ignored */ }
  }
  const attrText = `${row.attributes ?? ""} ${row.description ?? ""}`.toLowerCase();
  const category = `${row.category ?? ""}`.toLowerCase();
  const serviceNames = category.includes("solar") ? ["Rooftop Solar Installation", "Residential Solar Systems", "Commercial Solar Systems", "Solar System Consultation", "Solar Maintenance & Support"] : [];
  const fromAttributes = serviceNames.filter((s) => attrText.includes(s.toLowerCase().split(" ")[0]));
  const services = fromAttributes.length ? fromAttributes : serviceNames;
  c.services = services.map((service) => ({ id: uid(), name: service, description: "", details: "", image: { path: "", alt: "" }, icon: "sun", priceLabel: "", ctaLabel: "Get a Quote", ctaUrl: "contact", visible: true }));
  if (city && name) c.seo.title = `${name} | ${clean(row.category, 40) || "Solar"} in ${city}`.slice(0, 70);
  // Imported sites are text-first. Never carry template or imported image paths into generated pages.
  c.business.logo = { path: "", alt: "" }; c.business.favicon = { path: "", alt: "" }; c.seo.ogImage = { path: "", alt: "" };
  c.content.hero.image = { path: "", alt: "" }; c.content.hero.background = { path: "", alt: "" }; c.content.about.image = { path: "", alt: "" }; c.content.about.imageSecondary = { path: "", alt: "" };
  c.content.faq.background = { path: "", alt: "" }; c.content.cta.background = { path: "", alt: "" }; c.content.footer.background = { path: "", alt: "" };
  c.content.benefits.items.forEach((item) => { item.image = { path: "", alt: "" }; });
  c.content.why.items.forEach((item) => { item.image = { path: "", alt: "" }; });
  return c;
}
