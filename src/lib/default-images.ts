import { unsplash } from "./assets";
import type { ImageRef } from "./schema";

/** The photo set used by the sample site, reused when a site has no uploaded image. */
export const DEMO_IMAGES = {
  hero: { path: unsplash("photo-1613665813446-82a78c468a1d", 2000), alt: "Rooftop solar panels at sunset" },
  house: { path: unsplash("photo-1613665813446-82a78c468a1d", 1000), alt: "Solar panels on a home" },
  field: { path: unsplash("photo-1509391366360-2e959784a276", 1000), alt: "Solar panels under a blue sky" },
  roof: { path: unsplash("photo-1497440001374-f26997328c1b", 900), alt: "Commercial rooftop solar panels" },
  array: { path: unsplash("photo-1508514177221-188b1cf16e9d", 900), alt: "Ground-mounted solar array" },
  panels: { path: unsplash("photo-1559302504-64aae6ca6b6d", 1200), alt: "Solar panels" },
  crew: { path: unsplash("photo-1624397640148-949b1732bb0a", 500), alt: "Solar installation team" },
} satisfies Record<string, ImageRef>;

export function imageOr(image: ImageRef, fallback: ImageRef): ImageRef {
  return image.path.trim() ? image : fallback;
}
