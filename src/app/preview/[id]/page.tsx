import { notFound, redirect } from "next/navigation";
import { getWebsiteById } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const metadata = { title: "Opening website", robots: { index: false, follow: false } };

export default async function PreviewPage({ params }: { params: { id: string } }) {
  if (!isSupabaseConfigured() || !/^[0-9a-f-]{36}$/i.test(params.id)) notFound();
  const site = await getWebsiteById(params.id);
  if (!site) notFound();
  redirect(`/site/${site.slug}`);
}
