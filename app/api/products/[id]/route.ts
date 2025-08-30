// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type IdCtx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, ctx: IdCtx) {
  const { id } = await ctx.params;

  const { data, error } = await supabaseAdmin
    .from("products")
    .select("*")
    .eq("id", id)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, ctx: IdCtx) {
  const { id } = await ctx.params;
  const body = await req.json(); // optionally: type as Partial<Product>

  const { data, error } = await supabaseAdmin
    .from("products")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidateTag("products");
  return NextResponse.json(data);
}

export async function DELETE(_req: NextRequest, ctx: IdCtx) {
  const { id } = await ctx.params;

  const { error } = await supabaseAdmin.from("products").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidateTag("products");
  return NextResponse.json({ ok: true });
}
