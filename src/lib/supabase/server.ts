import { createClient, SupabaseClient } from "@supabase/supabase-js";

export class SetupError extends Error {
  constructor(message = "Supabase is not configured. Add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to .env.local, run the SQL migration, then restart the server.") {
    super(message);
  }
}
export class HttpError extends Error {
  constructor(public status: number, message: string, public issues?: unknown) { super(message); }
}

export function isSupabaseConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

let cached: SupabaseClient | null = null;
/** Service-role client. Server only: never import this from a client component. */
export function getServiceClient(): SupabaseClient {
  if (!isSupabaseConfigured()) throw new SetupError();
  cached ??= createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return cached;
}
