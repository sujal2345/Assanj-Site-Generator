import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, isAdminCookie } from "@/lib/auth";

export async function middleware(req: NextRequest) {
  if (await isAdminCookie(req.cookies.get(ADMIN_COOKIE)?.value)) return NextResponse.next();
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/login";
  url.search = `?next=${encodeURIComponent(req.nextUrl.pathname)}`;
  return NextResponse.redirect(url);
}

// Public: generated sites and previews, lead intake, login, static files, sitemap/robots.
export const config = {
  matcher: ["/((?!_next/|images/|site/|preview/|api/leads|api/auth|login|favicon|robots.txt|sitemap.xml).*)"],
};
