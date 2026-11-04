"use client";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { getIcon } from "@/lib/icons";
import { DEMO_IMAGES, imageOr } from "@/lib/default-images";
import { contentSlug } from "@/lib/content-slug";
import { SolarGridPattern } from "./SolarGridPattern";
import { hrefOf, Modal, Reveal, SectionProps, SiteImage, smoothTo } from "./ui";
import type { SiteConfig } from "@/lib/schema";

type Svc = SiteConfig["services"][number];

export function Services({ c }: SectionProps) {
  const s = c.content.services;
  const serviceHeading = s.heading || "Complete Solar Solutions";
  const headingParts = serviceHeading.split(/(solar)/i);
  const [open, setOpen] = useState<Svc | null>(null);
  const configuredItems = c.services.filter((x) => x.visible && x.name.trim());
  const defaultItems: Svc[] = [
    { id: "default-residential", name: "Residential Solar", description: "Rooftop solar solutions designed around your home's energy use and available space.", details: "", image: { path: "", alt: "" }, icon: "home", priceLabel: "", ctaLabel: "Request a quote", ctaUrl: "contact", visible: true },
    { id: "default-commercial", name: "Commercial Solar", description: "Solar power options for offices, shops and other commercial properties.", details: "", image: { path: "", alt: "" }, icon: "building", priceLabel: "", ctaLabel: "Request a quote", ctaUrl: "contact", visible: true },
    { id: "default-industrial", name: "Industrial Solar", description: "Explore solar systems planned for larger sites and higher energy needs.", details: "", image: { path: "", alt: "" }, icon: "factory", priceLabel: "", ctaLabel: "Request a quote", ctaUrl: "contact", visible: true },
    { id: "default-maintenance", name: "Solar Care & Maintenance", description: "Keep your solar system working well with regular care and support.", details: "", image: { path: "", alt: "" }, icon: "wrench", priceLabel: "", ctaLabel: "Request a quote", ctaUrl: "contact", visible: true },
    { id: "default-storage", name: "Solar Battery Storage", description: "Store surplus solar energy for use after sunset or during a power outage.", details: "", image: { path: "", alt: "" }, icon: "battery", priceLabel: "", ctaLabel: "Request a quote", ctaUrl: "contact", visible: true },
  ];
  const configuredNames = new Set(configuredItems.map((item) => item.name.trim().toLowerCase()));
  const sourceItems: Svc[] = configuredItems.length
    ? [...configuredItems, ...defaultItems.filter((item) => !configuredNames.has(item.name.toLowerCase()))].slice(0, 5)
    : defaultItems;
  const serviceImages = [DEMO_IMAGES.house, DEMO_IMAGES.roof, DEMO_IMAGES.array, DEMO_IMAGES.panels];
  const items = sourceItems.map((item, i) => ({ ...item, image: imageOr(item.image, serviceImages[i % serviceImages.length]) }));

  const Action = ({ svc, light }: { svc: Svc; light?: boolean }) => {
    const cls = `mt-3 inline-flex items-center gap-1 text-sm font-semibold ${light ? "text-white" : "text-primary"} hover:gap-2 transition-all`;
    if (svc.ctaLabel) {
      const h = hrefOf(svc.ctaUrl || "contact");
      return <a href={h} onClick={(e) => smoothTo(e, h)} className={cls}>{svc.ctaLabel} <ArrowRight className="h-4 w-4" /></a>;
    }
    if (c.services.some((item) => item.id === svc.id && item.visible)) return <Link href={`/site/${c.slug}/services/${contentSlug(svc.name)}`} className={cls}>Explore service <ArrowRight className="h-4 w-4" /></Link>;
    if (svc.details.trim()) return <button type="button" onClick={() => setOpen(svc)} className={cls}>View details <ArrowRight className="h-4 w-4" /></button>;
    return null;
  };
  const Price = ({ svc }: { svc: Svc }) => (svc.priceLabel ? <p className="service-editorial-price">{svc.priceLabel}</p> : null);
  const stagger = (i: number) => ({ initial: { opacity: 0, x: 38 }, whileInView: { opacity: 1, x: 0 }, viewport: { once: true, margin: "-50px" }, transition: { duration: 0.82, delay: Math.max(0, items.length - i - 1) * 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } });

  const body = (
    <div className="service-editorial-grid service-editorial-grid-count-5">
      {items.map((v, i) => (
        <motion.article key={v.id} {...stagger(i)} className="service-editorial-card group">
          <div className="service-editorial-image"><SiteImage src={v.image.path} alt={v.image.alt || v.name} sizes="(min-width:1024px) 42vw, (min-width:640px) 50vw, 100vw" /></div>
          <div className="service-editorial-shade" />
          <div className="service-editorial-copy">
            <span className="service-editorial-index">{String(i + 1).padStart(2, "0")}</span>
            <h3>{v.name}</h3><p>{v.description}</p><Price svc={v} /><Action svc={v} light />
          </div>
        </motion.article>
      ))}
    </div>
  );

  return (
    <section id="services" className="sec sec-alt isolate overflow-hidden" style={{ scrollMarginTop: 80 }}>
      <SolarGridPattern />
      <div className="wrap relative z-10">
        <div className="services-editorial-top">
          <Reveal className="services-editorial-heading">
            <p className="eyebrow mb-2">{s.eyebrow || "Our Services"}</p>
            <h2 className="h2">{headingParts.map((part, i) => part.toLowerCase() === "solar" ? <span className="services-heading-accent" key={i}>{part}</span> : part)}</h2>
            <p className="mt-3 muted">{s.description || "Solar solutions for homes, businesses and larger properties."}</p>
          </Reveal>
          <div className={`services-editorial-categories services-editorial-categories-count-${Math.min(items.length, 3)}`} aria-label="Solar service categories">
            {items.slice(0, 3).map((item) => { const I = getIcon(item.icon || "sun"); return (
              <div className="services-editorial-category" key={item.id}>
                <I aria-hidden />
                <span><strong>{item.name}</strong><small>{item.description.split(/[.!?]/)[0]}</small></span>
              </div>
            ); })}
          </div>
        </div>
        {body}
        <div className="services-editorial-bottom" style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center", paddingTop: "2.5rem" }}>
          <Link href={`/site/${c.slug}/services`} className="services-all-link" style={{ alignSelf: "center", marginInline: "auto" }}>See all services <ArrowRight aria-hidden /></Link>
          <p style={{ width: "100%", textAlign: "center" }}>Thoughtfully designed for homes, businesses and larger properties.</p>
        </div>
      </div>
      <Modal open={!!open} onClose={() => setOpen(null)} label={open?.name ?? "Service"}>
        {open && (
          <div>
            {open.image.path && <div className="relative aspect-[16/8] w-full"><SiteImage src={open.image.path} alt={open.image.alt || open.name} sizes="800px" /></div>}
            <div className="p-6"><h3 className="h2">{open.name}</h3><p className="mt-3 whitespace-pre-line">{open.details}</p>{open.priceLabel && <p className="mt-3 font-semibold" style={{ color: "var(--color-heading)" }}>{open.priceLabel}</p>}
              <a href="#contact" onClick={(e) => { setOpen(null); smoothTo(e, "#contact"); }} className="btn btn-primary mt-5">Request a quote</a></div>
          </div>
        )}
      </Modal>
    </section>
  );
}
