"use client";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import Link from "next/link";
import { SolarGridPattern } from "./SolarGridPattern";
import { Modal, SectionHeader, SectionProps, SiteImage } from "./ui";
import type { SiteConfig } from "@/lib/schema";

type Prj = SiteConfig["projects"][number];

export function Projects({ c }: SectionProps) {
  const s = c.content.projects;
  const configuredProjects = c.projects.filter((p) => p.visible && p.name.trim());
  const sourceProjects: Prj[] = configuredProjects;
  const all = sourceProjects.map((project) => {
    const images = project.images.filter((image) => image.path.trim());
    return { ...project, images };
  });
  const cats = useMemo(() => Array.from(new Set(all.map((p) => p.category.trim()).filter(Boolean))), [all]);
  const [cat, setCat] = useState("All");
  const [open, setOpen] = useState<Prj | null>(null);
  const [slide, setSlide] = useState(0);
  const shown = cat === "All" ? all : all.filter((p) => p.category === cat);
  const imgs = open?.images.filter((i) => i.path) ?? [];

  return (
    <section id="projects" className="sec isolate overflow-hidden" style={{ scrollMarginTop: 80 }}>
      <SolarGridPattern />
      <div className="wrap relative z-10">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <SectionHeader eyebrow={s.eyebrow || "Selected Work"} heading={s.heading || "Project gallery"} description={s.description || (!all.length ? "Project details will appear here when installations are ready to share." : "Installations, locations and system details.")} className="!mb-0" />
          {s.showFilter && cats.length > 1 && (
            <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter projects">
              {["All", ...cats].map((x) => (
                <button key={x} role="tab" aria-selected={cat === x} onClick={() => setCat(x)} className="rounded-lg border px-3.5 py-1.5 text-sm font-medium transition-colors" style={cat === x ? { background: "var(--color-primary)", color: "var(--color-button-text)", borderColor: "var(--color-primary)" } : { borderColor: "var(--color-border)", color: "var(--color-heading)" }}>{x}</button>
              ))}
            </div>
          )}
        </div>
        {shown.length ? <motion.div layout className="project-gallery-grid">
          {shown.map((p, i) => (
            <motion.button layout key={p.id} type="button" onClick={() => { setSlide(0); setOpen(p); }} initial={{ opacity: 0, x: 38, clipPath: "inset(0 0 0 100%)" }} whileInView={{ opacity: 1, x: 0, clipPath: "inset(0 0 0 0%)" }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.82, delay: Math.max(0, shown.length - i - 1) * 0.1, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }} className={`project-gallery-item group ${i === 0 ? "project-gallery-feature" : ""}`}>
              <div className="project-gallery-image">
                {p.images[0]?.path ? <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-[1.04]"><SiteImage src={p.images[0].path} alt={p.images[0].alt || p.name} sizes={i === 0 ? "(min-width:1024px) 60vw, 100vw" : "(min-width:1024px) 40vw, 100vw"} /></div> : <div className="project-image-empty">Project image not provided</div>}
                <div className="project-gallery-shade" />
                <div className="project-gallery-caption">
                  <div className="flex flex-wrap gap-2">{p.category && <span>{p.category}</span>}{p.capacity && <span>{p.capacity}</span>}</div>
                  <h3>{p.name}</h3>{p.location && <p><MapPin className="h-3.5 w-3.5" aria-hidden />{p.location}</p>}
                </div>
              </div>
            </motion.button>
          ))}
        </motion.div> : <p className="project-empty-state">No projects are published yet.</p>}
        {configuredProjects.length > 0 && <div className="mt-8 text-center"><Link href={`/site/${c.slug}/projects`} className="btn btn-outline">Explore all projects</Link></div>}
      </div>
      <Modal open={!!open} onClose={() => setOpen(null)} label={open?.name ?? "Project"}>
        {open && (
          <div>
            {imgs.length > 0 && (
              <div className="relative aspect-[16/9] w-full bg-black">
                <SiteImage key={slide} src={imgs[slide % imgs.length].path} alt={imgs[slide % imgs.length].alt || open.name} sizes="800px" className="!object-contain" />
                {imgs.length > 1 && <>
                  <button aria-label="Previous image" onClick={() => setSlide((slide - 1 + imgs.length) % imgs.length)} className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white"><ChevronLeft className="h-5 w-5" /></button>
                  <button aria-label="Next image" onClick={() => setSlide((slide + 1) % imgs.length)} className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full bg-black/60 text-white"><ChevronRight className="h-5 w-5" /></button>
                </>}
              </div>
            )}
            <div className="p-6">
              <h3 className="h2">{open.name}</h3>
              {open.location && <p className="mt-1 text-sm">{open.location}{open.category ? ` · ${open.category}` : ""}</p>}
              {open.description && <p className="mt-3 whitespace-pre-line">{open.description}</p>}
              <dl className="mt-4 flex flex-wrap gap-6 text-sm">
                {open.capacity && <div><dt className="text-xs">System capacity</dt><dd className="font-semibold" style={{ color: "var(--color-heading)" }}>{open.capacity}</dd></div>}
                {open.completedAt && <div><dt className="text-xs">Completed</dt><dd className="font-semibold" style={{ color: "var(--color-heading)" }}>{open.completedAt}</dd></div>}
                {open.results && <div><dt className="text-xs">Results</dt><dd className="font-semibold" style={{ color: "var(--color-heading)" }}>{open.results}</dd></div>}
              </dl>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
