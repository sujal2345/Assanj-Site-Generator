"use client";
import { useEffect, useState } from "react";
import { SiteRenderer } from "@/components/site/SiteRenderer";
import type { SiteConfig } from "@/lib/schema";

/** Rendered inside the editor's iframe. The editor posts its current form values; this page re-renders instantly. */
export default function LivePreview() {
  const [config, setConfig] = useState<SiteConfig | null>(null);
  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.data?.type !== "ssg:config") return;
      setConfig(e.data.config as SiteConfig);
    };
    window.addEventListener("message", onMsg);
    window.parent?.postMessage({ type: "ssg:ready" }, window.location.origin);
    return () => window.removeEventListener("message", onMsg);
  }, []);
  if (!config) return <p style={{ font: "14px system-ui", padding: 24, color: "#6b7280" }}>Loading preview…</p>;
  return <SiteRenderer config={config} mode="live" />;
}
