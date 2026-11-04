"use client";
import { Phone } from "lucide-react";
import { assetUrl } from "@/lib/assets";
import { SolarGridPattern } from "./SolarGridPattern";
import { getIcon } from "@/lib/icons";
import { telHref } from "@/lib/site-utils";
import { QuoteForm } from "./QuoteForm";
import { InteractiveDots } from "./InteractiveDots";
import { hrefOf, Reveal, SectionProps, SiteImage, smoothTo } from "./ui";

export function FinalCta({ c, ctx }: SectionProps) {
  const s = c.content.cta;
  const services = c.services.filter((x) => x.visible && x.name.trim()).map((x) => x.name);
  const background = s.background.path || "/images/faq-bg.webp";
  return (
    <section id="contact" className="sec on-dark relative isolate overflow-hidden text-white" style={{ scrollMarginTop: 80 }}>
      <div className="absolute inset-0 -z-20" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--color-secondary) 90%, black), color-mix(in srgb, var(--color-primary) 55%, black))" }} />
      {assetUrl(background) && <div className="absolute inset-0 -z-10"><SiteImage src={background} alt={s.background.alt || "Solar panels in warm evening light"} sizes="100vw" /></div>}
      <div className="absolute inset-0 -z-10 bg-black/60" />
      <InteractiveDots />
      <SolarGridPattern dark />
      <div className="wrap relative z-10 grid items-center gap-10 lg:grid-cols-[1fr_1fr]">
        <Reveal>
          <p className="eyebrow mb-2" style={{ color: "color-mix(in srgb, var(--color-primary) 60%, white)" }}>{s.eyebrow || "Ready to go solar?"}</p>
          <h2 className="h2" style={{ color: "#fff" }}>{s.heading || "Let's Build A Cleaner, Brighter Future Together"}</h2>
          {s.description && <p className="mt-4 max-w-lg text-white/90">{s.description}</p>}
          {s.bullets.length > 0 && (
            <ul className="mt-6 flex flex-wrap gap-5">
              {s.bullets.filter((b) => b.label.trim()).map((b) => { const I = getIcon(b.icon); return <li key={b.id} className="flex items-center gap-2 text-sm font-medium"><span className="grid h-9 w-9 place-items-center rounded-full bg-white/15"><I className="h-4 w-4" aria-hidden /></span>{b.label}</li>; })}
            </ul>
          )}
          <div className="mt-7 flex flex-wrap gap-3">
            {s.showPhone && c.business.phone && <a href={telHref(c.business.phone)} className="btn btn-white"><Phone className="h-4 w-4" />{c.business.phone}</a>}
            {s.buttonLabel && <a href={hrefOf(s.buttonLink)} onClick={(e) => smoothTo(e, hrefOf(s.buttonLink))} className="btn btn-primary">{s.buttonLabel}</a>}
          </div>
        </Reveal>
        <Reveal delay={0.1}><QuoteForm cfg={s.form} source="final_cta" ctx={ctx} services={services} twoCol /></Reveal>
      </div>
    </section>
  );
}
