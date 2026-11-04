export default function Loading() {
  return (
    <main role="status" aria-live="polite" className="grid min-h-screen place-items-center bg-[#f7f8f5] px-6 text-center">
      <div>
        <span aria-hidden className="mx-auto block h-10 w-10 animate-spin border-[3px] border-emerald-800/20 border-t-emerald-800" />
        <p className="mt-4 text-sm font-semibold tracking-wide text-emerald-950">Loading your page…</p>
      </div>
    </main>
  );
}
