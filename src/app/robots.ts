import type { MetadataRoute } from "next";
import { getBaseUrl } from "@/lib/base-url";

export const dynamic = "force-dynamic";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/site/", disallow: ["/api/", "/preview/", "/projects", "/leads", "/settings", "/login"] }],
    sitemap: `${getBaseUrl()}/sitemap.xml`,
  };
}
