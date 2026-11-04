"use client";
import { useFormContext, useWatch, useFieldArray } from "react-hook-form";
import { motion } from "framer-motion";
import { AlertTriangle, ArrowDown, ArrowUp, GripVertical } from "lucide-react";
import { emptyImage, uid } from "@/lib/defaults";
import { FIELD_KEYS, SECTION_ANCHORS, SECTION_LABELS, SiteConfig } from "@/lib/schema";
import { contrastWarnings, FONT_OPTIONS, THEME_PRESETS } from "@/lib/themes";
import { ColorField, Group, Grid2, IconSelect, ImageField, ListEditor, NumberField, SelectField, TextArea, TextField, Toggle, useDragList } from "./fields";
import { COLOR_KEYS } from "@/lib/schema";

const anchorOptions = Object.values(SECTION_ANCHORS).filter((a) => a !== "floating");
const w = (name: string) => useWatch({ name: name as never }) as any; // eslint-disable-line react-hooks/rules-of-hooks

/* -------------------------------------------------------------- Business */
export function BusinessTab() {
  return (
    <div className="space-y-3">
      <Group title="Basic business information" defaultOpen>
        <Grid2>
          <TextField name="business.name" label="Business name *" />
          <TextField name="slug" label="Website slug *" hint="Public address: /site/your-slug" />
        </Grid2>
        <TextField name="business.tagline" label="Short tagline" />
        <TextArea name="business.description" label="Business description" rows={4} />
        <Grid2>
          <TextField name="business.established" label="Year established" placeholder="2016" />
          <TextField name="business.phone" label="Phone number" placeholder="+91 98765 43210" />
          <TextField name="business.email" label="Email address" type="email" />
          <TextField name="business.whatsapp" label="WhatsApp number" hint="Digits with country code, e.g. 919876543210" />
        </Grid2>
        <TextField name="business.contactUrl" label="Primary contact URL" placeholder="https://" />
      </Group>
      <Group title="Address & hours">
        <TextField name="business.address" label="Business address" />
        <Grid2>
          <TextField name="business.city" label="City" /><TextField name="business.state" label="State or region" />
          <TextField name="business.postalCode" label="Postal code" /><TextField name="business.country" label="Country" />
        </Grid2>
        <TextField name="business.hours" label="Business hours" placeholder="Mon - Sat: 9 AM - 6 PM" />
      </Group>
      <Group title="Social links">
        <Grid2>
          <TextField name="business.facebook" label="Facebook URL" /><TextField name="business.instagram" label="Instagram URL" />
          <TextField name="business.linkedin" label="LinkedIn URL" /><TextField name="business.youtube" label="YouTube URL" />
        </Grid2>
      </Group>
      <Group title="Logo & favicon">
        <ImageField name="business.logo" label="Company logo" folder="logo" hint="Transparent PNG works best. If empty, the site shows the business name as text." />
        <ImageField name="business.favicon" label="Favicon (optional)" folder="favicon" />
      </Group>
      <Group title="SEO & social sharing">
        <TextField name="seo.title" label="Page title" hint="Defaults to the business name" />
        <TextArea name="seo.description" label="Meta description" rows={2} />
        <TextField name="seo.canonical" label="Canonical URL (optional)" placeholder="https://" />
        <Grid2><TextField name="seo.ogTitle" label="Open Graph title" /><TextField name="seo.ogDescription" label="Open Graph description" /></Grid2>
        <ImageField name="seo.ogImage" label="Social sharing image" folder="seo" />
      </Group>
    </div>
  );
}

