import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { HttpError, SetupError } from "./supabase/server";

export async function handle(fn: () => Promise<Response>): Promise<Response> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof SetupError) return NextResponse.json({ error: e.message, setup: true }, { status: 503 });
    if (e instanceof HttpError) return NextResponse.json({ error: e.message, issues: e.issues }, { status: e.status });
    if (e instanceof ZodError) {
      return NextResponse.json({ error: "Some fields need attention.", issues: e.issues.map((i) => ({ path: i.path.join("."), message: i.message })) }, { status: 422 });
    }
    console.error(e);
    return NextResponse.json({ error: "Unexpected server error." }, { status: 500 });
  }
}
