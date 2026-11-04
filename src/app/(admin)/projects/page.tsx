import Link from "next/link";
import { ProjectsList } from "@/components/admin/ProjectsList";
import { listWebsites } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  let error = "";
  let sites: Awaited<ReturnType<typeof listWebsites>> = [];
  if (!isSupabaseConfigured()) error = "Supabase is not configured yet. Add your credentials and run the migration (see Settings).";
  else { try { sites = await listWebsites(); } catch (e) { error = (e as Error).message; } }
  return (
    <main className="mx-auto max-w-5xl p-4 lg:p-8">
      <div className="mb-6 flex items-center justify-between"><h1 className="text-xl font-semibold">Saved Websites</h1><Link href="/" className="rounded-lg bg-green-600 px-3.5 py-2 text-sm font-semibold text-white hover:bg-green-700">Create Website</Link></div>
      {error ? <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</p> : <ProjectsList sites={sites} />}
    </main>
  );
}
