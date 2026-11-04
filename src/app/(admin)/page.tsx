import { Editor } from "@/components/editor/Editor";
import { createDefaultConfig } from "@/lib/defaults";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default function CreatePage() {
  return <Editor initial={createDefaultConfig()} isNew supabaseReady={isSupabaseConfigured()} />;
}
