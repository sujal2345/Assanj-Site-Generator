"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, Inbox, LogOut, PlusCircle, Settings, Sun, Upload } from "lucide-react";

const NAV = [
  { href: "/", label: "Create Website", icon: PlusCircle, match: (p: string) => p === "/" },
  { href: "/projects", label: "Saved Websites", icon: FolderOpen, match: (p: string) => p.startsWith("/projects") },
  { href: "/import", label: "Import Companies", icon: Upload, match: (p: string) => p.startsWith("/import") },
  { href: "/leads", label: "Leads", icon: Inbox, match: (p: string) => p.startsWith("/leads") },
  { href: "/settings", label: "Settings", icon: Settings, match: (p: string) => p.startsWith("/settings") },
];

export function Sidebar() {
  const path = usePathname();
  return (
    <aside className="flex shrink-0 flex-row items-center gap-1 overflow-x-auto border-b border-gray-200 bg-white px-3 py-2 lg:sticky lg:top-0 lg:h-screen lg:w-56 lg:flex-col lg:items-stretch lg:gap-1 lg:overflow-visible lg:border-b-0 lg:border-r lg:px-3 lg:py-5">
      <div className="mr-3 flex items-center gap-2 px-2 font-semibold text-gray-900 lg:mb-4 lg:mr-0"><span className="grid h-8 w-8 place-items-center rounded-lg bg-green-600 text-white"><Sun className="h-4 w-4" /></span><span className="hidden whitespace-nowrap text-sm sm:inline">Solar Site Generator</span></div>
      {NAV.map(({ href, label, icon: I, match }) => (
        <Link key={href} href={href} className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition ${match(path) ? "bg-green-50 text-green-800" : "text-gray-600 hover:bg-gray-100"}`}><I className="h-4 w-4" />{label}</Link>
      ))}
      <button onClick={async () => { await fetch("/api/auth/logout", { method: "POST" }); location.href = "/login"; }} className="ml-auto flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 lg:ml-0 lg:mt-auto"><LogOut className="h-4 w-4" />Sign out</button>
    </aside>
  );
}
