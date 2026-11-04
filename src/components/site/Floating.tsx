"use client";
import { MessageCircle, Phone, type LucideIcon } from "lucide-react";
import { telHref, waHref } from "@/lib/site-utils";
import type { SectionProps } from "./ui";

export function Floating({ c }: SectionProps) {
  const phone = c.business.phone.trim();
  const whatsapp = (c.business.whatsapp || phone).trim();
  const actions: { href: string; label: string; Icon: LucideIcon; style: React.CSSProperties }[] = [];
  if (phone) actions.push({ href: telHref(phone), label: "Call us", Icon: Phone, style: { background: "var(--color-primary)", color: "var(--color-button-text)" } });
  if (whatsapp) actions.push({ href: waHref(whatsapp), label: "Chat on WhatsApp", Icon: MessageCircle, style: { background: "#25D366", color: "#062b16" } });

  if (!actions.length) return null;
  return (
    <nav aria-label="Quick contact" className="site-sticky-contact">
      {actions.map(({ href, label, Icon, style }) => (
        <a key={label} href={href} aria-label={label} title={label} style={style}>
          <Icon aria-hidden size={23} strokeWidth={2} />
        </a>
      ))}
    </nav>
  );
}
