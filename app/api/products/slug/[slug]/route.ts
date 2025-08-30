// app/api/products/slug/[slug]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { revalidateTag } from 'next/cache';

export const dynamic = 'force-dynamic';

// GET /api/products/slug/:slug
export async function GET(
  _req: NextRequest,
  ctx: { params: Promise<{ slug: string }> }
) {
  const { slug } = await ctx.params;

  const { data, error } = await supabaseAdmin
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  if (!data) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json(data);
}

// OPTIONAL: allow admin updates by slug
// export async function PATCH(
//   req: NextRequest,
//   ctx: { params: Promise<{ slug: string }> }
// ) {
//   const { slug } = await ctx.params;
//   const body = await req.json(); // type as Partial<Product> if you like
//
//   const { data, error } = await supabaseAdmin
//     .from('products')
//     .update(body)
//     .eq('slug', slug)
//     .select()
//     .single();
//
//   if (error) return NextResponse.json({ error: error.message }, { status: 500 });
//
//   revalidateTag('products');
//   return NextResponse.json(data);
// }
