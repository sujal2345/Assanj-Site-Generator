"use client";
import { Clock, Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from "lucide-react";
import { assetUrl } from "@/lib/assets";
import { telHref } from "@/lib/site-utils";
import { contentSlug } from "@/lib/content-slug";
import { hrefOf, SectionProps } from "./ui";

export function Footer({ c, ctx }: SectionProps) {
  const b = c.business;
  const f = c.content.footer;
  const name = b.name || c.name;
  const links = c.navigation.filter((n) => n.visible && n.label.trim() && (n.linkType === "external" || ctx.present.has(n.destination)));
  const services = ctx.present.has("services") ? c.services.filter((s) => s.visible && s.name.trim()) : [];
  const logo = assetUrl(b.logo.path);
  const address = [b.address, [b.city, b.state].filter(Boolean).join(", "), [b.postalCode, b.country].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const hasCoordinates = typeof b.latitude === "number" && typeof b.longitude === "number";
  const mapQuery = hasCoordinates ? `${b.latitude},${b.longitude}` : address;
  const desc = f.description || b.tagline || b.description;
  const socials = [[b.facebook, Facebook, "Facebook"], [b.instagram, Instagram, "Instagram"], [b.linkedin, Linkedin, "LinkedIn"], [b.youtube, Youtube, "YouTube"]] as const;
  const pageByDestination: Record<string, string> = { about: "about", benefits: "benefits", "why-us": "why-us", process: "process", testimonials: "testimonials", faq: "faq", contact: "contact", services: "services", projects: "projects" };
  const navHref = (destination: string) => {
    if (/^(https?:|tel:|mailto:|#)/i.test(destination)) return hrefOf(destination);
    if (destination === "home") return `/site/${ctx.slug}`;
    return pageByDestination[destination] ? `/site/${ctx.slug}/${pageByDestination[destination]}` : hrefOf(destination);
  };
  const leaf = c.business.importSource ? "" : assetUrl(f.background.path);
  const year = new Date().getFullYear();
  const muted = { color: "var(--color-footer-muted)" };
  const head = { color: "var(--color-footer-text)", fontFamily: "var(--font-heading)" };

  return (
    <footer className="relative" style={{ background: "var(--color-footer)", color: "var(--color-footer-text)", ...(leaf ? { backgroundImage: `url(${leaf})`, backgroundSize: "cover", backgroundPosition: "center bottom", backgroundRepeat: "no-repeat" } : {}) }}>
      <div className="wrap grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div>
          {logo ? <img src={logo} alt={b.logo.alt || name} className="h-11 w-auto max-w-[200px] object-contain" /> : <p className="text-xl font-bold" style={head}>{name}</p>}
          {desc && <p className="mt-3 max-w-xs text-sm" style={muted}>{desc}</p>}
          {socials.some(([u]) => u) && (
            <div className="mt-4 flex gap-2">
              {socials.map(([u, I, label]) => u ? <a key={label} href={u} target="_blank" rel="noopener noreferrer" aria-label={label} className="grid h-9 w-9 place-items-center rounded-full border transition-colors hover:text-primary" style={{ borderColor: "var(--color-footer-muted)" }}><I className="h-4 w-4" /></a> : null)}
            </div>
          )}
        </div>
        {links.length > 0 && (
          <nav aria-label="Footer"><h4 className="mb-3 text-sm font-bold" style={head}>Quick Links</h4>
            <ul className="space-y-2 text-sm">{links.map((n) => <li key={n.id}><a href={n.linkType === "external" ? n.destination : navHref(n.destination)} {...(n.linkType === "external" ? { target: "_blank", rel: "noopener noreferrer" } : {})} className="transition-colors hover:text-primary" style={muted}>{n.label}</a></li>)}</ul>
          </nav>
        )}
        {services.length > 0 && (
          <div><h4 className="mb-3 text-sm font-bold" style={head}>Our Services</h4>
            <ul className="space-y-2 text-sm">{services.slice(0, 7).map((s) => <li key={s.id}><a href={`/site/${ctx.slug}/services/${contentSlug(s.name)}`} className="transition-colors hover:text-primary" style={muted}>{s.name}</a></li>)}</ul>
          </div>
        )}
        {(address || b.phone || b.email || (f.showHours && b.hours)) && (
          <div><h4 className="mb-3 text-sm font-bold" style={head}>Contact Info</h4>
            <ul className="space-y-3 text-sm" style={muted}>
              {address && <li className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />{address}</li>}
              {b.phone && <li className="flex gap-2"><Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden /><a href={telHref(b.phone)}>{b.phone}</a></li>}
              {b.email && <li className="flex gap-2"><Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden /><a href={`mailto:${b.email}`} className="break-all">{b.email}</a></li>}
              {f.showHours && b.hours && <li className="flex gap-2"><Clock className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />{b.hours}</li>}
            </ul>
          </div>
        )}
      </div>
      {mapQuery && <section className="footer-location wrap" aria-label="Location">
        <div className="footer-location-copy"><p className="eyebrow">VISIT OR CONTACT</p><h2>{name}</h2><p>{address}</p></div>
        <iframe title={`Map showing ${name}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" className="h-64 w-full border-0" src={hasCoordinates ? `https://maps.google.com/maps?q=loc:${b.latitude},${b.longitude}&ll=${b.latitude},${b.longitude}&z=18&output=embed` : `https://maps.google.com/maps?q=${encodeURIComponent(mapQuery)}&z=16&output=embed`} />
      </section>}
      <div className="border-t" style={{ borderColor: "color-mix(in srgb, var(--color-footer-muted) 35%, transparent)" }}>
        <div className="wrap flex flex-wrap items-center justify-between gap-2 py-4 text-xs" style={muted}>
          <p>{f.copyrightText || `© ${year} ${name}. All rights reserved.`}</p>
          <div className="flex gap-4">
            {f.privacyUrl && <a href={f.privacyUrl} className="hover:text-primary">Privacy Policy</a>}
            {f.termsUrl && <a href={f.termsUrl} className="hover:text-primary">Terms &amp; Conditions</a>}
          </div>
        </div>
      </div>
    </footer>
  );
}
