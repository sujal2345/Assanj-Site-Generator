import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, MapPin, Sun, Zap } from "lucide-react";
import type { SiteConfig } from "@/lib/schema";
import { assetUrl } from "@/lib/assets";
import { contentSlug } from "@/lib/content-slug";
import { presentAnchors } from "@/lib/site-utils";
import { FinalCta } from "./FinalCta";
import type { Ctx } from "./ui";

type Service = SiteConfig["services"][number];
type Project = SiteConfig["projects"][number];

function pageContext(c: SiteConfig): Ctx {
  return { mode: c.status === "published" ? "public" : "preview", slug: c.slug, present: presentAnchors(c) };
}

function Cover({ src, alt }: { src: string; alt: string }) {
  const url = assetUrl(src);
  return url ? <div className="detail-cover"><img src={url} alt={alt} /></div> : <div className="detail-cover detail-cover-empty"><Sun size={52} /></div>;
}

export function ServiceDetail({ c, service }: { c: SiteConfig; service: Service }) {
  const b = c.business;
  const detail = service.details.trim() || service.description;
  const destination = service.ctaUrl.trim();
  const actionHref = /^(https?:|tel:|mailto:)/i.test(destination)
    ? destination
    : `/site/${c.slug}#${(destination || "contact").replace(/^#/, "")}`;
  return <><main className="site-detail">
    <div className="wrap">
      <Link className="detail-back" href={`/site/${c.slug}/services`}><ArrowLeft size={16}/> All services</Link>
      <div className="detail-hero">
        <div className="detail-copy">
          <span className="eyebrow">{b.name || c.name} · Solar solutions</span>
          <h1 className="h1">{service.name}</h1>
          <p className="detail-lede">{service.description}</p>
          {service.priceLabel && <p className="detail-price">{service.priceLabel}</p>}
          <Link className="btn btn-primary" href={actionHref} {...(/^https?:/i.test(actionHref) ? { target: "_blank", rel: "noopener noreferrer" } : {})}>{service.ctaLabel || "Request a tailored quote"}<ArrowRight size={17}/></Link>
        </div>
        <Cover src={service.image.path} alt={service.image.alt || service.name}/>
      </div>
      <div className="detail-body-grid">
        <article className="detail-article"><span className="eyebrow">A thoughtful approach</span><h2 className="h2">Designed around your property and energy goals</h2><div className="detail-prose">{detail.split(/\n\s*\n/).map((paragraph, i) => <p key={i}>{paragraph}</p>)}</div></article>
        <aside className="detail-aside"><span className="detail-icon"><Zap size={21}/></span><h2 className="h3">A clear plan from day one</h2><p>We’ll review your site, usage and priorities, then explain the right next steps in plain language.</p><ul><li><CheckCircle2/> Site and energy assessment</li><li><CheckCircle2/> A system sized to your needs</li><li><CheckCircle2/> Installation and aftercare guidance</li></ul><Link href={`/site/${c.slug}#contact`} className="btn btn-outline">Talk with our team <ArrowRight size={16}/></Link></aside>
      </div>
      <div className="detail-bottom"><span className="eyebrow">Keep exploring</span><h2 className="h2">More ways to make solar work for you</h2><Link className="btn btn-primary" href={`/site/${c.slug}/services`}>Explore all services <ArrowRight size={17}/></Link></div>
    </div>
  </main><FinalCta c={c} ctx={pageContext(c)} /></>;
}

