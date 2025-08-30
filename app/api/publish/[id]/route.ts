// app/api/publish/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminAuthed } from "@/lib/adminAuth";

export const dynamic = "force-dynamic";

type IdCtx = { params: Promise<{ id: string }> };

export async function POST(_req: NextRequest, ctx: IdCtx) {
  // auth (cookie-based)
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await ctx.params;

  // publish the product (adjust the update if you do a different action)
  const { data, error } = await supabaseAdmin
    .from("products")
    .update({ visibility: "published" })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  try {
    revalidateTag("products");
  } catch {}

  return NextResponse.json({ ok: true, product: data });
}
