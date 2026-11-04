"use client";
import { useMemo, useRef, useState } from "react";
import { Resolver, useForm } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Home, Loader2, Mail, MapPin, Phone, Receipt, User, Wrench, Hash } from "lucide-react";
import { FIELD_KEYS, FieldKey, PROPERTY_TYPES, QuoteFormConfig } from "@/lib/schema";
import { validateLead } from "@/lib/lead";
import type { Ctx } from "./ui";

const ICON: Record<FieldKey, typeof User> = { name: User, phone: Phone, email: Mail, propertyType: Home, monthlyBill: Receipt, postalCode: Hash, city: MapPin, serviceInterest: Wrench, message: User };
const TYPE: Partial<Record<FieldKey, string>> = { phone: "tel", email: "email", monthlyBill: "text" };
const AUTO: Partial<Record<FieldKey, string>> = { name: "name", phone: "tel", email: "email", postalCode: "postal-code" };

export function QuoteForm({ cfg, source, ctx, services, twoCol = false, showHeading = true }: { cfg: QuoteFormConfig; source: "hero" | "final_cta"; ctx: Ctx; services: string[]; twoCol?: boolean; showHeading?: boolean }) {
  const resolver = useMemo<Resolver<Record<string, string>>>(
    () => async (values) => {
      const { errors } = validateLead(values, cfg);
      const keys = Object.keys(errors);
      if (!keys.length) return { values, errors: {} };
      return { values: {}, errors: Object.fromEntries(keys.map((k) => [k, { type: "validate", message: errors[k] }])) } as never;
    },
    [cfg],
  );
  const { register, handleSubmit, reset, setError, formState: { errors } } = useForm<Record<string, string>>({ resolver });
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const started = useRef(Date.now());
  const hp = useRef<HTMLInputElement>(null);
  const live = ctx.mode === "public";
  const enabled = FIELD_KEYS.filter((k) => cfg.fields[k].enabled);

  async function onSubmit(values: Record<string, string>) {
    if (status === "submitting") return; // prevents accidental double submits
    if (!live) { setStatus("error"); setMessage("Preview only: submissions are disabled until the site is published."); return; }
    setStatus("submitting"); setMessage("");
    try {
      const r = await fetch("/api/leads", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: ctx.slug, source, values, hp: hp.current?.value ?? "", elapsedMs: Date.now() - started.current }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok) { setStatus("success"); reset(); return; }
      if (r.status === 422 && j.issues && typeof j.issues === "object") {
        for (const [k, m] of Object.entries(j.issues as Record<string, string>)) setError(k, { message: m });
      }
      setStatus("error"); setMessage(j.error ?? "Something went wrong. Please try again.");
    } catch {
      setStatus("error"); setMessage("Network problem. Please check your connection and try again.");
    }
  }

  return (
    <div className="card p-5 sm:p-6" style={{ background: "var(--color-background)", boxShadow: "0 24px 50px -24px rgba(0,0,0,.45)" }}>
      {showHeading && cfg.title && <h3 className="h3 mb-1">{cfg.title}</h3>}
      {showHeading && cfg.subtitle && <p className="mb-4 text-sm muted">{cfg.subtitle}</p>}
      <AnimatePresence mode="wait">
        {status === "success" ? (
          <motion.div key="ok" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="py-8 text-center" role="status">
            <CheckCircle2 className="mx-auto mb-3 h-10 w-10 text-primary" />
            <p className="font-semibold" style={{ color: "var(--color-heading)" }}>{cfg.successMessage || "Thank you! We have received your request."}</p>
            <button className="btn btn-outline btn-sm mt-4" onClick={() => setStatus("idle")}>Send another request</button>
          </motion.div>
        ) : (
          <motion.form key="form" noValidate onSubmit={handleSubmit(onSubmit)} className={`grid gap-3 ${twoCol ? "sm:grid-cols-2" : ""}`} initial={false}>
            {enabled.map((k) => {
              const f = cfg.fields[k];
              const Icon = ICON[k];
              const err = errors[k]?.message as string | undefined;
              const id = `${source}-${k}`;
              const wide = twoCol && k === "message";
              return (
                <div key={k} className={wide ? "sm:col-span-2" : ""}>
                  <label htmlFor={id} className="label">{f.label}{f.required && <span aria-hidden className="text-red-600"> *</span>}</label>
                  <div className="relative">
                    {k !== "message" && <Icon aria-hidden className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 opacity-60" />}
                    {k === "propertyType" || (k === "serviceInterest" && services.length > 0) ? (
                      <select id={id} className="input" aria-invalid={!!err} {...register(k)} defaultValue="">
                        <option value="">Select…</option>
                        {(k === "propertyType" ? [...PROPERTY_TYPES] : services).map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : k === "message" ? (
                      <textarea id={id} rows={3} className="input" aria-invalid={!!err} {...register(k)} />
                    ) : (
                      <input id={id} className="input" type={TYPE[k] ?? "text"} inputMode={k === "monthlyBill" ? "decimal" : undefined} autoComplete={AUTO[k]} aria-invalid={!!err} {...register(k)} />
                    )}
                  </div>
                  {err && <p role="alert" className="mt-1 text-xs text-red-600">{err}</p>}
                </div>
              );
            })}
            {/* honeypot: hidden from people, visible to bots */}
            <div aria-hidden style={{ position: "absolute", left: "-9999px", height: 0, overflow: "hidden" }}>
              <label>Leave empty<input ref={hp} tabIndex={-1} autoComplete="off" name="company_website" /></label>
            </div>
            {status === "error" && message && <p role="alert" className={`rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ${twoCol ? "sm:col-span-2" : ""}`}>{message}</p>}
            <button type="submit" disabled={status === "submitting"} className={`btn btn-primary ${twoCol ? "sm:col-span-2" : ""}`}>
              {status === "submitting" ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : cfg.submitLabel || "Submit"}
            </button>
            {cfg.privacyNote && <p className={`text-center text-xs muted ${twoCol ? "sm:col-span-2" : ""}`}>{cfg.privacyNote}</p>}
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
