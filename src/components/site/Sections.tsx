"use client";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Play, Plus } from "lucide-react";
import { getIcon } from "@/lib/icons";
import { DEMO_IMAGES, imageOr } from "@/lib/default-images";
import { SolarGridPattern } from "./SolarGridPattern";
import { embedFor, Modal, Reveal, SectionHeader, SectionProps, SiteImage } from "./ui";

/* ---------------------------------------------------------------- Benefits */
export function Benefits({ c }: SectionProps) {
  const s = c.content.benefits;
  const configuredItems = s.items.filter((i) => i.heading.trim());
  const sourceItems = configuredItems.length ? configuredItems : [
    { id: "default-benefit-savings", icon: "wallet", heading: "Potential Bill Savings", description: "Generating part of your own power can reduce the electricity you buy from the grid.", image: { path: "", alt: "" } },
    { id: "default-benefit-energy", icon: "zap", heading: "Energy Independence", description: "Rely less on the grid by producing electricity at your property.", image: { path: "", alt: "" } },
    { id: "default-benefit-clean", icon: "leaf", heading: "Cleaner Energy", description: "Solar power can help reduce your reliance on fossil-fuel electricity.", image: { path: "", alt: "" } },
    { id: "default-benefit-planning", icon: "trending-up", heading: "Long-Term Planning", description: "Solar can be part of a long-term plan for managing energy costs.", image: { path: "", alt: "" } },
  ];
  const image = imageOr(sourceItems[0]?.image ?? { path: "", alt: "" }, DEMO_IMAGES.field);
  return (
    <section id="benefits" className="sec benefits-editorial" style={{ scrollMarginTop: 80 }}>
      <div className="benefits-photo">
        {image.path && <SiteImage src={image.path} alt={image.alt || "Solar panels in clear daylight"} sizes="(min-width:1024px) 55vw, 100vw" />}
        <div className="benefits-photo-caption"><span className="eyebrow">A PRACTICAL MOVE TO SOLAR</span><p>Designed for the way you use energy.</p></div>
      </div>
      <div className="benefits-copy">
        <p className="eyebrow">{s.eyebrow || "WHY SOLAR"}</p>
        <h2 className="h2">{s.heading || "More than a lower bill."}</h2>
        <p className="benefits-intro">{s.description || "A well-planned solar system can support your energy needs while reducing reliance on grid electricity."}</p>
        <ul className="benefits-list">
          {sourceItems.map((item, idx) => { const I = getIcon(item.icon); return (
            <motion.li key={item.id} initial={{ opacity: 0, x: 32, clipPath: "inset(0 0 0 100%)" }} whileInView={{ opacity: 1, x: 0, clipPath: "inset(0 0 0 0%)" }} viewport={{ once: true }} transition={{ duration: .7, delay: Math.max(0, sourceItems.length - idx - 1) * .09 }}>
              <span className="benefit-icon"><I aria-hidden className="h-5 w-5" /></span><span><strong>{item.heading}</strong><small>{item.description}</small></span>
            </motion.li>
          ); })}
        </ul>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------- Why */
export function Why({ c }: SectionProps) {
  const s = c.content.why;
  const configuredItems = s.items.filter((i) => i.heading.trim());
  const sourceItems = configuredItems.length ? configuredItems : [
    { id: "default-why-guidance", icon: "handshake", heading: "Guidance at Every Step", description: "Get help understanding your options, from initial planning through installation.", image: { path: "", alt: "" } },
    { id: "default-why-designed", icon: "sun", heading: "Designed for Your Property", description: "A solar plan should account for your energy needs and available space.", image: { path: "", alt: "" } },
    { id: "default-why-support", icon: "headphones", heading: "Ongoing Support", description: "Know who to contact when you have questions about your solar system.", image: { path: "", alt: "" } },
  ];
  const whyImages = [DEMO_IMAGES.crew, DEMO_IMAGES.panels, DEMO_IMAGES.field];
  const items = sourceItems.map((item, i) => ({ ...item, image: imageOr(item.image, whyImages[i % whyImages.length]) }));
  const teamPhoto = items.find((item) => item.image.path)?.image ?? DEMO_IMAGES.crew;
  return (
    <section id="why-us" className="sec why-editorial" style={{ scrollMarginTop: 80 }}>
      <div className="wrap why-editorial-grid">
        <Reveal className="why-team-photo">
          {teamPhoto.path && <SiteImage src={teamPhoto.path} alt={teamPhoto.alt || "Solar installation team at work"} sizes="(min-width:1024px) 50vw, 100vw" />}
          <div className="why-photo-caption"><span className="eyebrow">{s.eyebrow || "THE WAY WE WORK"}</span><p>Clear advice. Careful planning. Support after installation.</p></div>
        </Reveal>
        <div className="why-editorial-copy">
          <SectionHeader eyebrow="A solar partner" heading={s.heading || "Good work is built on good support."} description={s.description || "Choosing a solar system involves more than equipment. A clear process and a responsive team make each step easier to understand."} />
          <div className="why-points">
            {items.map((i, idx) => { const I = getIcon(i.icon); return (
              <Reveal key={i.id} delay={idx * .06} className="why-point">
                <span><I className="h-5 w-5" aria-hidden /></span><div><h3>{i.heading}</h3><p>{i.description}</p></div>
              </Reveal>
            ); })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ----------------------------------------------------------------- Process */
export function Process({ c }: SectionProps) {
  const s = c.content.process;
  const configuredSteps = s.steps.filter((x) => x.title.trim());
  const steps = configuredSteps.length ? configuredSteps : [
    { id: "default-consultation", title: "Consultation", description: "Discuss your energy needs and goals." },
    { id: "default-assessment", title: "Site Assessment", description: "Review your property and solar potential." },
    { id: "default-proposal", title: "Custom Proposal", description: "Explore a solution tailored to your site." },
    { id: "default-installation", title: "Installation", description: "Have your system installed by a qualified team." },
  ];
  return (
    <section id="process" className="sec process-section isolate overflow-hidden" style={{ scrollMarginTop: 80 }}>
      <SolarGridPattern />
      <div className="wrap relative z-10">
        <SectionHeader eyebrow={s.eyebrow || "Our Process"} heading={s.heading || "From first conversation to switch-on."} description={s.description || "A straightforward sequence keeps each decision clear, from the site review through installation."} />
        <ol className="process-timeline relative grid gap-8 lg:gap-4" style={{ gridTemplateColumns: undefined }}>
          <style>{`@media (min-width:1024px){#process ol{grid-template-columns:repeat(${steps.length},minmax(0,1fr));}}`}</style>
          {/* desktop connector line grows in as the section enters view */}
          <motion.div aria-hidden className="process-timeline-line absolute top-6 hidden h-0.5 origin-left lg:block" style={{ left: `${50 / steps.length}%`, right: `${50 / steps.length}%`, background: "var(--color-primary)", opacity: 0.55 }} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} transition={{ duration: 1.3, ease: "easeInOut" }} />
          <div aria-hidden className="absolute bottom-4 left-6 top-4 w-0.5 lg:hidden" style={{ background: "var(--color-border)" }} />
          {steps.map((st, i) => (
            <motion.li key={st.id} initial={{ opacity: 0, x: 28, clipPath: "inset(0 0 0 100%)" }} whileInView={{ opacity: 1, x: 0, clipPath: "inset(0 0 0 0%)" }} viewport={{ once: true, margin: "-40px" }} transition={{ duration: 0.72, delay: Math.max(0, steps.length - i - 1) * 0.1 }} className="process-step relative flex gap-4 lg:flex-col lg:items-center lg:text-center">
              <span aria-hidden className="process-step-ghost">{String(i + 1).padStart(2, "0")}</span>
              <span className="process-step-number relative z-10 grid shrink-0 place-items-center">{String(i + 1).padStart(2, "0")}</span>
              <div className="process-step-copy relative z-10 lg:mt-4"><p className="eyebrow">STEP {String(i + 1).padStart(2, "0")}</p><h3 className="h3">{st.title}</h3><p className="mt-2 text-sm">{st.description}</p></div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* --------------------------------------------------------------------- FAQ */
export function Faq({ c }: SectionProps) {
  const s = c.content.faq;
  const configuredItems = c.faqs.filter((f) => f.visible && f.question.trim() && f.answer.trim());
  const items = configuredItems.length ? configuredItems : [
    { id: "default-faq-cost", question: "How much does solar installation cost?", answer: "Cost depends on system size, equipment, roof conditions and your energy needs. A site assessment can help prepare an estimate.", visible: true },
    { id: "default-faq-time", question: "How long does installation take?", answer: "Timing varies with system size, site conditions and approvals. Your installer can provide a schedule after reviewing the project.", visible: true },
    { id: "default-faq-roof", question: "Is my roof suitable for solar panels?", answer: "Suitability depends on roof area, structure, orientation and shading. A site assessment is the best way to evaluate it.", visible: true },
    { id: "default-faq-maintenance", question: "What maintenance is required?", answer: "Solar panels generally need periodic cleaning and system checks. Follow the equipment manufacturer's guidance.", visible: true },
    { id: "default-faq-subsidies", question: "Are subsidies available?", answer: "Subsidy programs depend on location and can change. Check current local guidance before making a decision.", visible: true },
  ];
  const [open, setOpen] = useState<string | null>(null);
  const [videoOpen, setVideoOpen] = useState(false);
  const video = c.content.hero.videoUrl ? embedFor(c.content.hero.videoUrl) : null;
  const faqImage = s.background.path || DEMO_IMAGES.roof.path;
  return (
    <section id="faq" className="sec faq-section relative overflow-hidden" style={{ scrollMarginTop: 80 }}>
      <div className="wrap grid items-start gap-10 lg:grid-cols-[.78fr_1.22fr]">
        <Reveal>
          <p className="eyebrow mb-2">{s.eyebrow || "FAQ"}</p>
          <h2 className="h2">{s.heading || "Good questions deserve clear answers."}</h2>
          <p className="mt-3 max-w-sm">{s.description || "Straightforward answers about planning, installation and owning a solar system."}</p>
          <div className="faq-video-card">
            {faqImage && <SiteImage src={faqImage} alt="Solar installation" sizes="(min-width:1024px) 35vw, 100vw" />}
            {video ? <button type="button" onClick={() => setVideoOpen(true)} aria-label="Play solar overview video" className="faq-video-play"><Play fill="currentColor" /></button> : <a href="#contact" className="faq-video-contact">Talk to a solar specialist <span>→</span></a>}
            {video && <span className="faq-video-label">WATCH THE OVERVIEW</span>}
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="card overflow-hidden" style={{ background: "var(--color-background)" }}>
            {items.map((f, i) => {
              const isOpen = open === f.id;
              return (
                <div key={f.id} className={i ? "border-t" : ""} style={{ borderColor: "var(--color-border)" }}>
                  <h3>
                    <button type="button" aria-expanded={isOpen} aria-controls={`faq-${f.id}`} onClick={() => setOpen(isOpen ? null : f.id)} className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left text-[15px] font-medium" style={{ color: "var(--color-heading)", fontFamily: "var(--font-body)" }}>
                      {f.question}
                      <motion.span animate={{ rotate: isOpen ? 45 : 0 }} className="shrink-0 text-primary"><Plus className="h-5 w-5" /></motion.span>
                    </button>
                  </h3>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div id={`faq-${f.id}`} role="region" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden">
                        <p className="whitespace-pre-line px-5 pb-4 text-sm">{f.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
      {video && <Modal open={videoOpen} onClose={() => setVideoOpen(false)} label="Solar overview video"><div className="aspect-video w-full bg-black">{video.kind === "iframe" ? <iframe src={video.src} title="Solar overview video" className="h-full w-full" allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen /> : <video src={video.src} controls autoPlay className="h-full w-full" />}</div></Modal>}
    </section>
  );
}
