import { NextRequest, NextResponse } from "next/server";
import { handle } from "@/lib/api";
import { HttpError } from "@/lib/supabase/server";
import { parseImportFile } from "@/lib/import/parse";
export const dynamic = "force-dynamic";
export const POST = (req: NextRequest) => handle(async () => {
  const form = await req.formData(); const file = form.get("file");
  if (!(file instanceof File)) throw new HttpError(400, "Choose a spreadsheet or data file to import.");
  return NextResponse.json(await parseImportFile(file));
});
