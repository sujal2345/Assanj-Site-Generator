"use client";
import { useState } from "react";
import { Leaf } from "lucide-react";
import { getIcon } from "@/lib/icons";
import { fmt } from "@/lib/site-utils";
import { DEMO_IMAGES, imageOr } from "@/lib/default-images";
import { SolarGridPattern } from "./SolarGridPattern";
import { hrefOf, Reveal, SectionProps, SiteImage, smoothTo } from "./ui";
import type { SiteConfig } from "@/lib/schema";

type Calc = SiteConfig["content"]["about"]["calculator"];

function Calculator({ cfg }: { cfg: Calc }) {
  const maxBill = 100_000;
  const [bill, setBill] = useState(Math.min(maxBill, cfg.defaultBill || 3000));
  const [propertyType, setPropertyType] = useState("Residential");
  const b = bill;
  const usable = Math.max(0, b - cfg.fixedCharge);
  const lo = usable * (cfg.offsetMinPct / 100);
  const hi = usable * (cfg.offsetMaxPct / 100);
  const units = b / cfg.ratePerUnit;
  return (
    <div className="calculator-dashboard">
      <div className="calculator-topline"><span className="eyebrow">SAVINGS ESTIMATOR</span><span className="calculator-live-dot">Illustrative</span></div>
      <div className="calculator-layout">
        <div className="calculator-inputs">
          <h3 className="calculator-title">{cfg.title}</h3>
          {cfg.description && <p className="mt-1 text-sm">{cfg.description}</p>}
          <label htmlFor="calc-property" className="label mt-5">Property type</label>
          <select id="calc-property" value={propertyType} onChange={(event) => setPropertyType(event.target.value)} className="input calculator-select"><option>Residential</option><option>Commercial</option><option>Industrial</option></select>
          <div className="mt-5 flex items-center justify-between gap-3">
            <label htmlFor="calc-bill" className="label">Monthly electricity bill ({cfg.currency})</label>
            <output htmlFor="calc-bill" className="text-lg font-bold" style={{ color: "var(--color-primary)" }}>{cfg.currency}{fmt(b)}</output>
          </div>
          <input id="calc-bill" type="range" min={0} max={maxBill} step={500} value={bill} onChange={(e) => setBill(Number(e.target.value))} aria-label={`Monthly electricity bill: ${cfg.currency}${fmt(b)}`} className="mt-3 w-full cursor-pointer accent-[var(--color-primary)]" />
          <div className="flex justify-between text-xs" aria-hidden="true"><span>{cfg.currency}0</span><span>{cfg.currency}{fmt(maxBill)}</span></div>
          {cfg.region && <p className="mt-3 text-xs">Region assumption: {cfg.region}</p>}
        </div>
        <div className="calculator-estimate">
          <div className="calculator-result" aria-live="polite">
            <p className="eyebrow">ESTIMATED RANGE · {propertyType.toUpperCase()}</p>
            {b > 0 ? (
              <>
                <p className="calculator-result-value">{cfg.currency}{fmt(lo)} <span>to</span> {cfg.currency}{fmt(hi)}</p>
                <p className="mt-1 text-xs">Based on about {fmt(units)} units per month.</p>
              </>
            ) : <p className="mt-1 text-sm">Move the slider to see an estimate.</p>}
          </div>
          <p className="calculator-disclaimer mt-3 text-xs leading-relaxed">
            Estimate only, not a guarantee. Property type is shown for context; the estimate uses your monthly bill and the assumptions below. Assumes solar could offset {cfg.offsetMinPct}–{cfg.offsetMaxPct}% of the variable part of your bill at {cfg.currency}{cfg.ratePerUnit} per unit{cfg.fixedCharge ? ` after a fixed charge of ${cfg.currency}${fmt(cfg.fixedCharge)}` : ""}. Real savings depend on your roof, usage and local tariffs. {cfg.roofNote}
          </p>
        </div>
      </div>
    </div>
  );
}

