"use client";
import { useState } from "react";
import { Sun } from "lucide-react";

export default function LoginPage() {
  const [key, setKey] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/auth/login", { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ key }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) {
        setErr(j.error ?? "Could not sign in.");
        setBusy(false);
        return;
      }
      const next = new URLSearchParams(location.search).get("next") || "/";
      location.assign(next.startsWith("/") && !next.startsWith("//") ? next : "/");
    } catch {
      setErr("Could not reach the sign-in service. Please try again.");
      setBusy(false);
    }
  }
  return (
    <main className="grid min-h-screen place-items-center bg-gray-50 p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-gray-200 bg-white p-6">
        <div className="flex items-center gap-2 font-semibold text-gray-900"><Sun className="h-5 w-5 text-green-600" /> Solar Website Generator</div>
        <label className="block text-sm font-medium text-gray-700">Access key
          <input type="password" value={key} onChange={(e) => setKey(e.target.value)} autoFocus className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-2 focus:ring-green-600/20" />
        </label>
        {err && <p role="alert" className="text-sm text-red-600">{err}</p>}
        <button disabled={busy || !key} className="w-full rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50">{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </main>
  );
}
