"use client";
import { ReactNode, useEffect, useRef, useState } from "react";
import { Controller, get, useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, GripVertical, ImagePlus, Loader2, Plus, Trash2, ArrowUp, ArrowDown, X } from "lucide-react";
import { assetUrl } from "@/lib/assets";
import { ICON_NAMES } from "@/lib/icons";
import { uid } from "@/lib/defaults";
import type { SiteConfig } from "@/lib/schema";

export const inputCls = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-green-600 focus:ring-2 focus:ring-green-600/20 aria-[invalid=true]:border-red-500";
const useErr = (name: string) => {
  const { formState: { errors } } = useFormContext<SiteConfig>();
  return get(errors, name)?.message as string | undefined;
};

export function Field({ label, hint, error, children, className = "" }: { label?: string; hint?: string; error?: string; children: ReactNode; className?: string }) {
  return (
    <div className={className}>
      {label && <label className="mb-1 block text-xs font-semibold text-gray-700">{label}</label>}
      {children}
      {hint && !error && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
      {error && <p role="alert" className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}

export function TextField({ name, label, placeholder, hint, type = "text", className, ...rest }: { name: string; label: string; placeholder?: string; hint?: string; type?: string; className?: string; maxLength?: number }) {
  const { register } = useFormContext<SiteConfig>();
  const error = useErr(name);
  const id = `f-${name}`;
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      <input id={id} type={type} placeholder={placeholder} aria-invalid={!!error} className={inputCls} {...rest} {...register(name as never)} />
    </Field>
  );
}
export function NumberField({ name, label, min, max, step = 1, hint, className }: { name: string; label: string; min?: number; max?: number; step?: number; hint?: string; className?: string }) {
  const { register } = useFormContext<SiteConfig>();
  const error = useErr(name);
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      <input type="number" min={min} max={max} step={step} aria-invalid={!!error} className={inputCls} {...register(name as never, { valueAsNumber: true })} />
    </Field>
  );
}
export function TextArea({ name, label, rows = 3, hint, className }: { name: string; label: string; rows?: number; hint?: string; className?: string }) {
  const { register } = useFormContext<SiteConfig>();
  const error = useErr(name);
  return (
    <Field label={label} hint={hint} error={error} className={className}>
      <textarea rows={rows} aria-invalid={!!error} className={inputCls} {...register(name as never)} />
    </Field>
  );
}
export function SelectField({ name, label, options, className, hint }: { name: string; label: string; options: (string | { value: string; label: string })[]; className?: string; hint?: string }) {
  const { register } = useFormContext<SiteConfig>();
  const error = useErr(name);
  return (
    <Field label={label} error={error} hint={hint} className={className}>
      <select className={inputCls} {...register(name as never)}>
        {options.map((o) => { const v = typeof o === "string" ? o : o.value; const l = typeof o === "string" ? o : o.label; return <option key={v} value={v}>{l}</option>; })}
      </select>
    </Field>
  );
}
export function IconSelect({ name, label = "Icon" }: { name: string; label?: string }) {
  return <SelectField name={name} label={label} options={["", ...ICON_NAMES]} />;
}
export function Toggle({ name, label, hint }: { name: string; label: string; hint?: string }) {
  const { control } = useFormContext<SiteConfig>();
  return (
    <Controller control={control} name={name as never} render={({ field }) => (
      <label className="flex cursor-pointer items-start gap-3 py-1">
        <button type="button" role="switch" aria-checked={!!field.value} onClick={() => field.onChange(!field.value)} className={`relative mt-0.5 h-5 w-9 shrink-0 rounded-full transition-colors ${field.value ? "bg-green-600" : "bg-gray-300"}`}>
          <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${field.value ? "left-[18px]" : "left-0.5"}`} />
        </button>
        <span className="text-sm text-gray-800">{label}{hint && <span className="block text-xs text-gray-500">{hint}</span>}</span>
      </label>
    )} />
  );
}

export function ColorField({ name, label }: { name: string; label: string }) {
  const { control } = useFormContext<SiteConfig>();
  return (
    <Controller control={control} name={name as never} render={({ field }) => <ColorInput label={label} value={field.value as string} onChange={field.onChange} />} />
  );
}
function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const [draft, setDraft] = useState(value);
  useEffect(() => setDraft(value), [value]);
  return (
    <Field label={label}>
      <div className="flex items-center gap-2">
        <input type="color" aria-label={`${label} picker`} value={/^#[0-9a-f]{6}$/i.test(value) ? value : "#000000"} onChange={(e) => onChange(e.target.value)} className="h-9 w-10 cursor-pointer rounded-md border border-gray-300 bg-white p-0.5" />
        <input aria-label={`${label} HEX`} value={draft} maxLength={7} onChange={(e) => { const v = e.target.value.startsWith("#") ? e.target.value : `#${e.target.value}`; setDraft(v); if (/^#[0-9a-f]{6}$/i.test(v)) onChange(v.toLowerCase()); }} className={`${inputCls} font-mono uppercase`} />
      </div>
    </Field>
  );
}

/* ----------------------------------------------------------------- images */
const OK_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"];
export function ImageField({ name, label, folder, hint }: { name: string; label: string; folder: string; hint?: string }) {
  const { setValue, getValues, register } = useFormContext<SiteConfig>();
  const img = (useWatch({ name: name as never }) as { path: string; alt: string } | undefined) ?? { path: "", alt: "" };
  const [local, setLocal] = useState("");
  const [progress, setProgress] = useState<number | null>(null);
  const [err, setErr] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const isIcon = folder === "favicon";

  function upload(file: File) {
    setErr("");
    if (!(OK_TYPES.includes(file.type) || (isIcon && /icon/.test(file.type)))) return setErr("Use a PNG, JPG, WebP or GIF image" + (isIcon ? " (or ICO)" : "") + ".");
    if (file.size > 5 * 1024 * 1024) return setErr("Image must be 5 MB or smaller.");
    const url = URL.createObjectURL(file);
    setLocal(url); setProgress(0);
    const fd = new FormData();
    fd.set("file", file); fd.set("websiteId", getValues("id")); fd.set("folder", folder);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/admin/upload");
    xhr.upload.onprogress = (e) => e.lengthComputable && setProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      setProgress(null);
      let j: any = {}; try { j = JSON.parse(xhr.responseText); } catch {}
      if (xhr.status === 200 && j.path) { setValue(`${name}.path` as never, j.path as never, { shouldDirty: true, shouldValidate: true }); }
      else { setErr(j.error ?? "Upload failed."); setLocal(""); }
    };
    xhr.onerror = () => { setProgress(null); setErr("Network error while uploading."); setLocal(""); };
    xhr.send(fd);
  }
  const shown = local || assetUrl(img.path);
  return (
    <div>
      <p className="mb-1 text-xs font-semibold text-gray-700">{label}</p>
      <motion.div
        animate={{ borderColor: drag ? "#16a34a" : "#d1d5db", backgroundColor: drag ? "#f0fdf4" : "#ffffff" }}
        onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files?.[0]; if (f) upload(f); }}
        className="flex items-center gap-3 rounded-xl border border-dashed p-3 hover:border-green-500"
      >
        <div className="relative grid h-16 w-24 shrink-0 place-items-center overflow-hidden rounded-lg bg-gray-100">
          {shown ? <img src={shown} alt="" className="max-h-full max-w-full object-contain" /> : <ImagePlus className="h-5 w-5 text-gray-400" />}
          {progress !== null && <div className="absolute inset-0 grid place-items-center bg-white/80 text-xs font-semibold text-green-700"><Loader2 className="mr-1 h-3 w-3 animate-spin" />{progress}%</div>}
        </div>
        <div className="min-w-0 flex-1 text-xs text-gray-500">
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => input.current?.click()} className="rounded-md border border-gray-300 bg-white px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 active:scale-95">{img.path ? "Replace" : "Upload"}</button>
            {img.path && <button type="button" onClick={() => { setValue(`${name}.path` as never, "" as never, { shouldDirty: true }); setLocal(""); }} className="rounded-md border border-red-200 px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50">Remove</button>}
          </div>
          <p className="mt-1">{hint ?? "PNG, JPG, WebP or GIF, up to 5 MB. Drag and drop works too."}</p>
        </div>
        <input ref={input} type="file" accept={isIcon ? "image/*,.ico" : OK_TYPES.join(",")} hidden onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
      </motion.div>
      {err && <p role="alert" className="mt-1 text-xs text-red-600">{err}</p>}
      {img.path && <input placeholder="Alt text (describe the image)" className={`${inputCls} mt-2`} {...register(`${name}.alt` as never)} />}
    </div>
  );
}

