import { z } from "zod";

export const SECTION_TYPES = [
  "hero", "about", "services", "benefits", "why", "process",
  "projects", "testimonials", "faq", "cta", "floating",
] as const;
export type SectionType = (typeof SECTION_TYPES)[number];

export const SECTION_LABELS: Record<SectionType, string> = {
  hero: "Hero + quote form + trust strip",
  about: "About Us (+ savings calculator)",
  services: "Our Services",
  benefits: "Benefits of Solar",
  why: "Why Choose Us",
  process: "Our Process",
  projects: "Projects & Installations",
  testimonials: "Testimonials",
  faq: "FAQ",
  cta: "Final CTA + form",
  floating: "Floating contact CTA",
};

/** id used for in-page anchors; hero is "home", cta is "contact" */
export const SECTION_ANCHORS: Record<SectionType, string> = {
  hero: "home", about: "about", services: "services", benefits: "benefits", why: "why-us",
  process: "process", projects: "projects", testimonials: "testimonials", faq: "faq",
  cta: "contact", floating: "floating",
};

export const FIELD_KEYS = [
  "name", "phone", "email", "propertyType", "monthlyBill", "postalCode", "city", "serviceInterest", "message",
] as const;
export type FieldKey = (typeof FIELD_KEYS)[number];
export const PROPERTY_TYPES = ["Residential", "Commercial", "Industrial", "Other"] as const;

const text = (max = 2000) => z.string().max(max, `Max ${max} characters`);
const optUrl = z
  .string()
  .max(500)
  .refine((v) => v === "" || /^https?:\/\/[^\s]+$/i.test(v), "Enter a full URL starting with https://");
