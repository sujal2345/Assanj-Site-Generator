export const BUCKET = "website-assets";

/** Resolve a stored image path to a URL. Accepts storage paths, absolute https URLs and local /public paths. */
export function assetUrl(path: string | undefined | null): string {
  if (!path) return "";
  if (/^https?:\/\//i.test(path) || path.startsWith("/")) return path;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
  return base ? `${base}/storage/v1/object/public/${BUCKET}/${path}` : "";
}

export function unsplash(id: string, w = 1200) {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${w}&q=75`;
}