/* --------------------------------------------------------- drag & reorder */
export function useDragList(onMove: (from: number, to: number) => void) {
  const from = useRef<number | null>(null);
  return (i: number) => ({
    handle: {
      draggable: true,
      onDragStart: (e: React.DragEvent) => { from.current = i; e.dataTransfer.effectAllowed = "move"; const el = (e.currentTarget as HTMLElement).closest("[data-card]"); if (el) e.dataTransfer.setDragImage(el, 16, 16); },
      onDragEnd: () => { from.current = null; },
    },
    target: {
      onDragOver: (e: React.DragEvent) => { if (from.current !== null) e.preventDefault(); },
      onDrop: (e: React.DragEvent) => { e.preventDefault(); if (from.current !== null && from.current !== i) onMove(from.current, i); from.current = null; },
    },
  });
}

export function Group({ title, children, defaultOpen = false, badge }: { title: string; children: ReactNode; defaultOpen?: boolean; badge?: string }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-xl border border-gray-200 bg-white">
      <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} className="flex w-full items-center justify-between px-4 py-3 text-left text-sm font-semibold text-gray-900">
        <span>{title}{badge && <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-500">{badge}</span>}</span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} className="overflow-hidden">
            <div className="space-y-4 border-t border-gray-100 p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
export const Grid2 = ({ children }: { children: ReactNode }) => <div className="grid gap-4 sm:grid-cols-2">{children}</div>;

function DeleteButton({ onConfirm }: { onConfirm: () => void }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => { if (!armed) return; const t = setTimeout(() => setArmed(false), 3000); return () => clearTimeout(t); }, [armed]);
  return armed
    ? <button type="button" onClick={onConfirm} className="rounded-md bg-red-600 px-2 py-1 text-xs font-semibold text-white">Confirm delete</button>
    : <button type="button" aria-label="Delete item" onClick={() => setArmed(true)} className="rounded-md p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-600"><Trash2 className="h-4 w-4" /></button>;
}

