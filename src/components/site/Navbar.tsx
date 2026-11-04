"use client";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { Menu, Phone, X } from "lucide-react";
import { assetUrl } from "@/lib/assets";
import { telHref } from "@/lib/site-utils";
import { smoothTo, SectionProps } from "./ui";

export function Navbar({ c, ctx }: SectionProps) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState("");
  const pathname = usePathname();
  const b = c.business;

  const destinationHref = (destination: string) => {
    if (/^(https?:|tel:|mailto:|#)/i.test(destination)) return destination;
    const page = ({ "why-us": "why-us", about: "about", services: "services", projects: "projects", benefits: "benefits", process: "process", testimonials: "testimonials", faq: "faq", contact: "contact" } as Record<string, string>)[destination];
    if (page) return `/site/${ctx.slug}/${page}`;
    return pathname === `/site/${ctx.slug}` ? `#${destination}` : `/site/${ctx.slug}#${destination}`;
  };

  const links = c.navigation.filter((n) => n.visible && n.label.trim() && n.label.trim().toLowerCase() !== "home" && n.destination.toLowerCase() !== "home" && (n.linkType === "external" || ctx.present.has(n.destination)));
  const cta = c.navCta.visible && c.navCta.label.trim() && (c.navCta.linkType === "external" || ctx.present.has(c.navCta.destination)) ? c.navCta : null;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const els = Array.from(ctx.present).map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver((entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)), { rootMargin: "-40% 0px -55% 0px" });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [ctx.present]);

  const click = (e: React.MouseEvent, h: string) => { smoothTo(e, h); setOpen(false); };
  const logo = assetUrl(b.logo.path);
  const headerCls = c.layout.headerStyle === "border" ? "border-b" : scrolled ? "shadow-[0_6px_24px_-12px_rgba(0,0,0,.25)]" : "";

  return (
    <header className={`sticky top-0 z-50 border-b border-transparent transition-all duration-300 ${headerCls}`} style={{ background: "color-mix(in srgb, var(--color-navbar) 94%, transparent)", borderColor: "var(--color-border)", backdropFilter: "blur(16px)" }}>
      <div className="wrap flex h-20 items-center justify-between gap-4">
        <a href={pathname === `/site/${ctx.slug}` ? "#home" : `/site/${ctx.slug}`} onClick={(e) => click(e, pathname === `/site/${ctx.slug}` ? "#home" : `/site/${ctx.slug}`)} className="flex shrink-0 items-center gap-2" aria-label={`${b.name || c.name} home`}>
          {logo ? <img src={logo} alt={b.logo.alt || b.name || c.name} className="h-14 w-auto max-w-[220px] object-contain sm:h-[3.75rem]" /> : <span className="font-[var(--font-heading)] text-xl font-bold tracking-tight" style={{ color: "var(--color-navbar-text)", fontFamily: "var(--font-heading)" }}>{b.name || c.name || "Your Company"}</span>}
        </a>
        <nav aria-label="Main" className="hidden min-w-0 flex-1 items-center justify-center gap-5 xl:gap-7 lg:flex">
          {links.map((n) => {
            const h = destinationHref(n.destination);
            const ext = n.linkType === "external";
            return <a key={n.id} href={h} onClick={(e) => !ext && click(e, h)} aria-current={!ext && active === n.destination} className="nav-link" {...(ext ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{n.label}</a>;
          })}
        </nav>
        <div className="ml-auto hidden shrink-0 items-center gap-3 lg:flex">
          {b.phone && <a href={telHref(b.phone)} className="btn btn-outline btn-sm"><Phone className="h-4 w-4" />{b.phone}</a>}
          {cta && <a href={destinationHref(cta.destination)} onClick={(e) => click(e, destinationHref(cta.destination))} className="btn btn-primary btn-sm">{cta.label}</a>}
        </div>
        <button className="grid h-10 w-10 place-items-center rounded-lg lg:hidden" style={{ color: "var(--color-navbar-text)" }} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} className="overflow-hidden border-t lg:hidden" style={{ borderColor: "var(--color-border)" }}>
            <nav aria-label="Mobile" className="wrap flex flex-col gap-1 py-3">
              {links.map((n) => <a key={n.id} href={destinationHref(n.destination)} onClick={(e) => click(e, destinationHref(n.destination))} className="rounded-lg px-2 py-2.5 text-[15px] font-medium" style={{ color: "var(--color-navbar-text)" }}>{n.label}</a>)}
              <div className="mt-2 flex flex-wrap gap-2">
                {b.phone && <a href={telHref(b.phone)} className="btn btn-outline btn-sm"><Phone className="h-4 w-4" />{b.phone}</a>}
                {cta && <a href={destinationHref(cta.destination)} onClick={(e) => click(e, destinationHref(cta.destination))} className="btn btn-primary btn-sm">{cta.label}</a>}
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
