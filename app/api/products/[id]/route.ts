// app/api/products/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

// keep your ctx typing style
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
  const body = await req.json();

  // --- normalize & guard ----------------------------------------------------
  const allowedStock = new Set(["in_stock", "out_of_stock", "restock"] as const);

  let stock_status: "in_stock" | "out_of_stock" | "restock" | null | undefined =
    body.stock_status ?? undefined;
  let in_stock: boolean | undefined = body.in_stock;


  // If only in_stock provided -> derive stock_status
  if (stock_status === undefined && typeof in_stock === "boolean") {
    stock_status = in_stock ? "in_stock" : "out_of_stock";
  }

  // If only stock_status provided -> derive in_stock
  if (
    in_stock === undefined &&
    typeof stock_status === "string" &&
    allowedStock.has(stock_status)
  ) {
    in_stock = stock_status === "in_stock";
  }
  

  // Build patch with only fields we allow to change
  const patch: Record<string, any> = {
    ...(body.name !== undefined && { name: body.name }),
    ...(body.price !== undefined && { price: body.price }),
    ...(body.currency !== undefined && { currency: body.currency }),
    ...(body.image !== undefined && { image: body.image }),
    ...(body.visibility !== undefined && { visibility: body.visibility }),
    ...(body.category !== undefined && { category: body.category }),
    ...(in_stock !== undefined && { in_stock }),
    ...(body.is_banner !== undefined && { is_banner: !!body.is_banner }),
    ...(body.is_new !== undefined && { is_new: !!body.is_new }),
    ...(body.offer_percent !== undefined && {
      offer_percent: [10, 30, 50].includes(Number(body.offer_percent))
        ? Number(body.offer_percent)
        : null,
    }),
    // allow slug updates if you need it
    ...(body.slug !== undefined && { slug: body.slug ?? null }),
  };


if ("stock_status" in body) {
  const v = body.stock_status;
  patch.stock_status = v === "" || v === null ? null : (allowedStock.has(v) ? v : null);

  // (optional) keep legacy boolean roughly in sync when a concrete state is chosen
  if (patch.stock_status === "in_stock") patch.in_stock = true;
  else if (patch.stock_status === "out_of_stock") patch.in_stock = false;
  // if null, don't touch in_stock
}



  // If this product is being set as banner, unset others first (optional)
  if (patch.is_banner === true) {
    await supabaseAdmin
      .from("products")
      .update({ is_banner: false })
      .eq("is_banner", true)
      .neq("id", id);
  }

  const { data, error } = await supabaseAdmin
    .from("products")
    .update(patch)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

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
