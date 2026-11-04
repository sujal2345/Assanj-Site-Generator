"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ExternalLink, Loader2, MessageCircle, Pencil, Trash2, X } from "lucide-react";
import type { WebsiteSummary } from "@/lib/db";

export function ProjectsList({ sites }: { sites: WebsiteSummary[] }) {
  const [list, setList] = useState(sites);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<WebsiteSummary | null>(null);
  const [messageSite, setMessageSite] = useState<WebsiteSummary | null>(null);
  const [error, setError] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [messagedSites, setMessagedSites] = useState<string[]>([]);

  useEffect(() => {
    try { setMessagedSites(JSON.parse(localStorage.getItem("solar-messaged-sites") || "[]")); } catch { setMessagedSites([]); }
  }, []);

  function markMessaged(id: string) {
    setMessagedSites((current) => {
      const next = current.includes(id) ? current : [...current, id];
      localStorage.setItem("solar-messaged-sites", JSON.stringify(next));
      return next;
    });
  }

  async function call(id: string, method: "DELETE") {
    setBusy(id); setError("");
    try {
      const r = await fetch(`/api/admin/websites/${id}`, { method });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error ?? "Request failed");
      setList((l) => l.filter((x) => x.id !== id));
    } catch (e) { setError((e as Error).message); } finally { setBusy(null); setConfirm(null); }
  }

  function normalizedPhone(site: WebsiteSummary): string {
    const countries: Record<string, string> = { india: "91", in: "91", "+91": "91", "91": "91", usa: "1", "united states": "1", us: "1", canada: "1", uk: "44", "united kingdom": "44", gb: "44", australia: "61", au: "61", uae: "971", ae: "971", singapore: "65", sg: "65" };
    const country = site.country.trim().toLowerCase();
    const countryCode = countries[country] ?? (/^\+?\d{1,3}$/.test(country) ? country.replace(/^\+/, "") : "");
    for (const value of [site.whatsapp, site.phone]) {
      const original = value.trim();
      if (!original) continue;
      let digits = original.replace(/\D/g, "");
      const international = original.startsWith("+") || original.startsWith("00");
      if (digits.startsWith("00")) digits = digits.slice(2);
      if (international && digits.length >= 8 && digits.length <= 15) return digits;
      if (digits.length === 11 && digits.startsWith("0") && (!countryCode || countryCode === "91")) digits = digits.slice(1);
      if (digits.length === 12 && digits.startsWith("91")) return digits;
      if (digits.length === 10 && countryCode === "91") return `91${digits}`;
      if (countryCode && digits.length >= 7 && digits.length <= 12) return `${countryCode}${digits.replace(/^0+/, "")}`.slice(0, 15);
      if (digits.length === 10 && !countryCode) return `91${digits}`;
    }
    return "";
  }

  function openWhatsApp() {
    if (!messageSite) return;
    const phone = normalizedPhone(messageSite);
    if (!phone) { setError(`No valid phone or WhatsApp number is saved for ${messageSite.name}.`); return; }
    const url = `${window.location.origin}/site/${messageSite.slug}`;
    const message = `Hi [Name],
I'm Sujal from ASSANJ.
I made a website for ${messageSite.name} to help showcase your solar services and attract more enquiries.
Website: ${url}
Like it? Love it? Wanna change it?

नमस्ते [Name],
मैं Sujal, ASSANJ से।
मैंने ${messageSite.name} के लिए एक वेबसाइट बनाई है, जिससे आपकी सोलर सेवाएँ बेहतर तरीके से दिखें और ज़्यादा enquiries मिलें।
*Website:* ${url}
पसंद आई? और बेहतर बनानी है? कुछ बदलना है? 😊`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    setMessageSite(null); setError("");
  }

  if (!list.length) return (
    <div className="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center">
      <p className="font-medium text-gray-800">No websites yet</p>
      <p className="mt-1 text-sm text-gray-500">Create your first solar company website.</p>
      <Link href="/" className="mt-4 inline-block rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">Create Website</Link>
    </div>
  );
  const filteredList = list.filter((site) => {
    const uploaded = new Date(site.createdAt).getTime();
    const afterFrom = !fromDate || uploaded >= new Date(`${fromDate}T00:00:00`).getTime();
    const beforeTo = !toDate || uploaded < new Date(`${toDate}T00:00:00`).getTime() + 86400000;
    return afterFrom && beforeTo;
  });
  const latestUpdatedId = list.reduce<string | null>((latest, site) => !latest || new Date(site.updatedAt) > new Date(list.find((item) => item.id === latest)!.updatedAt) ? site.id : latest, null);

  return (
    <>
      {error && <p role="alert" className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-xl border border-gray-200 bg-white p-3">
        <label className="text-xs font-medium text-gray-600">Uploaded from<input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} className="mt-1 block rounded-lg border border-gray-300 px-2.5 py-2 text-sm text-gray-900" /></label>
        <label className="text-xs font-medium text-gray-600">Uploaded through<input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} className="mt-1 block rounded-lg border border-gray-300 px-2.5 py-2 text-sm text-gray-900" /></label>
        {(fromDate || toDate) && <button onClick={() => { setFromDate(""); setToDate(""); }} className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100">Clear dates</button>}
        <span className="ml-auto text-xs text-gray-500">{filteredList.length} of {list.length} sites</span>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr><th className="px-4 py-3">Website</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Created</th><th className="px-4 py-3">Updated</th><th className="px-4 py-3 text-right">Actions</th></tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {filteredList.map((s) => (
                <motion.tr key={s.id} layout exit={{ opacity: 0 }} className={`border-b border-gray-100 last:border-0 ${s.id === latestUpdatedId ? "bg-amber-50" : ""}`}>
                  <td className="px-4 py-3"><p className="font-medium text-gray-900">{s.name}</p><p className="text-xs text-gray-500">/site/{s.slug}{s.city ? ` · ${s.city}` : ""}</p></td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-0.5 text-xs font-medium ${s.status === "published" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-700"}`}>{s.status}</span></td>
                  <td className="px-4 py-3 text-gray-600"><time suppressHydrationWarning>{new Date(s.createdAt).toLocaleString()}</time></td>
                  <td className="px-4 py-3 text-gray-600"><time suppressHydrationWarning>{new Date(s.updatedAt).toLocaleString()}</time></td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-1">
                      <Link href={`/projects/${s.id}`} aria-label="Edit" className="rounded-md p-2 text-gray-600 hover:bg-gray-100"><Pencil className="h-4 w-4" /></Link>
                      <a href={`/site/${s.slug}`} target="_blank" aria-label={`Open website ${s.name}`} className="rounded-md p-2 text-gray-600 hover:bg-gray-100"><ExternalLink className="h-4 w-4" /></a>
                      <button aria-label={`WhatsApp ${s.name}`} onClick={() => { markMessaged(s.id); setMessageSite(s); setError(""); }} className={`rounded-md p-2 hover:bg-amber-50 ${messagedSites.includes(s.id) ? "text-amber-500" : "text-green-700"}`}><MessageCircle className={`h-4 w-4 ${messagedSites.includes(s.id) ? "fill-amber-400" : ""}`} /></button>
                      <button aria-label="Delete" onClick={() => setConfirm(s)} className="rounded-md p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      <AnimatePresence>
        {messageSite && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div role="dialog" aria-modal="true" aria-labelledby="whatsapp-title" initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
              <div className="flex items-start justify-between"><div><h2 id="whatsapp-title" className="font-semibold text-gray-900">Message {messageSite.name}</h2><p className="mt-1 text-sm text-gray-600">WhatsApp will open with your message filled in. Review it and press Send there.</p></div><button aria-label="Close" onClick={() => setMessageSite(null)} className="rounded-md p-1 text-gray-500 hover:bg-gray-100"><X size={18}/></button></div>
              <p className="mt-4 rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm leading-relaxed text-gray-600">The draft includes your message in English and Hindi. The recipient name is left as [Name] for you to fill in before sending.</p>
              {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
              <div className="mt-5 flex justify-end gap-2"><button onClick={() => setMessageSite(null)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium">Cancel</button><button onClick={openWhatsApp} className="inline-flex items-center gap-2 rounded-lg bg-green-700 px-4 py-2 text-sm font-semibold text-white"><MessageCircle size={16}/>Open WhatsApp</button></div>
            </motion.div>
          </motion.div>
        )}
        {confirm && (
          <motion.div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div role="alertdialog" aria-modal="true" initial={{ scale: 0.95 }} animate={{ scale: 1 }} className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl">
              <h2 className="font-semibold text-gray-900">Delete “{confirm.name}”?</h2>
              <p className="mt-1 text-sm text-gray-600">This removes the website, its leads and its uploaded images permanently.</p>
              <div className="mt-4 flex justify-end gap-2">
                <button onClick={() => setConfirm(null)} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium">Cancel</button>
                <button onClick={() => call(confirm.id, "DELETE")} disabled={busy === confirm.id} className="rounded-lg bg-red-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-60">{busy === confirm.id ? "Deleting…" : "Delete"}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
