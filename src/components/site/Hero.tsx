"use client";
import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { ArrowRight, Check, Play, Star } from "lucide-react";
import { assetUrl } from "@/lib/assets";
import { DEMO_IMAGES } from "@/lib/default-images";
import { SolarGridPattern } from "./SolarGridPattern";
import { getIcon } from "@/lib/icons";
import { QuoteForm } from "./QuoteForm";
import { embedFor, hrefOf, Modal, SectionProps, SiteImage, smoothTo } from "./ui";

function Headline({ text, highlight, dark }: { text: string; highlight: string; dark: boolean }) {
  const Hl = ({ children }: { children: React.ReactNode }) => (
    <span className="relative inline-block" style={{ color: dark ? "color-mix(in srgb, var(--color-primary) 72%, white)" : "var(--color-primary)" }}>
      {children}
      <svg aria-hidden viewBox="0 0 100 8" preserveAspectRatio="none" className="absolute -bottom-1.5 left-0 h-2 w-full"><path d="M1 5 Q 25 0 50 4 T 99 3" fill="none" stroke="var(--color-accent)" strokeWidth="2.5" strokeLinecap="round" /></svg>
    </span>
  );
  if (!highlight) return <>{text}</>;
  const i = text.toLowerCase().indexOf(highlight.toLowerCase());
  if (i < 0) return <>{text} <Hl>{highlight}</Hl></>;
  return <>{text.slice(0, i)}<Hl>{text.slice(i, i + highlight.length)}</Hl>{text.slice(i + highlight.length)}</>;
}

const stagger = { hidden: {}, show: { transition: { staggerChildren: 0.14 } } };
const rise = { hidden: { opacity: 0, y: 26 }, show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] } } };

function TrustValue({ value }: { value: string }) {
  const match = value.match(/^\s*([\d,.]+)(.*)$/);
  const target = match ? Number(match[1].replaceAll(",", "")) : null;
  const suffix = match?.[2] ?? "";
  const count = useMotionValue(0);
  const shown = useTransform(count, (n) => target === null ? value : `${target % 1 ? n.toFixed(1) : Math.round(n)}${suffix}`);
  const ref = useRef<HTMLElement>(null);
  const visible = useInView(ref, { once: true, amount: 0.8 });
  useEffect(() => { if (visible && target !== null) { const controls = animate(count, target, { duration: 1.4, ease: "easeOut" }); return () => controls.stop(); } }, [visible, target, count]);
  return <motion.span ref={ref} className="trust-value">{shown}</motion.span>;
}