/* -------------------------------------------------------------- Branding */
export function BrandingTab() {
  const { setValue } = useFormContext<SiteConfig>();
  const colors = w("theme.colors");
  const warnings = colors ? contrastWarnings(colors) : [];
  return (
    <div className="space-y-3">
      <Group title="Theme presets & colors" defaultOpen>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {THEME_PRESETS.map((p) => (
            <motion.button whileTap={{ scale: 0.97 }} key={p.name} type="button" onClick={() => { setValue("theme.colors", { ...p.colors }, { shouldDirty: true, shouldValidate: true }); setValue("theme.preset", p.name, { shouldDirty: true }); }} className="rounded-lg border border-gray-200 p-2 text-left text-xs font-medium text-gray-800 hover:border-green-600">
              <span className="mb-1 flex h-5 overflow-hidden rounded">
                {[p.colors.primary, p.colors.secondary, p.colors.accent, p.colors.surface, p.colors.background].map((c, i) => <span key={i} className="flex-1" style={{ background: c }} />)}
              </span>{p.name}
            </motion.button>
          ))}
        </div>
        <p className="text-xs text-gray-500">Pick a preset, then adjust any color below. Changes show in the preview instantly.</p>
        <div className="grid gap-3 sm:grid-cols-2">
          {COLOR_KEYS.map((k) => <ColorField key={k} name={`theme.colors.${k}`} label={{ primary: "Primary", secondary: "Secondary", accent: "Accent", background: "Main background", surface: "Alternate section background", heading: "Heading color", body: "Body text color", buttonText: "Button text color", border: "Border color", navbar: "Navbar background", footer: "Footer background" }[k]} />)}
        </div>
        {warnings.length > 0 && (
          <div role="status" className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900">
            <p className="mb-1 flex items-center gap-1 font-semibold"><AlertTriangle className="h-4 w-4" />Low contrast (WCAG AA wants 4.5:1)</p>
            <ul className="list-inside list-disc">{warnings.map((x) => <li key={x.label}>{x.label}: {x.ratio.toFixed(2)}:1</li>)}</ul>
          </div>
        )}
      </Group>
      <Group title="Typography">
        <Grid2>
          <SelectField name="theme.typography.headingFont" label="Heading font" options={FONT_OPTIONS} />
          <SelectField name="theme.typography.bodyFont" label="Body font" options={FONT_OPTIONS} />
          <SelectField name="theme.typography.headingWeight" label="Heading weight" options={["500", "600", "700"]} />
          <SelectField name="theme.typography.buttonStyle" label="Button style" options={["solid", "gradient", "outline"]} />
          <NumberField name="theme.typography.baseSize" label="Base font size (px)" min={14} max={20} />
          <NumberField name="theme.typography.headingScale" label="Heading scale (0.85 – 1.3)" min={0.85} max={1.3} step={0.05} />
          <NumberField name="theme.typography.radius" label="Border radius (px)" min={0} max={32} />
        </Grid2>
      </Group>
      <Group title="Layout">
        <Grid2>
          <NumberField name="layout.maxWidth" label="Max content width (px)" min={960} max={1600} step={20} />
          <SelectField name="layout.sectionSpacing" label="Section spacing" options={["compact", "comfortable", "spacious"]} />
          <SelectField name="layout.cardStyle" label="Card style" options={["flat", "bordered", "elevated"]} />
          <NumberField name="layout.imageRadius" label="Image corner radius (px)" min={0} max={40} />
          <SelectField name="layout.buttonShape" label="Button shape" options={["square", "rounded", "pill"]} />
          <SelectField name="layout.headerStyle" label="Header style" options={[{ value: "shadow", label: "Shadow on scroll" }, { value: "border", label: "Always bordered" }]} />
        </Grid2>
      </Group>
    </div>
  );
}

/* --------------------------------------------------------------- Content */
function QuoteFormEditor({ base }: { base: string }) {
  return (
    <div className="space-y-3">
      <Grid2><TextField name={`${base}.title`} label="Form title" /><TextField name={`${base}.submitLabel`} label="Submit button label" /></Grid2>
      <TextField name={`${base}.subtitle`} label="Form subtitle" />
      <TextField name={`${base}.successMessage`} label="Success message" />
      <TextField name={`${base}.privacyNote`} label="Small note under the button" />
      <div className="rounded-lg border border-gray-200">
        {FIELD_KEYS.map((k) => (
          <div key={k} className="grid grid-cols-[1fr_auto_auto] items-end gap-3 border-b border-gray-100 p-2 last:border-0">
            <TextField name={`${base}.fields.${k}.label`} label={k} />
            <Toggle name={`${base}.fields.${k}.enabled`} label="On" />
            <Toggle name={`${base}.fields.${k}.required`} label="Required" />
          </div>
        ))}
      </div>
    </div>
  );
}
const ctaFields = (base: string, label: string) => <Grid2><TextField name={`${base}.label`} label={`${label} label`} /><TextField name={`${base}.destination`} label={`${label} destination`} hint="Section id (e.g. contact), or a full URL" /></Grid2>;
const sectionHead = (b: string, desc = true) => <><Grid2><TextField name={`${b}.eyebrow`} label="Eyebrow" /><TextField name={`${b}.heading`} label="Heading" /></Grid2>{desc && <TextArea name={`${b}.description`} label="Description" rows={2} />}</>;
const iconItem = (base: string, i: number, extra = false) => (
  <>
    <IconSelect name={`${base}.${i}.icon`} /><TextField name={`${base}.${i}.heading`} label="Heading" />
    <TextArea name={`${base}.${i}.description`} label="Description" rows={2} />
    {extra && <ImageField name={`${base}.${i}.image`} label="Optional image" folder="benefits" />}
  </>
);