export function ServiceIndex({ c }: { c: SiteConfig }) {
  const services = c.services.filter((x) => x.visible && x.name.trim());
  return <main className="site-detail"><div className="wrap"><Link className="detail-back" href={`/site/${c.slug}`}><ArrowLeft size={16}/> Back to home</Link><header className="detail-index-head"><span className="eyebrow">{c.content.services.eyebrow || "Our services"}</span><h1 className="h1">{c.content.services.heading || "Solar, thoughtfully delivered"}</h1><p>{c.content.services.description || c.business.description}</p></header>
    <div className={`service-editorial-grid service-editorial-grid-count-${Math.min(services.length, 5)}`}>{services.map((s, i) => <article className="service-editorial-card" key={s.id}>
      {assetUrl(s.image.path) ? <div className="service-editorial-image"><img src={assetUrl(s.image.path)!} alt={s.image.alt || s.name} /></div> : <div className="service-editorial-image service-editorial-empty"><Sun size={52}/></div>}
      <div className="service-editorial-shade"/><div className="service-editorial-copy"><span className="service-editorial-index">{String(i + 1).padStart(2, "0")}</span><h2>{s.name}</h2><p>{s.description}</p>{s.priceLabel && <p className="service-index-price">{s.priceLabel}</p>}
        <Link href={`/site/${c.slug}/services/${contentSlug(s.name)}`} className="service-index-link">Explore this service <ArrowRight size={16}/></Link>
      </div>
    </article>)}</div>
    <div className="detail-bottom"><span className="eyebrow">Have a project in mind?</span><h2 className="h2">Let’s find the right solar solution for you.</h2><Link className="btn btn-primary" href={`/site/${c.slug}#contact`}>Request a consultation <ArrowRight size={17}/></Link></div></div></main>;
}

export function ProjectDetail({ c, project }: { c: SiteConfig; project: Project }) {
  const hero = project.images.find((x) => x.path);
  return <main className="site-detail"><div className="wrap"><Link className="detail-back" href={`/site/${c.slug}/projects`}><ArrowLeft size={16}/> All projects</Link><div className="detail-project-hero"><div><span className="eyebrow">{project.category || "Project story"}</span><h1 className="h1">{project.name}</h1><p className="detail-lede">{project.description}</p>{project.location && <p className="detail-meta"><MapPin size={17}/>{project.location}</p>}</div><Cover src={hero?.path || ""} alt={hero?.alt || project.name}/></div><div className="detail-facts">{project.capacity && <div><span>System capacity</span><strong>{project.capacity}</strong></div>}{project.completedAt && <div><span>Completed</span><strong>{project.completedAt}</strong></div>}{project.results && <div><span>Project outcome</span><strong>{project.results}</strong></div>}</div>{project.images.length > 1 && <div className="detail-gallery">{project.images.slice(1).map((img, i) => <Cover key={i} src={img.path} alt={img.alt || `${project.name} photo ${i + 2}`}/>)}</div>}<div className="detail-bottom"><span className="eyebrow">Your property could be next</span><h2 className="h2">Start a conversation about your project.</h2><Link className="btn btn-primary" href={`/site/${c.slug}#contact`}>Discuss your project <ArrowRight size={17}/></Link></div></div></main>;
}

export function ProjectIndex({ c }: { c: SiteConfig }) {
  const projects = c.projects.filter((x) => x.visible && x.name.trim());
  return <main className="site-detail"><div className="wrap"><Link className="detail-back" href={`/site/${c.slug}`}><ArrowLeft size={16}/> Back to home</Link><header className="detail-index-head"><span className="eyebrow">{c.content.projects.eyebrow || "Our work"}</span><h1 className="h1">{c.content.projects.heading || "Projects built around real needs"}</h1><p>{c.content.projects.description}</p></header><div className="detail-service-grid">{projects.map((p) => <article className="detail-service-card" key={p.id}><Cover src={p.images.find((x) => x.path)?.path || ""} alt={p.images[0]?.alt || p.name}/><div><span className="eyebrow">{[p.category, p.location].filter(Boolean).join(" · ") || "Project"}</span><h2 className="h3">{p.name}</h2><p>{p.description}</p><Link href={`/site/${c.slug}/projects/${contentSlug(p.name)}`} className="detail-link">View project <ArrowRight size={16}/></Link></div></article>)}</div></div></main>;
}
