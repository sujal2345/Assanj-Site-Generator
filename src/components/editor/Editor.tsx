"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormProvider, Resolver, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CheckCircle2, ExternalLink, Globe, Loader2, Monitor, Rocket, Save, Smartphone, Sparkles, Tablet, X } from "lucide-react";
import { siteConfigSchema, SiteConfig } from "@/lib/schema";
import { createDemoConfig } from "@/lib/demo";
import { BrandingTab, BusinessTab, ContentTab, ItemsTab, SectionsTab } from "./tabs";

const TABS = [
  { id: "business", label: "Business", prefixes: ["business", "slug", "name", "seo"] },
  { id: "branding", label: "Branding", prefixes: ["theme", "layout"] },
  { id: "content", label: "Content", prefixes: ["content", "navigation", "navCta"] },
  { id: "items", label: "Images & Services", prefixes: ["services", "projects", "testimonials", "faqs"] },
  { id: "sections", label: "Sections", prefixes: ["sectionOrder", "sectionEnabled"] },
] as const;
const DEVICES = { desktop: { w: "100%", Icon: Monitor }, tablet: { w: "820px", Icon: Tablet }, mobile: { w: "390px", Icon: Smartphone } } as const;
const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);

type Toast = { kind: "ok" | "error"; text: string; links?: { href: string; label: string }[]; list?: string[] } | null;
type Action = "draft" | "generate" | "publish" | "unpublish";