export function Hero({ c, ctx }: SectionProps) {
  const h = c.content.hero;
  const b = c.business;
  const [video, setVideo] = useState(false);
  const dark = h.layout === "background" || h.layout === "overlay";
  const showForm = h.showForm || ctx.mode === "public";
  const center = h.layout === "overlay" && !showForm;
  const immersive = h.layout === "image-right" && !showForm;
  const formOverPhoto = h.layout === "image-right" && showForm;
  const photoHero = immersive || formOverPhoto;
  const showInlineTrust = photoHero || (showForm && !center);
  const bg = h.background.path || h.image.path || DEMO_IMAGES.hero.path;
  const name = b.name || c.name;
  const headline = h.headline.trim() || (name ? `Go solar.\nBuild a brighter future with ${name}.` : "Go solar.\nOn your terms.");
  const highlight = h.highlight.trim() || "solar";
  const description = h.description.trim() || b.tagline || b.description.slice(0, 220);
  const embed = h.videoUrl ? embedFor(h.videoUrl) : null;
  const services = c.services.filter((s) => s.visible && s.name.trim()).map((s) => s.name);
  const projectCta = c.sectionEnabled.projects && c.projects.some((project) => project.visible && project.name.trim());
  const servicesEnabled = c.sectionEnabled.services && services.length > 0;
  const secondaryTarget = projectCta ? "projects" : servicesEnabled ? "services" : "contact";
  const configuredTrust = h.trust.filter((t) => t.value.trim());
  const trust = configuredTrust.length ? configuredTrust : [
    { id: "trust-guidance", icon: "sun", value: "Personalized Guidance", label: "Solutions matched to your needs", image: { path: "", alt: "" } },
    { id: "trust-installation", icon: "shield-check", value: "End-to-End Support", label: "From planning through installation", image: { path: "", alt: "" } },
    { id: "trust-clean-energy", icon: "leaf", value: "Clean Energy", label: "A brighter way to power your property", image: { path: "", alt: "" } },
  ];
  const textColor = dark ? "#fff" : undefined;

  const form = showForm ? <motion.div variants={rise}><QuoteForm cfg={h.form} source="hero" ctx={ctx} services={services} /></motion.div> : null;
  const sideImage = showForm ? "" : h.image.path || DEMO_IMAGES.house.path;

  const secondary = immersive ? (
    <a href={`#${secondaryTarget}`} onClick={(e) => smoothTo(e, `#${secondaryTarget}`)} className="btn btn-outline hero-project-cta">{projectCta ? "Explore Our Projects" : servicesEnabled ? "Explore Our Solutions" : "Contact Our Team"} <ArrowRight className="h-4 w-4" /></a>
  ) : h.secondaryCta.label.trim() ? (
    embed ? (
      <button type="button" onClick={() => setVideo(true)} className={`btn ${dark ? "btn-white" : "btn-outline"}`}><Play className="h-4 w-4" />{h.secondaryCta.label}</button>
    ) : (
      <a href={hrefOf(h.secondaryCta.destination)} onClick={(e) => smoothTo(e, hrefOf(h.secondaryCta.destination))} className={`btn ${dark ? "btn-white" : "btn-outline"}`}>{h.secondaryCta.label}</a>
    )
  ) : null;

  return (
    <section id="home" className={`relative isolate ${dark ? "on-dark" : ""}`} style={{ scrollMarginTop: 80 }}>
      {photoHero && <>
        {assetUrl(bg) && <div className="hero-immersive-image"><SiteImage src={bg} alt={h.background.alt || h.image.alt || "Solar installation"} priority sizes="100vw" /></div>}
        <div className="hero-immersive-shade" />
      </>}
      {dark && (
        <>
          <div className="absolute inset-0 -z-20" style={{ background: "linear-gradient(135deg, color-mix(in srgb, var(--color-secondary) 85%, black), var(--color-primary))" }} />
          {assetUrl(bg) && <div className="hero-background-image absolute inset-0 -z-10"><SiteImage src={bg} alt="" priority sizes="100vw" /></div>}
          <div className="absolute inset-0 -z-10" style={{ background: center ? "rgba(0,0,0,.55)" : "linear-gradient(90deg, rgba(0,0,0,.78) 0%, rgba(0,0,0,.5) 45%, rgba(0,0,0,.15) 100%)" }} />
        </>
      )}
      {!photoHero && <SolarGridPattern dark={dark} />}
      <motion.div variants={stagger} initial="hidden" animate="show" className={`wrap relative z-10 grid items-center gap-10 py-16 lg:min-h-[660px] lg:gap-14 lg:py-24 ${photoHero ? `hero-immersive-content ${formOverPhoto ? "hero-form-layout" : ""}` : center ? "justify-items-center text-center" : showForm || sideImage ? "lg:grid-cols-[1.15fr_.85fr]" : ""}`}>
        <div className={`${center ? "max-w-3xl" : ""} ${immersive ? "max-w-[680px]" : formOverPhoto ? "max-w-[580px]" : ""}`}>
          <motion.p variants={rise} className={`hero-eyebrow ${dark ? "hero-eyebrow-dark" : ""}`}>{h.eyebrow || "SOLAR SOLUTIONS · BUILT AROUND YOU"}</motion.p>
          <motion.h1 variants={rise} className={`h1 ${photoHero ? "hero-immersive-heading" : ""}`} style={{ color: textColor }}><Headline text={headline} highlight={highlight} dark={dark} /></motion.h1>
          {description && <motion.p variants={rise} className={`mt-5 max-w-xl text-[1.05rem] ${photoHero ? "hero-immersive-description" : ""}`} style={{ color: dark ? "rgba(255,255,255,.9)" : undefined, marginInline: center ? "auto" : undefined }}>{description}</motion.p>}
          <motion.div variants={rise} className={`mt-7 flex flex-wrap gap-3 ${center ? "justify-center" : ""}`}>
            <a href={hrefOf(h.primaryCta.destination || "contact")} onClick={(e) => smoothTo(e, hrefOf(h.primaryCta.destination || "contact"))} className="btn btn-primary">{h.primaryCta.label.trim() || "Get Free Quote"}</a>
            {secondary}
          </motion.div>
          {showInlineTrust && <motion.p variants={rise} className={`hero-trust-indicator ${dark ? "hero-trust-indicator-dark" : ""}`}><Check aria-hidden className="h-4 w-4" />Clear guidance from planning through installation</motion.p>}
          {showInlineTrust && embed && <button type="button" onClick={() => setVideo(true)} className="hero-video-link"><Play className="h-3.5 w-3.5" />Watch our overview</button>}
          {h.ratingLabel && <motion.p variants={rise} className="mt-5 flex items-center gap-2 text-sm font-medium" style={{ color: dark ? "#fff" : "var(--color-heading)" }}><Star className="h-4 w-4 fill-[#f59e0b] text-[#f59e0b]" />{h.ratingLabel}</motion.p>}
        </div>
        {(sideImage || form) && <div className={`w-full ${center ? "max-w-xl" : ""}`}>
          {sideImage && <motion.div variants={rise} className={`img-round relative aspect-[4/3] w-full ${h.showForm ? "mb-[-2.5rem]" : ""}`}><motion.div className="absolute inset-0" initial={{ scale: 1.06 }} animate={{ scale: 1 }} transition={{ duration: 1.2, ease: "easeOut" }}><SiteImage src={sideImage} alt={h.image.alt} priority /></motion.div></motion.div>}
          <div className={sideImage && h.showForm ? "relative mx-3" : ""}>{form}</div>
        </div>}
      </motion.div>

      {immersive && <motion.aside initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.65 }} className="hero-floating-panel"><span className="eyebrow">A BETTER ENERGY PLAN</span><strong>Make more of the energy your property can produce.</strong><span>Residential · Commercial · Industrial</span></motion.aside>}

      {trust.length > 0 && (
        <div className="trust-strip relative z-10 border-y" style={{ background: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          <motion.ul variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }} className={`wrap flex flex-nowrap items-center justify-start gap-x-5 overflow-x-auto py-5 sm:justify-center sm:gap-x-8 lg:justify-between lg:overflow-visible ${trust.length === 5 ? "trust-strip-five" : ""}`}>
            {trust.map((t) => {
              const Icon = getIcon(t.icon);
              return (
                <motion.li variants={rise} key={t.id} className="flex min-w-max items-center gap-2.5 sm:gap-3">
                  {t.image.path ? <span className="relative h-9 w-9 shrink-0"><SiteImage src={t.image.path} alt={t.image.alt || t.label} sizes="40px" className="!object-contain" /></span> : <Icon aria-hidden className="h-7 w-7 shrink-0 text-primary" />}
                  <div><p className="text-lg font-bold leading-tight" style={{ color: "var(--color-heading)", fontFamily: "var(--font-heading)" }}><TrustValue value={t.value} /></p>{t.label && <p className="text-xs">{t.label}</p>}</div>
                </motion.li>
              );
            })}
          </motion.ul>
        </div>
      )}

      {embed && (
        <Modal open={video} onClose={() => setVideo(false)} label="Video">
          <div className="aspect-video w-full bg-black">
            {embed.kind === "iframe" ? <iframe src={embed.src} title="Video" className="h-full w-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /> : <video src={embed.src} controls autoPlay className="h-full w-full" />}
          </div>
        </Modal>
      )}
    </section>
  );
}