/** section id ("services"), http(s) URL, tel:, mailto:, or #hash — never javascript: */
const dest = z
  .string()
  .max(500)
  .refine((v) => v === "" || /^(https?:\/\/[^\s]+|tel:[+\d\s-]+|mailto:[^\s]+|#[\w-]+|[a-z0-9-]+)$/i.test(v), "Use a section id or a full URL");

export const imageSchema = z.object({ path: z.string().max(600), alt: text(200) });
export type ImageRef = z.infer<typeof imageSchema>;

const cta = z.object({ label: text(60), destination: dest });
const iconItem = z.object({ icon: text(40), label: text(120) });

const formField = z.object({ enabled: z.boolean(), required: z.boolean(), label: text(60) });
export const quoteFormSchema = z.object({
  title: text(120), subtitle: text(300), submitLabel: text(40), successMessage: text(300), privacyNote: text(160),
  fields: z.object(Object.fromEntries(FIELD_KEYS.map((k) => [k, formField])) as Record<FieldKey, typeof formField>),
});
export type QuoteFormConfig = z.infer<typeof quoteFormSchema>;

const color = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a 6-digit HEX color");
export const COLOR_KEYS = [
  "primary", "secondary", "accent", "background", "surface", "heading", "body", "buttonText", "border", "navbar", "footer",
] as const;
export type ColorKey = (typeof COLOR_KEYS)[number];

const itemBase = { id: z.string().uuid() };

export const siteConfigSchema = z.object({
  id: z.string().uuid(),
  name: z.string().trim().min(1, "Required").max(120),
  slug: z.string().trim().min(3, "At least 3 characters").max(60)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Lowercase letters, numbers and single hyphens only")
    .refine((s) => !["api", "login", "preview", "projects", "leads", "settings", "demo", "live"].includes(s), "This slug is reserved"),
  status: z.enum(["draft", "published"]),
  updatedAt: z.string().optional(),
  business: z.object({
    name: text(120), tagline: text(160), description: text(1500), established: z.string().max(4).refine((v) => v === "" || /^(19|20)\d{2}$/.test(v), "Enter a 4-digit year"),
    phone: z.string().max(30).refine((v) => v === "" || /^\+?[\d\s()-]{7,20}$/.test(v), "Enter a valid phone number"),
    email: z.string().max(200).refine((v) => v === "" || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v), "Enter a valid email"),
    address: text(300), city: text(100), state: text(100), postalCode: text(20), country: text(100), hours: text(300),
    latitude: z.number().min(-90).max(90).nullable(), longitude: z.number().min(-180).max(180).nullable(),
    importSource: z.object({ category: text(120), placeId: text(300), mapsUrl: optUrl, listUrl: text(500), importedAt: text(40), rating: text(20), reviewCount: text(20), plusCode: text(100), attributes: text(1500), scrapedAt: text(40), searchQuery: text(200) }).optional(),
    whatsapp: z.string().max(30).refine((v) => v === "" || /^\+?\d{7,15}$/.test(v.replace(/[\s()-]/g, "")), "Digits with country code, e.g. 919876543210"),
    contactUrl: optUrl, facebook: optUrl, instagram: optUrl, linkedin: optUrl, youtube: optUrl,
    logo: imageSchema, favicon: imageSchema,
  }),
  seo: z.object({ title: text(70), description: text(180), canonical: optUrl, ogTitle: text(70), ogDescription: text(200), ogImage: imageSchema }),
  navigation: z.array(z.object({
    id: z.string().uuid(), label: text(40), destination: dest, linkType: z.enum(["section", "external"]), visible: z.boolean(),
  })).max(12),
  navCta: z.object({ label: text(40), destination: dest, linkType: z.enum(["section", "external"]), visible: z.boolean() }),
  theme: z.object({
    preset: text(40),
    colors: z.object(Object.fromEntries(COLOR_KEYS.map((k) => [k, color])) as Record<ColorKey, typeof color>),
    typography: z.object({
      headingFont: text(40), bodyFont: text(40), headingWeight: z.enum(["500", "600", "700"]),
      baseSize: z.number().min(14).max(20), headingScale: z.number().min(0.85).max(1.3),
      buttonStyle: z.enum(["solid", "gradient", "outline"]), radius: z.number().min(0).max(32),
    }),
  }),
  layout: z.object({
    maxWidth: z.number().min(960).max(1600),
    sectionSpacing: z.enum(["compact", "comfortable", "spacious"]),
    cardStyle: z.enum(["flat", "bordered", "elevated"]),
    imageRadius: z.number().min(0).max(40),
    buttonShape: z.enum(["square", "rounded", "pill"]),
    headerStyle: z.enum(["shadow", "border"]),
  }),
  sectionOrder: z.array(z.enum(SECTION_TYPES)),
  sectionEnabled: z.object(Object.fromEntries(SECTION_TYPES.map((k) => [k, z.boolean()])) as Record<SectionType, z.ZodBoolean>),
  content: z.object({
    hero: z.object({
      layout: z.enum(["background", "overlay", "split", "image-right"]),
      eyebrow: text(80), headline: text(140), highlight: text(60), description: text(400),
      image: imageSchema, background: imageSchema, videoUrl: optUrl,
      primaryCta: cta, secondaryCta: cta, ratingLabel: text(80),
      showForm: z.boolean(), form: quoteFormSchema,
      trust: z.array(z.object({ id: z.string().uuid(), icon: text(40), value: text(40), label: text(60), image: imageSchema })).max(8),
    }),
    about: z.object({
      eyebrow: text(60), heading: text(140), description: text(1200), layout: z.enum(["image-right", "image-left"]),
      image: imageSchema, imageSecondary: imageSchema, imageBadge: text(60), yearsExperience: text(20),
      stats: z.array(z.object({ id: z.string().uuid(), value: text(30), label: text(60) })).max(6),
      highlights: z.array(z.object({ id: z.string().uuid() }).merge(iconItem)).max(6),
      ctaLabel: text(40), ctaLink: dest,
      calculator: z.object({
        enabled: z.boolean(), title: text(80), description: text(200), currency: text(5),
        defaultBill: z.number().min(0).max(10_000_000), ratePerUnit: z.number().min(0).max(1000), fixedCharge: z.number().min(0).max(1_000_000),
        offsetMinPct: z.number().min(0).max(100), offsetMaxPct: z.number().min(0).max(100),
        region: text(80), roofNote: text(200),
      }),
    }),
    services: z.object({ eyebrow: text(60), heading: text(140), description: text(300), layout: z.enum(["image-cards", "icon-cards", "horizontal", "featured"]) }),
    benefits: z.object({
      eyebrow: text(60), heading: text(140), description: text(300), decoration: z.boolean(),
      items: z.array(z.object({ id: z.string().uuid(), icon: text(40), heading: text(80), description: text(300), image: imageSchema })).max(8),
    }),
    why: z.object({
      eyebrow: text(60), heading: text(140), description: text(300),
      items: z.array(z.object({ id: z.string().uuid(), icon: text(40), heading: text(80), description: text(300), image: imageSchema })).max(8),
    }),
    process: z.object({
      eyebrow: text(60), heading: text(140), description: text(300),
      steps: z.array(z.object({ id: z.string().uuid(), title: text(60), description: text(240) })).max(8),
    }),
    projects: z.object({ eyebrow: text(60), heading: text(140), description: text(300), showFilter: z.boolean() }),
    testimonials: z.object({ eyebrow: text(60), heading: text(140), layout: z.enum(["carousel", "grid"]) }),
    faq: z.object({ eyebrow: text(60), heading: text(140), description: text(300), background: imageSchema }),
    cta: z.object({
      eyebrow: text(60), heading: text(140), description: text(400), background: imageSchema,
      bullets: z.array(z.object({ id: z.string().uuid() }).merge(iconItem)).max(5),
      buttonLabel: text(40), buttonLink: dest, showPhone: z.boolean(), form: quoteFormSchema,
    }),
    floating: z.object({
      actions: z.array(z.object({
        id: z.string().uuid(), type: z.enum(["call", "whatsapp", "quote", "custom"]), label: text(30), icon: text(40), destination: dest, visible: z.boolean(),
      })).max(4),
    }),
    footer: z.object({ description: text(300), privacyUrl: optUrl, termsUrl: optUrl, copyrightText: text(160), showHours: z.boolean(), background: imageSchema }),
  }),
  services: z.array(z.object({
    ...itemBase, name: text(100), description: text(300), details: text(3000), image: imageSchema, icon: text(40),
    priceLabel: text(60), ctaLabel: text(40), ctaUrl: dest, visible: z.boolean(),
  })).max(40),
  projects: z.array(z.object({
    ...itemBase, name: text(120), description: text(600), location: text(120), category: text(60),
    images: z.array(imageSchema).max(12), capacity: text(40), completedAt: text(40), results: text(300), visible: z.boolean(),
  })).max(100),
  testimonials: z.array(z.object({
    ...itemBase, customerName: text(100), text: text(800), photo: imageSchema, company: text(100), location: text(100),
    rating: z.number().int().min(0).max(5), sourceUrl: optUrl, visible: z.boolean(),
  })).max(100),
  faqs: z.array(z.object({ ...itemBase, question: text(200), answer: text(1500), visible: z.boolean() })).max(40),
});
export type SiteConfig = z.infer<typeof siteConfigSchema>;

/** Optional completeness checklist; generation uses template fallbacks instead of blocking on these fields. */
export function generationIssues(c: SiteConfig): { path: string; message: string }[] {
  const out: { path: string; message: string }[] = [];
  const add = (path: string, message: string) => out.push({ path, message });
  if (!c.business.name.trim()) add("business.name", "Business name is required");
  if (!c.business.tagline.trim() && !c.business.description.trim()) add("business.description", "Add a tagline or description");
  if (!c.business.phone.trim() && !c.business.email.trim() && !c.business.whatsapp.trim()) add("business.phone", "Add at least one contact method (phone, email or WhatsApp)");
  if (!c.services.some((s) => s.visible && s.name.trim())) add("services", "Add at least one visible service");
  if (!c.sectionOrder.some((s) => c.sectionEnabled[s] && s !== "floating")) add("sectionEnabled", "Enable at least one section");
  return out;
}
