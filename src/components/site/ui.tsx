"use client";
import Image from "next/image";
import { ReactNode, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { assetUrl } from "@/lib/assets";
import type { SiteConfig } from "@/lib/schema";

export type Ctx = { mode: "public" | "preview" | "demo" | "live"; slug: string; present: Set<string> };
export type SectionProps = { c: SiteConfig; ctx: Ctx };

/** Turns "services" -> "#services"; leaves URLs untouched. */
export function hrefOf(dest: string) {
  if (!dest) return "";
  return /^(https?:|tel:|mailto:|#)/i.test(dest) ? dest : `#${dest}`;
}
export const isExternal = (h: string) => /^https?:/i.test(h);

export function smoothTo(e: React.MouseEvent, href: string) {
  if (!href.startsWith("#")) return;
  const el = document.getElementById(href.slice(1));
  if (el) { e.preventDefault(); el.scrollIntoView({ behavior: "smooth", block: "start" }); history.replaceState(null, "", href); }
}

export function SiteImage({ src, alt, sizes = "(min-width:1024px) 50vw, 100vw", priority, className = "" }: { src?: string; alt?: string; sizes?: string; priority?: boolean; className?: string }) {
  const [bad, setBad] = useState(false);
  const url = assetUrl(src);
  if (!url) return null;
  if (bad) return <div aria-hidden className="absolute inset-0" style={{ background: "linear-gradient(135deg, var(--color-primary-soft), color-mix(in srgb, var(--color-secondary) 35%, transparent))" }} />;
  return <Image src={url} alt={alt ?? ""} fill sizes={sizes} priority={priority} onError={() => setBad(true)} className={`object-cover ${className}`} />;
}

export function Reveal({ children, className, delay = 0, y = 24, x = 0 }: { children: ReactNode; className?: string; delay?: number; y?: number; x?: number }) {
  return (
      <motion.div data-reveal="true" className={className} initial={{ opacity: 0, y, x: x || 22, clipPath: "inset(0 0 0 100% round 14px)" }} whileInView={{ opacity: 1, y: 0, x: 0, clipPath: "inset(0 0 0 0% round 14px)" }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.88, delay, ease: [0.16, 1, 0.3, 1] }}>
      {children}
    </motion.div>
  );
}

export function SectionHeader({ eyebrow, heading, description, center = false, className = "" }: { eyebrow?: string; heading?: string; description?: string; center?: boolean; className?: string }) {
  if (!eyebrow && !heading && !description) return null;
  return (
    <Reveal className={`${center ? "mx-auto text-center" : ""} mb-10 max-w-2xl ${center ? "" : ""} ${className}`}>
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      {heading && <h2 className="h2">{heading}</h2>}
      {description && <p className="mt-3 muted">{description}</p>}
    </Reveal>
  );
}

export function Modal({ open, onClose, children, label }: { open: boolean; onClose: () => void; children: ReactNode; label: string }) {
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    btn.current?.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="absolute inset-0 bg-black/70" onClick={onClose} />
          <motion.div role="dialog" aria-modal="true" aria-label={label} className="relative max-h-[90vh] w-full max-w-3xl overflow-auto rounded-2xl bg-page p-0 shadow-2xl" initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, opacity: 0 }}>
            <button ref={btn} onClick={onClose} aria-label="Close" className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80"><X className="h-4 w-4" /></button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Stars({ n }: { n: number }) {
  if (!n) return null;
  return <div className="flex gap-0.5 text-[#f59e0b]" role="img" aria-label={`${n} out of 5 stars`}>{Array.from({ length: 5 }, (_, i) => <span key={i} aria-hidden>{i < n ? "★" : "☆"}</span>)}</div>;
}

export function embedFor(url: string): { kind: "iframe" | "video"; src: string } | null {
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([\w-]{11})/);
  if (yt) return { kind: "iframe", src: `https://www.youtube-nocookie.com/embed/${yt[1]}?autoplay=1` };
  const vm = url.match(/vimeo\.com\/(\d+)/);
  if (vm) return { kind: "iframe", src: `https://player.vimeo.com/video/${vm[1]}?autoplay=1` };
  if (/\.(mp4|webm)(\?|$)/i.test(url)) return { kind: "video", src: url };
  return null;
}
