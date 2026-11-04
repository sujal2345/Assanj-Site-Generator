import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const Row = ({ ok, label, hint }: { ok: boolean; label: string; hint: string }) => (
  <li className="flex items-start gap-3 rounded-lg border border-gray-200 bg-white p-3">
    <span className={`mt-1 h-2.5 w-2.5 shrink-0 rounded-full ${ok ? "bg-green-500" : "bg-amber-500"}`} />
    <div><p className="text-sm font-medium text-gray-900">{label} <span className="text-xs font-normal text-gray-500">{ok ? "set" : "missing"}</span></p><p className="text-xs text-gray-500">{hint}</p></div>
  </li>
);

export default function SettingsPage() {
  return (
    <main className="mx-auto max-w-2xl p-4 lg:p-8">
      <h1 className="mb-1 text-xl font-semibold">Settings & setup</h1>
      <p className="mb-6 text-sm text-gray-600">{isSupabaseConfigured() ? "Environment variables are present. If saving fails, make sure the SQL migration has been run." : "Supabase is not connected yet. Follow the steps below."}</p>
      <ul className="space-y-2">
        <Row ok={!!process.env.NEXT_PUBLIC_SUPABASE_URL} label="NEXT_PUBLIC_SUPABASE_URL" hint="Supabase → Project Settings → API → Project URL" />
        <Row ok={!!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY} label="NEXT_PUBLIC_SUPABASE_ANON_KEY" hint="Public anon key (not used for writes in this version)" />
        <Row ok={!!process.env.SUPABASE_SERVICE_ROLE_KEY} label="SUPABASE_SERVICE_ROLE_KEY" hint="Server only. Never expose to the browser." />
        <Row ok={!!process.env.ADMIN_ACCESS_KEY} label="ADMIN_ACCESS_KEY" hint="Required in production to protect this dashboard." />
      </ul>
      <ol className="mt-8 list-decimal space-y-2 pl-5 text-sm text-gray-700">
        <li>Copy <code>.env.example</code> to <code>.env.local</code> and fill in the values, then restart <code>npm run dev</code>.</li>
        <li>Run <code>supabase/migrations/0001_init.sql</code> in the Supabase SQL editor. It creates all tables, RLS policies, the <code>website-assets</code> bucket and the atomic <code>save_website</code> function.</li>
        <li>Create a website and click <strong>Generate Website</strong> to fill the demo template and publish it.</li>
      </ol>
    </main>
  );
}
