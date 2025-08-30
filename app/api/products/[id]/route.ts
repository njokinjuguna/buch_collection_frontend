import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { isAdminAuthed } from "@/lib/adminAuth";

export async function PATCH(req: NextRequest, { params }: { params: { id: string }}) {
  if (!isAdminAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  body.updated_at = new Date().toISOString();

  const { data, error } = await supabaseAdmin
    .from("products")
    .update(body)
    .eq("id", params.id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  try { revalidateTag("products"); } catch {}
  return NextResponse.json(data);
}

export async function DELETE(_: NextRequest, { params }: { params: { id: string }}) {
  if (!isAdminAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { error } = await supabaseAdmin.from("products").delete().eq("id", params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  try { revalidateTag("products"); } catch {}
  return NextResponse.json({ ok: true });
}
