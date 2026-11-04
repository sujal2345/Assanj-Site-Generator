export const ADMIN_COOKIE = "ssg_admin";

export async function sha256Hex(value: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
export async function tokenFor(key: string) { return sha256Hex(`ssg:${key}`); }

/** Dev without a key: open. Production without a key: closed. */
export async function isAdminCookie(value?: string | null) {
  const key = process.env.ADMIN_ACCESS_KEY;
  if (!key) return process.env.NODE_ENV !== "production";
  return !!value && value === (await tokenFor(key));
}