export function Editor({ initial, isNew, supabaseReady }: { initial: SiteConfig; isNew: boolean; supabaseReady: boolean }) {
  const form = useForm<SiteConfig>({ defaultValues: initial, resolver: zodResolver(siteConfigSchema) as Resolver<SiteConfig>, mode: "onChange" });
  const { control, getValues, setValue, reset, trigger, setError, formState: { errors, isDirty } } = form;
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("business");
  const [device, setDevice] = useState<keyof typeof DEVICES>("desktop");
  const [busy, setBusy] = useState<Action | null>(null);
  const [toast, setToast] = useState<Toast>(null);
  const [fresh, setFresh] = useState(isNew);
  const iframe = useRef<HTMLIFrameElement>(null);
  const slugTouched = useRef(!isNew);

  const values = useWatch({ control }) as SiteConfig;
  const status = values.status;

  /* ---- live preview: post current form values into the iframe -------- */
  const push = useCallback(() => {
    iframe.current?.contentWindow?.postMessage({ type: "ssg:config", config: JSON.parse(JSON.stringify(getValues())) }, window.location.origin);
  }, [getValues]);
  useEffect(() => { const t = setTimeout(push, 60); return () => clearTimeout(t); }, [values, push]);
  useEffect(() => {
    const on = (e: MessageEvent) => e.origin === window.location.origin && e.data?.type === "ssg:ready" && push();
    window.addEventListener("message", on);
    return () => window.removeEventListener("message", on);
  }, [push]);

  /* ---- keep internal name + slug in sync with the business name ------ */
  const bizName = values.business?.name ?? "";
  useEffect(() => {
    setValue("name", bizName.trim() || getValues("name"), { shouldDirty: false });
    if (!slugTouched.current) setValue("slug", slugify(bizName), { shouldDirty: false });
  }, [bizName, setValue, getValues]);
  const slugVal = values.slug;
  useEffect(() => { if (slugVal && slugVal !== slugify(bizName)) slugTouched.current = true; }, [slugVal, bizName]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (isDirty) { e.preventDefault(); e.returnValue = ""; } };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [isDirty]);
  useEffect(() => { if (toast?.kind === "ok") { const t = setTimeout(() => setToast(null), 8000); return () => clearTimeout(t); } }, [toast]);

  const tabErrors = useMemo(() => {
    const flat: string[] = [];
    const walk = (o: any, p: string) => { if (!o || typeof o !== "object") return; if (typeof o.message === "string" && o.type) { flat.push(p); return; } for (const k of Object.keys(o)) walk(o[k], p ? `${p}.${k}` : k); };
    walk(errors, "");
    return { flat, byTab: Object.fromEntries(TABS.map((t) => [t.id, flat.filter((p) => t.prefixes.some((x) => p === x || p.startsWith(`${x}.`) || p.startsWith(`${x}[`))).length])) as Record<string, number> };
  }, [errors]);

  async function run(action: Action) {
    setToast(null);
    const ok = await trigger();
    if (!ok) {
      const first = TABS.find((t) => Object.keys(errors).some((k) => t.prefixes.includes(k as never)));
      if (first) setTab(first.id);
      return setToast({ kind: "error", text: "Some fields need attention before this can be saved. Check the highlighted fields." });
    }
    setBusy(action);
    try {
      const cfg = getValues();
      const r = await fetch("/api/admin/websites", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ config: cfg, action }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        const issues: { path: string; message: string }[] = Array.isArray(j.issues) ? j.issues : [];
        issues.forEach((i) => i.path && setError(i.path as never, { type: "server", message: i.message }));
        const first = TABS.find((t) => issues.some((i) => t.prefixes.some((x) => i.path === x || i.path.startsWith(`${x}.`))));
        if (first) setTab(first.id);
        // form state is kept as-is so nothing the user typed is lost
        return setToast({ kind: "error", text: j.error ?? "Could not save.", list: issues.map((i) => i.message) });
      }
      const saved = j.config as SiteConfig;
      reset(saved);
      slugTouched.current = true;
      if (fresh) { window.history.replaceState(null, "", `/projects/${saved.id}`); setFresh(false); }
      const links = [{ href: `/site/${saved.slug}`, label: saved.status === "published" ? "Open website" : "Open draft page" }];
      setToast({
        kind: "ok", links,
        text: action === "draft" ? "Draft saved." : action === "generate" ? "Website generated and published. It is live at its slug." : action === "publish" ? "Published. The site is live at its slug." : "Unpublished. The site is a private draft again.",
      });
    } catch {
      setToast({ kind: "error", text: "Could not reach the server. Your changes are still in the form: try again in a moment." });
    } finally { setBusy(null); }
  }

  function loadSample() {
    if (isDirty && !window.confirm("Replace the current form with sample content for a fictional company?")) return;
    const demo = createDemoConfig();
    demo.id = getValues("id");
    slugTouched.current = true;
    reset(demo, { keepDefaultValues: true });
    Object.keys(demo).length && setValue("name", demo.name, { shouldDirty: true });
    setTab("content");
  }

  const Btn = ({ action, children, primary }: { action: Action; children: React.ReactNode; primary?: boolean }) => (
    <button type="button" onClick={() => run(action)} disabled={!!busy} className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-sm font-semibold transition active:scale-95 disabled:opacity-60 ${primary ? "bg-green-600 text-white hover:bg-green-700" : "border border-gray-300 bg-white text-gray-800 hover:bg-gray-50"}`}>
      {busy === action ? <Loader2 className="h-4 w-4 animate-spin" /> : null}{children}
    </button>
  );

  return (
    <FormProvider {...form}>
      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex flex-wrap items-center gap-3 border-b border-gray-200 bg-white/95 px-4 py-3 backdrop-blur lg:px-6">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-base font-semibold text-gray-900">{values.business?.name || (fresh ? "New website" : values.name)}</h1>
            <p className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
              <span className={`rounded-full px-2 py-0.5 font-medium ${status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>{fresh ? "Not saved yet" : status === "published" ? "Published" : "Draft"}</span>
              {isDirty && <span className="text-amber-600">Unsaved changes</span>}
              {values.updatedAt && <span>Updated <time suppressHydrationWarning>{new Date(values.updatedAt).toLocaleString()}</time></span>}
            </p>
          </div>
          <button type="button" onClick={loadSample} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"><Sparkles className="h-4 w-4" />Load sample content</button>
          <Btn action="draft"><Save className="h-4 w-4" />Save Draft</Btn>
          <Btn action="generate" primary><Rocket className="h-4 w-4" />Generate Website</Btn>
          {!fresh && (status === "published" ? <Btn action="unpublish">Unpublish</Btn> : <Btn action="publish"><Globe className="h-4 w-4" />Publish</Btn>)}
        </header>

        {!supabaseReady && (
          <div role="status" className="flex items-start gap-2 border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-900 lg:px-6">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Supabase is not configured yet. You can build and preview, but saving, uploads and leads need <code className="rounded bg-amber-100 px-1">.env.local</code> credentials and the SQL migration. See <a className="font-semibold underline" href="/settings">Settings</a>.</p>
          </div>
        )}

        <div className="grid flex-1 lg:grid-cols-[minmax(440px,540px)_1fr]">
          <div className="border-gray-200 lg:h-[calc(100vh-var(--hdr,73px))] lg:overflow-y-auto lg:border-r">
            <div className="sticky top-0 z-10 flex gap-1 overflow-x-auto border-b border-gray-200 bg-white px-3 py-2" role="tablist">
              {TABS.map((t) => (
                <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} className={`relative whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium transition ${tab === t.id ? "bg-green-50 text-green-800" : "text-gray-600 hover:bg-gray-100"}`}>
                  {t.label}{tabErrors.byTab[t.id] > 0 && <span className="ml-1.5 rounded-full bg-red-600 px-1.5 text-[10px] font-bold text-white">{tabErrors.byTab[t.id]}</span>}
                </button>
              ))}
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={tab} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }} className="p-4 pb-24">
                {tab === "business" && <BusinessTab />}
                {tab === "branding" && <BrandingTab />}
                {tab === "content" && <ContentTab />}
                {tab === "items" && <ItemsTab />}
                {tab === "sections" && <SectionsTab />}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex min-h-[70vh] flex-col bg-gray-100 lg:h-[calc(100vh-var(--hdr,73px))]">
            <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-2">
              <p className="text-sm font-semibold text-gray-800">Live preview</p>
              <div className="flex gap-1">
                {(Object.keys(DEVICES) as (keyof typeof DEVICES)[]).map((d) => { const I = DEVICES[d].Icon; return <button key={d} aria-label={`${d} preview`} aria-pressed={device === d} onClick={() => setDevice(d)} className={`rounded-md p-1.5 ${device === d ? "bg-green-100 text-green-800" : "text-gray-500 hover:bg-gray-100"}`}><I className="h-4 w-4" /></button>; })}
              </div>
            </div>
            <div className="flex flex-1 justify-center overflow-auto p-3">
              <motion.iframe ref={iframe} title="Website preview" src="/preview/live" animate={{ width: DEVICES[device].w }} transition={{ duration: 0.25 }} className="h-full min-h-[60vh] max-w-full rounded-lg border border-gray-300 bg-white shadow-sm" />
            </div>
          </div>
        </div>

        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }} role={toast.kind === "error" ? "alert" : "status"} className={`fixed bottom-4 right-4 z-50 max-w-sm rounded-xl border p-4 shadow-lg ${toast.kind === "ok" ? "border-green-200 bg-green-50 text-green-900" : "border-red-200 bg-red-50 text-red-900"}`}>
              <div className="flex gap-2">
                {toast.kind === "ok" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> : <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />}
                <div className="min-w-0 flex-1 text-sm">
                  <p className="font-medium">{toast.text}</p>
                  {toast.list && toast.list.length > 0 && <ul className="mt-1 list-inside list-disc text-xs">{toast.list.slice(0, 6).map((m, i) => <li key={i}>{m}</li>)}</ul>}
                  {toast.links && <div className="mt-2 flex flex-wrap gap-3 text-xs font-semibold">{toast.links.map((l) => <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 underline">{l.label}<ExternalLink className="h-3 w-3" /></a>)}</div>}
                </div>
                <button aria-label="Dismiss" onClick={() => setToast(null)}><X className="h-4 w-4" /></button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </FormProvider>
  );
}