export function ContentTab() {
  const { getValues } = useFormContext<SiteConfig>();
  const g = (p: string) => (getValues as any)(p);
  return (
    <div className="space-y-3">
      <Group title="Navbar" defaultOpen>
        <ListEditor name="navigation" addLabel="Add link" max={12} makeItem={() => ({ id: uid(), label: "New link", destination: "about", linkType: "section", visible: true })} summary={(i) => g(`navigation.${i}.label`)}>
          {(i) => (
            <>
              <Grid2><TextField name={`navigation.${i}.label`} label="Label" /><SelectField name={`navigation.${i}.linkType`} label="Link type" options={["section", "external"]} /></Grid2>
              <TextField name={`navigation.${i}.destination`} label="Destination" hint={`Section id (${anchorOptions.join(", ")}) or a full https:// URL`} />
              <Toggle name={`navigation.${i}.visible`} label="Visible" />
            </>
          )}
        </ListEditor>
        <p className="text-xs font-semibold text-gray-700">CTA button</p>
        <Grid2><TextField name="navCta.label" label="Label" /><TextField name="navCta.destination" label="Destination" /><SelectField name="navCta.linkType" label="Link type" options={["section", "external"]} /></Grid2>
        <Toggle name="navCta.visible" label="Show CTA button" />
      </Group>

      <Group title="Hero section">
        <SelectField name="content.hero.layout" label="Layout" options={[{ value: "background", label: "Full-width background image (default)" }, { value: "overlay", label: "Image with centered text overlay" }, { value: "split", label: "Split-screen (light)" }, { value: "image-right", label: "Image on the right (light)" }]} />
        <Grid2><TextField name="content.hero.eyebrow" label="Eyebrow text" /><TextField name="content.hero.ratingLabel" label="Rating / credibility label" placeholder="e.g. Rated 4.8 on Google" hint="Only enter what you can verify" /></Grid2>
        <TextField name="content.hero.headline" label="Main headline" hint="Leave empty to auto-generate from the business name" />
        <TextField name="content.hero.highlight" label="Highlighted headline text" hint="A word from the headline to color and underline" />
        <TextArea name="content.hero.description" label="Supporting description" rows={3} />
        <ImageField name="content.hero.background" label="Background image" folder="hero" />
        <ImageField name="content.hero.image" label="Hero image (right-side layouts)" folder="hero" />
        <TextField name="content.hero.videoUrl" label="Video URL (YouTube, Vimeo or .mp4)" hint="The secondary button opens it in a pop-up" />
        {ctaFields("content.hero.primaryCta", "Primary CTA")}
        {ctaFields("content.hero.secondaryCta", "Secondary CTA")}
        <Toggle name="content.hero.showForm" label="Show quote form in hero" />
      </Group>
      <Group title="Hero quote form"><QuoteFormEditor base="content.hero.form" /></Group>
      <Group title="Trust strip (inside hero)">
        <p className="text-xs text-gray-500">Items without a value are hidden. Only add figures you can back up.</p>
        <ListEditor name="content.hero.trust" addLabel="Add trust item" max={8} makeItem={() => ({ id: uid(), icon: "shield-check", value: "", label: "", image: emptyImage() })} summary={(i) => [g(`content.hero.trust.${i}.value`), g(`content.hero.trust.${i}.label`)].filter(Boolean).join(" · ")}>
          {(i) => <><IconSelect name={`content.hero.trust.${i}.icon`} /><Grid2><TextField name={`content.hero.trust.${i}.value`} label="Value" /><TextField name={`content.hero.trust.${i}.label`} label="Label" /></Grid2><ImageField name={`content.hero.trust.${i}.image`} label="Optional logo / image (replaces icon)" folder="hero" /></>}
        </ListEditor>
      </Group>

      <Group title="About us">
        {sectionHead("content.about")}
        <SelectField name="content.about.layout" label="Layout" options={["image-right", "image-left"]} />
        <ImageField name="content.about.image" label="Main image" folder="about" />
        <ImageField name="content.about.imageSecondary" label="Supporting image" folder="about" />
        <Grid2><TextField name="content.about.imageBadge" label="Image badge text" /><TextField name="content.about.yearsExperience" label="Years of experience (e.g. 10+)" /></Grid2>
        <Grid2><TextField name="content.about.ctaLabel" label="CTA label" /><TextField name="content.about.ctaLink" label="CTA link" /></Grid2>
        <p className="text-xs font-semibold text-gray-700">Company statistics</p>
        <ListEditor name="content.about.stats" addLabel="Add statistic" max={6} makeItem={() => ({ id: uid(), value: "", label: "" })} summary={(i) => `${g(`content.about.stats.${i}.value`)} ${g(`content.about.stats.${i}.label`)}`}>
          {(i) => <Grid2><TextField name={`content.about.stats.${i}.value`} label="Value" /><TextField name={`content.about.stats.${i}.label`} label="Label" /></Grid2>}
        </ListEditor>
        <p className="text-xs font-semibold text-gray-700">Highlights (icon chips)</p>
        <ListEditor name="content.about.highlights" addLabel="Add highlight" max={6} makeItem={() => ({ id: uid(), icon: "badge-check", label: "" })} summary={(i) => g(`content.about.highlights.${i}.label`)}>
          {(i) => <Grid2><IconSelect name={`content.about.highlights.${i}.icon`} /><TextField name={`content.about.highlights.${i}.label`} label="Label" /></Grid2>}
        </ListEditor>
      </Group>
      <Group title="Savings calculator (inside About)">
        <Toggle name="content.about.calculator.enabled" label="Enable calculator" hint="Only appears when an electricity rate and offset assumptions are set below" />
        <Grid2>
          <TextField name="content.about.calculator.title" label="Title" /><TextField name="content.about.calculator.currency" label="Currency symbol" />
          <NumberField name="content.about.calculator.defaultBill" label="Default monthly bill" min={0} />
          <NumberField name="content.about.calculator.ratePerUnit" label="Average electricity rate per unit" min={0} step={0.01} hint="Required: calculator stays hidden at 0" />
          <NumberField name="content.about.calculator.fixedCharge" label="Fixed monthly charges (not offset by solar)" min={0} />
          <TextField name="content.about.calculator.region" label="Location / region" />
          <NumberField name="content.about.calculator.offsetMinPct" label="Assumed bill offset, low (%)" min={0} max={100} />
          <NumberField name="content.about.calculator.offsetMaxPct" label="Assumed bill offset, high (%)" min={0} max={100} />
        </Grid2>
        <TextArea name="content.about.calculator.description" label="Description" rows={2} />
        <TextField name="content.about.calculator.roofNote" label="Roof suitability note (optional)" />
        <p className="text-xs text-gray-500">Model: savings = (bill − fixed charges) × assumed offset %, shown as a range and labelled illustrative. Set the offset range to what your engineers consider realistic.</p>
      </Group>

      <Group title="Services section"><Grid2><TextField name="content.services.eyebrow" label="Eyebrow" /><TextField name="content.services.heading" label="Heading" /></Grid2><TextArea name="content.services.description" label="Description" rows={2} /><SelectField name="content.services.layout" label="Layout" options={["image-cards", "icon-cards", "horizontal", "featured"]} /><p className="text-xs text-gray-500">Add the services themselves in the “Images & Services” tab.</p></Group>
      <Group title="Benefits of solar">
        {sectionHead("content.benefits")}
        <Toggle name="content.benefits.decoration" label="Leaf decoration" />
        <ListEditor name="content.benefits.items" addLabel="Add benefit" max={8} makeItem={() => ({ id: uid(), icon: "leaf", heading: "", description: "", image: emptyImage() })} summary={(i) => g(`content.benefits.items.${i}.heading`)}>{(i) => iconItem("content.benefits.items", i, true)}</ListEditor>
      </Group>
      <Group title="Why choose us">
        {sectionHead("content.why")}
        <p className="text-xs text-gray-500">Only add reasons that are true for this business. The section is hidden while empty.</p>
        <ListEditor name="content.why.items" addLabel="Add reason" max={8} makeItem={() => ({ id: uid(), icon: "badge-check", heading: "", description: "", image: emptyImage() })} summary={(i) => g(`content.why.items.${i}.heading`)}>{(i) => iconItem("content.why.items", i, true)}</ListEditor>
      </Group>
      <Group title="Our process">
        {sectionHead("content.process")}
        <ListEditor name="content.process.steps" addLabel="Add step" max={8} makeItem={() => ({ id: uid(), title: "", description: "" })} summary={(i) => g(`content.process.steps.${i}.title`)}>
          {(i) => <><TextField name={`content.process.steps.${i}.title`} label="Title" /><TextArea name={`content.process.steps.${i}.description`} label="Description" rows={2} /></>}
        </ListEditor>
      </Group>
      <Group title="Projects section">{sectionHead("content.projects")}<Toggle name="content.projects.showFilter" label="Show category filter" /></Group>
      <Group title="Testimonials section"><Grid2><TextField name="content.testimonials.eyebrow" label="Eyebrow" /><TextField name="content.testimonials.heading" label="Heading" /></Grid2><SelectField name="content.testimonials.layout" label="Layout" options={["carousel", "grid"]} /></Group>
      <Group title="FAQ section">{sectionHead("content.faq")}<ImageField name="content.faq.background" label="Section background image" folder="backgrounds" /></Group>
      <Group title="Final CTA + form">
        {sectionHead("content.cta")}
        <ImageField name="content.cta.background" label="Background image (optional)" folder="backgrounds" />
        <Grid2><TextField name="content.cta.buttonLabel" label="Button label (optional)" /><TextField name="content.cta.buttonLink" label="Button link" /></Grid2>
        <Toggle name="content.cta.showPhone" label="Show phone button" />
        <p className="text-xs font-semibold text-gray-700">Highlights</p>
        <ListEditor name="content.cta.bullets" addLabel="Add highlight" max={5} makeItem={() => ({ id: uid(), icon: "badge-check", label: "" })} summary={(i) => g(`content.cta.bullets.${i}.label`)}>
          {(i) => <Grid2><IconSelect name={`content.cta.bullets.${i}.icon`} /><TextField name={`content.cta.bullets.${i}.label`} label="Label" /></Grid2>}
        </ListEditor>
        <p className="text-xs font-semibold text-gray-700">Form (independent of the hero form)</p>
        <QuoteFormEditor base="content.cta.form" />
      </Group>
      <Group title="Floating contact CTA">
        <p className="text-xs text-gray-500">Mobile: bottom bar. Desktop: small buttons bottom-right. Enable it in the Sections tab. Call/WhatsApp use the business phone numbers when destination is empty.</p>
        <ListEditor name="content.floating.actions" addLabel="Add action" max={4} makeItem={() => ({ id: uid(), type: "custom", label: "Action", icon: "phone", destination: "", visible: true })} summary={(i) => g(`content.floating.actions.${i}.label`)}>
          {(i) => <><Grid2><SelectField name={`content.floating.actions.${i}.type`} label="Type" options={["call", "whatsapp", "quote", "custom"]} /><TextField name={`content.floating.actions.${i}.label`} label="Label" /><IconSelect name={`content.floating.actions.${i}.icon`} /><TextField name={`content.floating.actions.${i}.destination`} label="Destination (optional)" /></Grid2><Toggle name={`content.floating.actions.${i}.visible`} label="Visible" /></>}
        </ListEditor>
      </Group>
      <Group title="Footer">
        <TextArea name="content.footer.description" label="Short company description" rows={2} hint="Defaults to the tagline / description" />
        <Grid2><TextField name="content.footer.privacyUrl" label="Privacy Policy URL" /><TextField name="content.footer.termsUrl" label="Terms URL" /></Grid2>
        <TextField name="content.footer.copyrightText" label="Copyright text (optional)" />
        <Toggle name="content.footer.showHours" label="Show business hours" />
        <ImageField name="content.footer.background" label="Footer background (light footers only)" folder="backgrounds" />
      </Group>
    </div>
  );
}

