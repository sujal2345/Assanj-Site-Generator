import type { FieldKey, QuoteFormConfig, SectionType, SiteConfig } from "./schema";
import { SECTION_TYPES } from "./schema";
import { THEME_PRESETS } from "./themes";

export const uid = () => crypto.randomUUID();
export const emptyImage = () => ({ path: "", alt: "" });

const field = (enabled: boolean, required: boolean, label: string) => ({ enabled, required, label });

export function defaultQuoteForm(kind: "hero" | "cta"): QuoteFormConfig {
  const fields: Record<FieldKey, { enabled: boolean; required: boolean; label: string }> = {
    name: field(true, true, "Full Name"),
    phone: field(true, true, "Phone Number"),
    email: field(true, false, "Email Address"),
    propertyType: field(kind === "hero", false, "Property Type"),
    monthlyBill: field(kind === "hero", false, "Monthly Electricity Bill"),
    postalCode: field(kind === "hero", false, "Postal Code"),
    city: field(false, false, "City"),
    serviceInterest: field(false, false, "Service Interest"),
    message: field(kind === "cta", false, "Message (Optional)"),
  };
  return kind === "hero"
    ? { title: "Get Your Free Solar Quote", subtitle: "Fill in the details and our team will get back to you.", submitLabel: "Get Free Quote", successMessage: "Thank you! We have received your request and will contact you soon.", privacyNote: "We only use your details to respond to your enquiry.", fields }
    : { title: "Request a Free Consultation", subtitle: "", submitLabel: "Send Request", successMessage: "Thank you! We have received your request and will contact you soon.", privacyNote: "We only use your details to respond to your enquiry.", fields };
}

