import Link from "next/link";
import { notFound } from "next/navigation";
import { Editor } from "@/components/editor/Editor";
import { getWebsiteById } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function EditPage({ params }: { params: { id: string } }) {
  if (!isSupabaseConfigured()) {
    return <div className="p-8"><p className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">Supabase is not configured, so saved websites cannot be loaded. See <Link className="underline" href="/settings">Settings</Link>.</p></div>;
  }
  if (!/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const site = await getWebsiteById(params.id);
  if (!site) notFound();
  return <Editor initial={site} isNew={false} supabaseReady />;
}
