import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, tokenFor } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const key = process.env.ADMIN_ACCESS_KEY;
  if (!key) {
    return NextResponse.json({ error: process.env.NODE_ENV === "production" ? "ADMIN_ACCESS_KEY is not set on the server." : "No ADMIN_ACCESS_KEY set: the dashboard is open in development." }, { status: 400 });
  }
  const { key: given } = (await req.json().catch(() => ({}))) as { key?: string };
  const [a, b] = await Promise.all([tokenFor(given ?? ""), tokenFor(key)]);
  if (a !== b) return NextResponse.json({ error: "Incorrect access key." }, { status: 401 });
  const res = NextResponse.json({ ok: true });
  const isLoopback = ["localhost", "127.0.0.1", "[::1]"].includes(req.nextUrl.hostname);
  const secureCookie = req.nextUrl.protocol === "https:" || (process.env.NODE_ENV === "production" && !isLoopback);
  res.cookies.set(ADMIN_COOKIE, b, { httpOnly: true, sameSite: "lax", secure: secureCookie, path: "/", maxAge: 60 * 60 * 24 * 7 });
  return res;
}
