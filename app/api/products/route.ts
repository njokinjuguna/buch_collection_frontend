import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { revalidateTag } from "next/cache";
import { isAdminAuthed } from "@/lib/adminAuth";

export const dynamic = "force-dynamic"; // avoid caching during dev

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const visibility = searchParams.get("visibility"); // e.g. 'published'

    let q = supabaseAdmin.from("products").select("*").order("created_at", { ascending: false });
    if (visibility) q = q.eq("visibility", visibility);

    const { data, error } = await q;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data ?? []);
  } catch (e: any) {
    return NextResponse.json({ error: String(e?.message ?? e) }, { status: 500 });
  }
}
export async function POST(req: NextRequest) {
  if (!isAdminAuthed()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const row = {
    slug: body.slug,
    name: body.name,
    description: body.description ?? "",
    price: body.price ?? 0,
    currency: body.currency ?? "KES",
    image: body.image ?? null,
    gallery: body.gallery ?? [],
    in_stock: body.in_stock ?? true,
    visibility: body.visibility ?? "draft",
  };

  const { data, error } = await supabaseAdmin.from("products").insert(row).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  try { revalidateTag("products"); } catch {}
  return NextResponse.json(data, { status: 201 });
}
