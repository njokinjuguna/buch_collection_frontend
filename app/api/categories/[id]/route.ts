// app/api/categories/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { revalidateTag } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export const dynamic = "force-dynamic";

type IdCtx = { params: Promise<{ id: string }> };

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

export async function GET(_req: NextRequest, ctx: IdCtx) {
  const { id } = await ctx.params;
  const { data, error } = await supabaseAdmin
    .from("categories")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PATCH(req: NextRequest, ctx: IdCtx) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => ({} as any));

  // fetch current category to compare name for cascade
  const { data: current, error: curErr } = await supabaseAdmin
    .from("categories")
    .select("id,name,slug,sort,is_active")
    .eq("id", id)
    .single();
  if (curErr || !current) {
    return NextResponse.json({ error: curErr?.message || "Not found" }, { status: 404 });
  }

  // Build a sanitized patch
  const next: Record<string, any> = {};
  if (typeof body.name === "string" && body.name.trim()) {
    next.name = body.name.trim();
    // if name provided but slug not provided, generate one
    if (!body.slug) {
      next.slug = slugify(next.name);
    }
  }
  if (typeof body.slug === "string" && body.slug.trim()) {
    next.slug = body.slug.trim();
  }
  if (typeof body.sort === "number") next.sort = body.sort;
  if (typeof body.is_active === "boolean") next.is_active = body.is_active;

  // If no allowed fields present, return current
  if (Object.keys(next).length === 0) return NextResponse.json(current);

  // If renaming, cascade products.category from old -> new
  const isRenaming = next.name && next.name !== current.name;

  // 1) update category
  const { data: updated, error: upErr } = await supabaseAdmin
    .from("categories")
    .update(next)
    .eq("id", id)
    .select()
    .single();

  if (upErr) return NextResponse.json({ error: upErr.message }, { status: 500 });

  // 2) cascade rename to products if needed
  if (isRenaming) {
    const { error: prodErr } = await supabaseAdmin
      .from("products")
      .update({ category: updated.name })
      .eq("category", current.name);

    if (prodErr) {
      // best effort rollback? We’ll surface the error but still return 500.
      return NextResponse.json(
        { error: `Category renamed, but updating products failed: ${prodErr.message}` },
        { status: 500 }
      );
    }
    // revalidate products if any could have changed
    revalidateTag("products");
  }

  revalidateTag("categories");
  return NextResponse.json(updated);
}

export async function DELETE(_req: NextRequest, ctx: IdCtx) {
  const { id } = await ctx.params;

  // Load the category first to know its name
  const { data: cat, error: ce } = await supabaseAdmin
    .from("categories")
    .select("id,name")
    .eq("id", id)
    .single();
  if (ce || !cat) {
    return NextResponse.json({ error: ce?.message || "Not found" }, { status: 404 });
  }

  // Check if any products use this category (by name)
  const { count, error: pcErr } = await supabaseAdmin
    .from("products")
    .select("*", { head: true, count: "exact" })
    .eq("category", cat.name);

  if (pcErr) return NextResponse.json({ error: pcErr.message }, { status: 500 });

  if ((count ?? 0) > 0) {
    return NextResponse.json(
      { error: `Category is in use by ${count} product(s). Reassign or delete those products first.` },
      { status: 409 }
    );
  }

  // Safe to hard-delete
  const { error } = await supabaseAdmin.from("categories").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  revalidateTag("categories");
  return NextResponse.json({ ok: true });
}
