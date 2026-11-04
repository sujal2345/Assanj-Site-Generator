import { createClient, SupabaseClient } from "@supabase/supabase-js";

let cached: SupabaseClient | null = null;
/**
 * Anon-key client for the browser. The first version of the app does not need it
 * (all reads/writes go through server routes), but it is here for when Supabase Auth is added.
 */
export function getBrowserClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  cached ??= createClient(url, key);
  return cached;
}