export function createDefaultConfig(): SiteConfig {
  const colors = { ...THEME_PRESETS[0].colors };
  const nav = (label: string, destination: string) => ({ id: uid(), label, destination, linkType: "section" as const, visible: true });
  const sectionEnabled = Object.fromEntries(SECTION_TYPES.map((s) => [s, true])) as Record<SectionType, boolean>;
  sectionEnabled.floating = false;
  sectionEnabled.why = true;
  return {
    id: uid(), name: "", slug: "", status: "draft",
    business: {
      name: "", tagline: "", description: "", established: "", phone: "", email: "", address: "", city: "", state: "", postalCode: "",
      country: "", hours: "", whatsapp: "", contactUrl: "", facebook: "", instagram: "", linkedin: "", youtube: "",
      latitude: null, longitude: null,
      logo: emptyImage(), favicon: emptyImage(),
    },
    seo: { title: "", description: "", canonical: "", ogTitle: "", ogDescription: "", ogImage: emptyImage() },
    navigation: [nav("Home", "home"), nav("About", "about"), nav("Services", "services"), nav("Projects", "projects"), nav("Benefits", "benefits"), nav("Testimonials", "testimonials"), nav("FAQ", "faq"), nav("Contact", "contact")],
    navCta: { label: "Get Free Quote", destination: "contact", linkType: "section", visible: true },
    theme: {
      preset: THEME_PRESETS[0].name, colors,
      typography: { headingFont: "Manrope", bodyFont: "DM Sans", headingWeight: "700", baseSize: 15, headingScale: 1, buttonStyle: "solid", radius: 10 },
    },
    layout: { maxWidth: 1320, sectionSpacing: "compact", cardStyle: "elevated", imageRadius: 8, buttonShape: "rounded", headerStyle: "shadow" },
    sectionOrder: ["hero", "services", "benefits", "process", "projects", "about", "testimonials", "why", "faq", "cta", "floating"],
    sectionEnabled,
    content: {
      hero: {
        layout: "background", eyebrow: "", headline: "", highlight: "", description: "",
        image: emptyImage(), background: emptyImage(), videoUrl: "",
        primaryCta: { label: "Get Free Quote", destination: "contact" }, secondaryCta: { label: "Explore Our Projects", destination: "projects" },
        ratingLabel: "", showForm: true, form: defaultQuoteForm("hero"), trust: [],
      },
      about: {
        eyebrow: "About Us", heading: "", description: "", layout: "image-right", image: emptyImage(), imageSecondary: emptyImage(),
        imageBadge: "", yearsExperience: "", stats: [], highlights: [], ctaLabel: "", ctaLink: "contact",
        calculator: {
          enabled: false, title: "Calculate Your Savings", description: "See how much solar could help reduce your electricity bill.",
          currency: "₹", defaultBill: 3000, ratePerUnit: 0, fixedCharge: 0, offsetMinPct: 50, offsetMaxPct: 80, region: "", roofNote: "",
        },
      },
      services: { eyebrow: "Our Services", heading: "Complete Solar Solutions", description: "", layout: "featured" },
      benefits: {
        eyebrow: "Why Go Solar", heading: "Benefits of Switching to Solar", description: "", decoration: true,
        items: [
          { id: uid(), icon: "wallet", heading: "Potential Bill Savings", description: "Generating part of your own power can reduce what you buy from the grid.", image: emptyImage() },
          { id: uid(), icon: "zap", heading: "Energy Independence", description: "Rely less on the grid by producing electricity at your own property.", image: emptyImage() },
          { id: uid(), icon: "leaf", heading: "Cleaner Energy", description: "Solar generation produces no emissions while the system is running.", image: emptyImage() },
          { id: uid(), icon: "trending-up", heading: "Long-term Planning", description: "Solar can help you plan and manage future energy costs.", image: emptyImage() },
        ],
      },
      why: { eyebrow: "Why Choose Us", heading: "Why Customers Choose Us", description: "", items: [] },
      process: {
        eyebrow: "Our Process", heading: "Simple Steps To Go Solar", description: "",
        steps: [
          { id: uid(), title: "Request a Quote", description: "Tell us about your property and energy needs." },
          { id: uid(), title: "Property Assessment", description: "We review your roof or site and electricity usage." },
          { id: uid(), title: "Customized Proposal", description: "You receive a proposal tailored to your property." },
          { id: uid(), title: "Installation", description: "Our team installs your solar system." },
          { id: uid(), title: "Activation & Support", description: "We help with system activation and ongoing support." },
        ],
      },
      projects: { eyebrow: "Our Projects", heading: "Real Projects, Real Impact", description: "", showFilter: true },
      testimonials: { eyebrow: "Testimonials", heading: "What Our Customers Say", layout: "carousel" },
      faq: { eyebrow: "FAQ", heading: "Frequently Asked Questions", description: "Answers to common questions about going solar.", background: { path: "/images/faq-bg.webp", alt: "" } },
      cta: {
        eyebrow: "Ready to go solar?", heading: "Let's Build A Cleaner, Brighter Future Together", description: "Share a few details and our team will get in touch.",
        background: emptyImage(), bullets: [], buttonLabel: "", buttonLink: "", showPhone: true, form: defaultQuoteForm("cta"),
      },
      floating: {
        actions: [
          { id: uid(), type: "call", label: "Call Now", icon: "phone", destination: "", visible: true },
          { id: uid(), type: "whatsapp", label: "WhatsApp", icon: "message-circle", destination: "", visible: true },
          { id: uid(), type: "quote", label: "Get a Quote", icon: "file-text", destination: "", visible: true },
        ],
      },
      footer: { description: "", privacyUrl: "", termsUrl: "", copyrightText: "", showHours: true, background: { path: "/images/footer-leaves.webp", alt: "" } },
    },
    services: [],
    projects: [
      { id: uid(), name: "Example: Residential Rooftop Solar", description: "A sample project entry. Replace it with a completed installation from your portfolio.", location: "Add project location", category: "Residential", images: [], capacity: "5 kW", completedAt: "", results: "", visible: true },
      { id: uid(), name: "Example: Commercial Solar System", description: "A sample project entry. Add your own project details, photos and results.", location: "Add project location", category: "Commercial", images: [], capacity: "25 kW", completedAt: "", results: "", visible: true },
      { id: uid(), name: "Example: Industrial Solar Installation", description: "A sample project entry. Replace this with a real installation before publishing.", location: "Add project location", category: "Industrial", images: [], capacity: "100 kW", completedAt: "", results: "", visible: true },
    ],
    testimonials: [],
    faqs: [
      "How much does solar installation cost?", "How long does installation take?", "Is my roof suitable for solar?",
      "What maintenance is required?", "Are financing options available?", "What warranties are offered?",
    ].map((question) => ({ id: uid(), question, answer: "", visible: true })),
  };
}