/** Reorderable, add/remove-able list bound to a react-hook-form field array. */
export function ListEditor({ name, addLabel, makeItem, summary, children, max = 40, empty, quickAdd }: {
  name: string; addLabel: string; makeItem: () => any; summary: (i: number) => string; children: (i: number) => ReactNode; max?: number; empty?: string; quickAdd?: { label: string; make: () => any }[];
}) {
  const { control } = useFormContext<SiteConfig>();
  const { fields, append, remove, move } = useFieldArray({ control, name: name as never, keyName: "fid" as never });
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const dnd = useDragList(move);
  const added = useRef(false);
  useEffect(() => {
    if (added.current && fields.length) { setOpen((o) => ({ ...o, [(fields[fields.length - 1] as any).fid]: true })); added.current = false; }
  }, [fields]);
  const watched = useWatch({ name: name as never }) as any[] | undefined;
  return (
    <div className="space-y-2">
      {fields.length === 0 && <p className="rounded-lg border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">{empty ?? "Nothing here yet."}</p>}
      <AnimatePresence initial={false}>
        {fields.map((f: any, i) => {
          const d = dnd(i);
          const isOpen = !!open[f.fid];
          const hidden = watched?.[i] && "visible" in watched[i] && watched[i].visible === false;
          return (
            <motion.div layout key={f.fid} data-card initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} {...d.target} className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
              <div className="flex items-center gap-1 px-2 py-2">
                <span {...d.handle} aria-label="Drag to reorder" title="Drag to reorder" className="cursor-grab rounded p-1 text-gray-400 hover:text-gray-700 active:cursor-grabbing"><GripVertical className="h-4 w-4" /></span>
                <button type="button" onClick={() => setOpen({ ...open, [f.fid]: !isOpen })} aria-expanded={isOpen} className="min-w-0 flex-1 truncate text-left text-sm font-medium text-gray-800">
                  {summary(i) || <span className="text-gray-400">Untitled</span>}{hidden && <span className="ml-2 text-xs text-gray-400">(hidden)</span>}
                </button>
                <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, i - 1)} className="rounded p-1 text-gray-400 hover:text-gray-800 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
                <button type="button" aria-label="Move down" disabled={i === fields.length - 1} onClick={() => move(i, i + 1)} className="rounded p-1 text-gray-400 hover:text-gray-800 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
                <DeleteButton onConfirm={() => remove(i)} />
              </div>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div initial={{ height: 0 }} animate={{ height: "auto" }} exit={{ height: 0 }} className="overflow-hidden">
                    <div className="space-y-3 border-t border-gray-200 bg-white p-3">{children(i)}</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" disabled={fields.length >= max} onClick={() => { added.current = true; append(makeItem() as never); }} className="inline-flex items-center gap-1 rounded-lg border border-green-600 px-3 py-1.5 text-sm font-medium text-green-700 transition hover:bg-green-50 active:scale-95 disabled:opacity-40"><Plus className="h-4 w-4" />{addLabel}</button>
        {quickAdd?.map((q) => <button key={q.label} type="button" onClick={() => { added.current = true; append(q.make() as never); }} className="rounded-full border border-gray-300 px-2.5 py-1 text-xs text-gray-600 hover:bg-gray-100">+ {q.label}</button>)}
      </div>
    </div>
  );
}

export { uid, X };
