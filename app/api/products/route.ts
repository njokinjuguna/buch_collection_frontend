// app/api/products/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidateTag } from "next/cache";
import { isAdminAuthed } from "@/lib/adminAuth";
import type { Product } from "@/types/product";

// GET /api/products?visibility=published
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const visibility = searchParams.get("visibility");

  let q = supabaseAdmin
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  if (visibility) q = q.eq("visibility", visibility);

  const { data, error } = await q;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

type UpsertBody = Partial<Omit<Product, "id" | "created_at" | "updated_at">>;

// POST /api/products  (admin only)
export async function POST(req: NextRequest) {
  if (!(await isAdminAuthed())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await req.json()) as UpsertBody;

  const row: UpsertBody = {
    slug: body.slug!,
    name: body.name!,
    description: body.description ?? "",
    price: body.price ?? 0,
    currency: body.currency ?? "KES",
    image: body.image ?? null,
    gallery: body.gallery ?? [],
    in_stock: body.in_stock ?? true,
    visibility: body.visibility ?? "draft",
  };

  const { data, error } = await supabaseAdmin
    .from("products")
    .insert(row)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  try {
    revalidateTag("products");
  } catch {}

  return NextResponse.json(data, { status: 201 });
}