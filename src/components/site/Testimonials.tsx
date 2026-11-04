"use client";
import { Quote } from "lucide-react";
import { SectionHeader, SectionProps, SiteImage, Stars } from "./ui";
import type { SiteConfig } from "@/lib/schema";

type T = SiteConfig["testimonials"][number];

function Card({ t, imported, showSource = true }: { t: T; imported: boolean; showSource?: boolean }) {
  const photo = imported ? { path: "", alt: "" } : t.photo;
  return (
    <figure className="testimonial-card card flex h-full min-h-[190px] flex-col p-5 sm:p-6" style={{ background: "var(--color-background)" }}>
      <div className="mb-3 flex items-center justify-between">
        <Quote className="h-5 w-5 text-primary opacity-70" aria-hidden />
        {t.sourceUrl && <Stars n={t.rating} />}
      </div>
      <blockquote className="flex-1 text-sm">“{t.text}”</blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t pt-4" style={{ borderColor: "var(--color-border)" }}>
        <span className="relative grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-full bg-soft font-bold text-primary">
          {photo.path ? <SiteImage src={photo.path} alt={t.photo.alt || ""} sizes="48px" /> : <span aria-hidden>{t.customerName.split(/\s+/).map((part) => part[0]).slice(0, 2).join("").toUpperCase()}</span>}
        </span>
        <div className="text-sm">
          <p className="font-semibold" style={{ color: "var(--color-heading)" }}>{t.customerName}</p>
          {(t.company || t.location) && <p className="text-xs">{[t.company, t.location].filter(Boolean).join(", ")}</p>}
          {showSource && t.sourceUrl && <a href={t.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-primary underline">View source</a>}
        </div>
      </figcaption>
    </figure>
  );
}

function TickerRow({ items, imported, reverse = false }: { items: T[]; imported: boolean; reverse?: boolean }) {
  return (
    <div className="testimonial-marquee" role="group" aria-label={reverse ? "Customer stories moving right" : "Customer stories moving left"}>
      <div className={`testimonial-marquee-track ${reverse ? "testimonial-marquee-track-reverse" : ""}`}>
        {[0, 1].map((copy) => <div className="testimonial-marquee-group" aria-hidden={copy === 1} key={copy}>
          {items.map((t) => <div key={`${copy}-${t.id}`} className="testimonial-marquee-item"><Card t={t} imported={imported} showSource={copy === 0} /></div>)}
        </div>)}
      </div>
    </div>
  );
}

export function Testimonials({ c }: SectionProps) {
  const s = c.content.testimonials;
  const configured = c.testimonials.filter((t) => t.visible && t.text.trim() && t.customerName.trim());
  const imported = !!c.business.importSource;
  if (configured.length === 0) return (
    <section id="testimonials" className="sec sec-alt isolate overflow-hidden" style={{ scrollMarginTop: 80 }}>
      <div className="wrap relative z-10">
        <SectionHeader eyebrow={s.eyebrow || "Customer stories"} heading={s.heading || "What customers say."} className="!mb-0" />
        <p className="testimonial-empty-state">Customer testimonials will appear here when verified reviews are added.</p>
      </div>
    </section>
  );
  return (
    <section id="testimonials" className="sec sec-alt isolate overflow-hidden" style={{ scrollMarginTop: 80 }}>
      <div className="wrap relative z-10">
        <SectionHeader eyebrow={s.eyebrow || "Customer stories"} heading={s.heading || "What customers say."} description="First-hand feedback from customers." />
        <div className="space-y-3"><TickerRow items={configured} imported={imported} /><TickerRow items={configured} imported={imported} reverse /></div>
      </div>
    </section>
  );
}