export function About({ c }: SectionProps) {
  const a = c.content.about;
  const cal = a.calculator;
  const calcOk = cal.enabled && cal.ratePerUnit > 0 && cal.offsetMinPct > 0 && cal.offsetMaxPct >= cal.offsetMinPct;
  const heading = a.heading.trim() || (c.business.name ? `About ${c.business.name}` : "About Us");
  const desc = a.description.trim() || c.business.description || "We help homes and businesses make the switch to dependable solar energy with guidance from the first conversation through installation and ongoing support.";
  const stats = [...(a.yearsExperience ? [{ id: "years", value: a.yearsExperience, label: "Years of experience" }] : []), ...a.stats.filter((s) => s.value.trim())];
  const primaryImage = imageOr(a.image, DEMO_IMAGES.house);
  const secondaryImage = imageOr(a.imageSecondary, DEMO_IMAGES.field);
  const hasImg = true;
  const left = a.layout === "image-left";

  return (
    <section id="about" className="sec about-editorial isolate overflow-hidden" style={{ scrollMarginTop: 80 }}>
      <SolarGridPattern />
      <div className={`wrap relative z-10 grid items-center gap-10 lg:gap-16 ${hasImg ? "lg:grid-cols-[.95fr_1.05fr]" : ""}`}>
        <Reveal x={left ? 24 : -24} y={0} className={`${left && hasImg ? "lg:order-2" : ""}`}>
          <p className="eyebrow mb-2">{a.eyebrow || "About Us"}</p>
          <h2 className="h2">{heading}</h2>
          {desc && <p className="mt-4 whitespace-pre-line">{desc}</p>}
          {a.highlights.length > 0 && (
            <ul className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              {a.highlights.map((h) => { const I = getIcon(h.icon); return (
                <li key={h.id} className="text-center"><span className="mx-auto mb-2 grid h-11 w-11 place-items-center rounded-full bg-soft"><I className="h-5 w-5 text-primary" aria-hidden /></span><span className="text-xs font-medium" style={{ color: "var(--color-heading)" }}>{h.label}</span></li>
              ); })}
            </ul>
          )}
          {stats.length > 0 && (
            <dl className="mt-6 flex flex-wrap gap-8">
              {stats.map((s) => <div key={s.id}><dd className="text-2xl font-bold" style={{ color: "var(--color-primary)", fontFamily: "var(--font-heading)" }}>{s.value}</dd><dt className="text-xs">{s.label}</dt></div>)}
            </dl>
          )}
          {a.ctaLabel && <a href={hrefOf(a.ctaLink)} onClick={(e) => smoothTo(e, hrefOf(a.ctaLink))} className="btn btn-primary mt-7">{a.ctaLabel} →</a>}
        </Reveal>

        {hasImg && (
          <Reveal x={left ? -24 : 24} y={0} className={left ? "lg:order-1" : ""}>
            <div className="relative mx-auto aspect-[5/4] w-full max-w-[590px]">
              <div className="absolute -right-3 top-[18%] h-28 w-28 rounded-full bg-soft blur-2xl" aria-hidden />
              <div className="img-round absolute right-[2%] top-[3%] z-0 h-[57%] w-[58%] border-[5px] shadow-xl" style={{ borderColor: "var(--color-background)" }}>
                <SiteImage src={secondaryImage.path} alt={secondaryImage.alt} sizes="(min-width:1024px) 28vw, 65vw" />
              </div>
              <div className="img-round absolute bottom-[4%] left-0 z-10 h-[73%] w-[74%] border-[6px] shadow-2xl" style={{ borderColor: "var(--color-background)" }}>
                <SiteImage src={primaryImage.path} alt={primaryImage.alt} sizes="(min-width:1024px) 35vw, 75vw" />
              </div>
              <div className="card absolute bottom-[8%] right-0 z-20 flex max-w-[64%] items-center gap-3 p-3 shadow-xl sm:gap-4 sm:p-4" style={{ background: "var(--color-background)" }}>
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary text-onprimary"><Leaf className="h-5 w-5" /></span>
                <span className="text-xs font-semibold leading-snug sm:text-sm" style={{ color: "var(--color-heading)" }}>{a.imageBadge || "A brighter way to power your property"}</span>
              </div>
            </div>
          </Reveal>
        )}

        {calcOk && <Reveal delay={0.1} className="w-full lg:order-3 lg:col-span-2"><Calculator cfg={cal} /></Reveal>}
      </div>
    </section>
  );
}