/* ----------------------------------------------------------------- Items */
function ProjectImages({ index }: { index: number }) {
  const { control } = useFormContext<SiteConfig>();
  const { fields, append, remove } = useFieldArray({ control, name: `projects.${index}.images` as never, keyName: "fid" as never });
  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-gray-700">Image gallery</p>
      {fields.map((f: any, k) => (
        <div key={f.fid} className="rounded-lg border border-gray-200 p-2">
          <ImageField name={`projects.${index}.images.${k}`} label={`Image ${k + 1}`} folder="projects" />
          <button type="button" onClick={() => remove(k)} className="mt-1 text-xs text-red-600">Remove this image</button>
        </div>
      ))}
      {fields.length < 12 && <button type="button" onClick={() => append(emptyImage() as never)} className="rounded-lg border border-green-600 px-3 py-1.5 text-sm font-medium text-green-700 hover:bg-green-50">+ Add image</button>}
    </div>
  );
}

export function ItemsTab() {
  const { getValues } = useFormContext<SiteConfig>();
  const g = (p: string) => (getValues as any)(p);
  const svc = (name: string, icon: string) => ({ label: name, make: () => ({ id: uid(), name, description: "", details: "", image: emptyImage(), icon, priceLabel: "", ctaLabel: "", ctaUrl: "", visible: true }) });
  return (
    <div className="space-y-3">
      <Group title="Services" defaultOpen>
        <ListEditor name="services" addLabel="Add service" max={40} empty="No services yet. Add one or use a quick-add suggestion."
          quickAdd={[svc("Residential Solar Installation", "home"), svc("Commercial Solar Installation", "building"), svc("Battery Storage", "battery"), svc("Solar Panel Maintenance", "wrench"), svc("Solar Consultation", "users")]}
          makeItem={() => ({ id: uid(), name: "", description: "", details: "", image: emptyImage(), icon: "sun", priceLabel: "", ctaLabel: "", ctaUrl: "", visible: true })}
          summary={(i) => g(`services.${i}.name`)}>
          {(i) => (
            <>
              <TextField name={`services.${i}.name`} label="Service name" />
              <TextArea name={`services.${i}.description`} label="Short description" rows={2} />
              <TextArea name={`services.${i}.details`} label="Detailed description (opens in a pop-up)" rows={3} />
              <ImageField name={`services.${i}.image`} label="Service image" folder="services" />
              <Grid2><IconSelect name={`services.${i}.icon`} /><TextField name={`services.${i}.priceLabel`} label="Starting price (optional)" placeholder="From ₹…" /><TextField name={`services.${i}.ctaLabel`} label="CTA label (optional)" /><TextField name={`services.${i}.ctaUrl`} label="CTA destination" hint="Defaults to the contact form" /></Grid2>
              <Toggle name={`services.${i}.visible`} label="Visible" />
            </>
          )}
        </ListEditor>
      </Group>
      <Group title="Projects & installations">
        <p className="text-xs text-gray-500">Only list real, completed projects.</p>
        <ListEditor name="projects" addLabel="Add project" max={100} makeItem={() => ({ id: uid(), name: "", description: "", location: "", category: "", images: [], capacity: "", completedAt: "", results: "", visible: true })} summary={(i) => g(`projects.${i}.name`)}>
          {(i) => (
            <>
              <TextField name={`projects.${i}.name`} label="Project name" />
              <Grid2><TextField name={`projects.${i}.location`} label="Location" /><TextField name={`projects.${i}.category`} label="Category" placeholder="Residential" /><TextField name={`projects.${i}.capacity`} label="System capacity (if known)" /><TextField name={`projects.${i}.completedAt`} label="Completion date (if provided)" /></Grid2>
              <TextArea name={`projects.${i}.description`} label="Short description" rows={2} />
              <TextField name={`projects.${i}.results`} label="Results / metrics (optional)" />
              <ProjectImages index={i} />
              <Toggle name={`projects.${i}.visible`} label="Visible" />
            </>
          )}
        </ListEditor>
      </Group>
      <Group title="Testimonials">
        <p className="text-xs text-gray-500">Only add testimonials the customer or business owner has actually provided.</p>
        <ListEditor name="testimonials" addLabel="Add testimonial" max={100} makeItem={() => ({ id: uid(), customerName: "", text: "", photo: emptyImage(), company: "", location: "", rating: 0, sourceUrl: "", visible: true })} summary={(i) => g(`testimonials.${i}.customerName`)}>
          {(i) => (
            <>
              <TextField name={`testimonials.${i}.customerName`} label="Customer name" />
              <TextArea name={`testimonials.${i}.text`} label="Testimonial" rows={3} />
              <Grid2><TextField name={`testimonials.${i}.company`} label="Company (optional)" /><TextField name={`testimonials.${i}.location`} label="Location (optional)" /><NumberField name={`testimonials.${i}.rating`} label="Star rating (0 = none)" min={0} max={5} /><TextField name={`testimonials.${i}.sourceUrl`} label="Source URL (optional)" /></Grid2>
              <ImageField name={`testimonials.${i}.photo`} label="Customer photo (optional)" folder="testimonials" />
              <Toggle name={`testimonials.${i}.visible`} label="Visible" />
            </>
          )}
        </ListEditor>
      </Group>
      <Group title="FAQs" badge="answers required to show">
        <p className="text-xs text-gray-500">Questions with an empty answer stay hidden. Avoid promises you cannot keep.</p>
        <ListEditor name="faqs" addLabel="Add question" max={40} makeItem={() => ({ id: uid(), question: "", answer: "", visible: true })} summary={(i) => g(`faqs.${i}.question`)}>
          {(i) => <><TextField name={`faqs.${i}.question`} label="Question" /><TextArea name={`faqs.${i}.answer`} label="Answer" rows={3} /><Toggle name={`faqs.${i}.visible`} label="Visible" /></>}
        </ListEditor>
      </Group>
    </div>
  );
}

