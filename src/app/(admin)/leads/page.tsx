import { listLeads } from "@/lib/db";
import { isSupabaseConfigured } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LeadsPage() {
  let error = "";
  let leads: Awaited<ReturnType<typeof listLeads>> = [];
  if (!isSupabaseConfigured()) error = "Supabase is not configured yet, so no leads can be loaded. See Settings.";
  else { try { leads = await listLeads(); } catch (e) { error = (e as Error).message; } }
  return (
    <main className="mx-auto max-w-6xl p-4 lg:p-8">
      <h1 className="mb-6 text-xl font-semibold">Leads</h1>
      {error ? <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{error}</p> : leads.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center text-sm text-gray-500">No leads yet. They appear here when visitors submit a quote form on a published site.</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500"><tr>{["Name", "Phone", "Email", "Website", "Source", "Submitted"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l.id} className="border-b border-gray-100 last:border-0">
                  <td className="px-4 py-3 font-medium text-gray-900">{l.name}</td>
                  <td className="px-4 py-3">{l.phone ? <a className="text-green-700 underline" href={`tel:${l.phone}`}>{l.phone}</a> : "—"}</td>
                  <td className="px-4 py-3">{l.email ? <a className="text-green-700 underline" href={`mailto:${l.email}`}>{l.email}</a> : "—"}</td>
                  <td className="px-4 py-3">{l.websiteName}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{l.source}</span></td>
                  <td className="px-4 py-3 text-gray-600"><time suppressHydrationWarning>{new Date(l.createdAt).toLocaleString()}</time></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
