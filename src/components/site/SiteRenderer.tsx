"use client";
import { ComponentType, type ReactNode } from "react";
import { MotionConfig } from "framer-motion";
import { fontHref, themeToCssVars } from "@/lib/themes";
import { SECTION_TYPES, SectionType, SiteConfig } from "@/lib/schema";
import { activeSections, presentAnchors } from "@/lib/site-utils";
import { About } from "./About";
import { FinalCta } from "./FinalCta";
import { Floating } from "./Floating";
import { Footer } from "./Footer";
import { Hero } from "./Hero";
import { Navbar } from "./Navbar";
import { Projects } from "./Projects";
import { Benefits, Faq, Process, Why } from "./Sections";
import { Services } from "./Services";
import { Testimonials } from "./Testimonials";
import { Ctx, SectionProps } from "./ui";

/** Section registry: section type -> component. Sites are rendered purely from saved configuration. */
export const SECTION_REGISTRY: Record<SectionType, ComponentType<SectionProps>> = {
  hero: Hero, about: About, services: Services, benefits: Benefits, why: Why, process: Process,
  projects: Projects, testimonials: Testimonials, faq: Faq, cta: FinalCta, floating: Floating,
};
void SECTION_TYPES;

export function SiteRenderer({ config, mode, banner, page }: { config: SiteConfig; mode: Ctx["mode"]; banner?: string; page?: SectionType }) {
  const sections = activeSections(config);
  const visibleSections = (page ? sections.filter((type) => type === page || (page !== "cta" && type === "cta")) : sections).filter((type) => type !== "floating");
  return <SiteShell config={config} mode={mode} banner={banner}><main>
    {visibleSections.map((type) => {
      const Section = SECTION_REGISTRY[type];
      return <Section key={type} c={config} ctx={{ mode, slug: config.slug, present: presentAnchors(config) }} />;
    })}
  </main></SiteShell>;
}

export function SiteShell({ config, mode, banner, children, includeCta = false }: { config: SiteConfig; mode: Ctx["mode"]; banner?: string; children: ReactNode; includeCta?: boolean }) {
  const present = presentAnchors(config);
  const ctx: Ctx = { mode, slug: config.slug, present };
  const t = config.theme.typography;
  return (
    <MotionConfig reducedMotion="user">
      <link rel="stylesheet" href={fontHref(t.headingFont, t.bodyFont)} />
      <div className="site" data-btn={t.buttonStyle} data-card={config.layout.cardStyle} style={themeToCssVars(config) as React.CSSProperties}>
        {banner && <div role="status" className="px-3 py-1.5 text-center text-xs font-semibold" style={{ background: "#111827", color: "#fff" }}>{banner}</div>}
        <Navbar c={config} ctx={ctx} />
        {children}
        {includeCta && <FinalCta c={config} ctx={ctx} />}
        <Floating c={config} ctx={ctx} />
        <Footer c={config} ctx={ctx} />
      </div>
    </MotionConfig>
  );
}
