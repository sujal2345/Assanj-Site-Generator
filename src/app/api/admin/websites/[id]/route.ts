import { NextResponse } from "next/server";
import { z } from "zod";
import { handle } from "@/lib/api";
import { deleteWebsite, duplicateWebsite, getWebsiteById } from "@/lib/db";
import { HttpError } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
const idOf = (id: string) => {
  const r = z.string().uuid().safeParse(id);
  if (!r.success) throw new HttpError(404, "Website not found.");
  return r.data;
};

export const GET = (_: Request, { params }: { params: { id: string } }) =>
  handle(async () => {
    const config = await getWebsiteById(idOf(params.id));
    if (!config) throw new HttpError(404, "Website not found.");
    return NextResponse.json({ config });
  });

export const DELETE = (_: Request, { params }: { params: { id: string } }) =>
  handle(async () => {
    await deleteWebsite(idOf(params.id));
    return NextResponse.json({ ok: true });
  });

/** POST = duplicate into a new draft */
export const POST = (_: Request, { params }: { params: { id: string } }) =>
  handle(async () => NextResponse.json({ config: await duplicateWebsite(idOf(params.id)) }));
