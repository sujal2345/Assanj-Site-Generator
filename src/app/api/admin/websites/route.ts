import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { handle } from "@/lib/api";
import { listWebsites, saveWebsite } from "@/lib/db";
import { siteConfigSchema } from "@/lib/schema";
import { HttpError } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const GET = () => handle(async () => NextResponse.json({ websites: await listWebsites() }));

const body = z.object({ config: siteConfigSchema, action: z.enum(["draft", "generate", "publish", "unpublish"]) });

export const POST = (req: NextRequest) =>
  handle(async () => {
    if (!req.headers.get("content-type")?.includes("application/json")) throw new HttpError(415, "Expected JSON");
    const { config: submittedConfig, action } = body.parse(await req.json());
    // Generating a site publishes it immediately; publishing an existing draft uses the same path.
    const saveAction = action === "generate" ? "publish" : action;
    const saved = await saveWebsite(submittedConfig, saveAction);
    return NextResponse.json({ config: saved });
  });