/* -------------------------------------------------------------- Sections */
export function SectionsTab() {
  const { setValue } = useFormContext<SiteConfig>();
  const order = (useWatch({ name: "sectionOrder" }) as SiteConfig["sectionOrder"]) ?? [];
  const enabled = (useWatch({ name: "sectionEnabled" }) as SiteConfig["sectionEnabled"]) ?? ({} as SiteConfig["sectionEnabled"]);
  const move = (from: number, to: number) => {
    if (to < 0 || to >= order.length) return;
    const next = [...order]; const [x] = next.splice(from, 1); next.splice(to, 0, x);
    setValue("sectionOrder", next, { shouldDirty: true });
  };
  const dnd = useDragList(move);
  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">Turn sections on or off and drag to reorder. The navbar is always first and the footer last. Sections with no content (for example Projects with no projects) stay hidden automatically.</p>
      <ul className="space-y-2">
        {order.map((t, i) => {
          const d = dnd(i);
          return (
            <motion.li layout key={t} data-card {...d.target} className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2.5">
              <span {...d.handle} title="Drag to reorder" className="cursor-grab text-gray-400 hover:text-gray-700"><GripVertical className="h-4 w-4" /></span>
              <span className="flex-1 text-sm font-medium text-gray-800">{SECTION_LABELS[t]}{t === "floating" && <span className="block text-xs font-normal text-gray-500">Position does not matter: it floats</span>}</span>
              <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, i - 1)} className="p-1 text-gray-400 hover:text-gray-800 disabled:opacity-30"><ArrowUp className="h-4 w-4" /></button>
              <button type="button" aria-label="Move down" disabled={i === order.length - 1} onClick={() => move(i, i + 1)} className="p-1 text-gray-400 hover:text-gray-800 disabled:opacity-30"><ArrowDown className="h-4 w-4" /></button>
              <button type="button" role="switch" aria-checked={!!enabled[t]} aria-label={`Show ${SECTION_LABELS[t]}`} onClick={() => setValue(`sectionEnabled.${t}`, !enabled[t], { shouldDirty: true })} className={`relative h-5 w-9 rounded-full transition-colors ${enabled[t] ? "bg-green-600" : "bg-gray-300"}`}>
                <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${enabled[t] ? "left-[18px]" : "left-0.5"}`} />
              </button>
            </motion.li>
          );
        })}
      </ul>
    </div>
  );
}
