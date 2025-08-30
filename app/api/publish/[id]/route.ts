import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidateTag } from "next/cache";

export async function POST(_: NextRequest, { params }: { params: { id: string }}) {
  const { data, error } = await supabaseAdmin.from("products")
    .update({ visibility: "published", updated_at: new Date().toISOString() })
    .eq("id", params.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  try { revalidateTag("products"); } catch {}

  return NextResponse.json({ ok: true, product: data });
}
