import { SECTION_ANCHORS, SectionType, SiteConfig } from "./schema";

export function sectionHasContent(c: SiteConfig, t: SectionType): boolean {
  switch (t) {
    case "hero": case "about": case "cta": return true;
    case "services": return true;
    case "benefits": case "why": return true;
    case "process": return true;
    case "projects": case "testimonials": return true;
    case "faq": return true;
    case "floating": return c.content.floating.actions.some((a) => a.visible);
  }
}

/** Sections that will actually render, in order. */
export function activeSections(c: SiteConfig): SectionType[] {
  return c.sectionOrder.filter((t) => c.sectionEnabled[t] && sectionHasContent(c, t));
}
export function presentAnchors(c: SiteConfig): Set<string> {
  return new Set(activeSections(c).map((t) => SECTION_ANCHORS[t]));
}
export const telHref = (p: string) => `tel:${p.replace(/[^\d+]/g, "")}`;
export const waHref = (n: string) => `https://wa.me/${n.replace(/\D/g, "")}`;
export const fmt = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
