// app/api/social/publish/route.ts
import { NextRequest, NextResponse } from "next/server";
import { postToFacebookPage, postToInstagram } from "@/lib/social";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  // Optional kill-switch
  if (process.env.SOCIAL_PUBLISH_ENABLED !== "true") {
    return NextResponse.json({ ok: false, reason: "disabled" }, { status: 200 });
  }

  // TODO: protect this route with your admin-session check if you have one
  // e.g., read cookies() and validate

  const body = await req.json().catch(() => ({}));
  const { product, platforms = ["facebook", "instagram"] } = body as {
    product?: {
      name: string;
      price?: number;
      currency?: string;
      image?: string;
      slug?: string;
      stock_status?: "in_stock" | "out_of_stock" | "restock" | null;
      is_new?: boolean;
      offer_percent?: 10 | 30 | 50 | null;
      category?: string;
    };
    platforms?: Array<"facebook" | "instagram">;
  };

  if (!product || !product.image) {
    return NextResponse.json({ ok: false, reason: "missing product/image" }, { status: 400 });
  }

  // Compose a nice caption (tweak freely)
  const pieces = [
    product.name,
    product.price && product.currency ? `— ${product.currency} ${product.price.toLocaleString()}` : "",
    product.offer_percent ? `(${product.offer_percent}% off)` : "",
    product.is_new ? "NEW arrival ✨" : "",
    product.stock_status === "restock" ? "Restocking soon" : "",
    product.category ? `#${product.category.replace(/\s+/g, "")}` : "",
    product.slug ? `https://buch-collection-frontend.vercel.app/p/${product.slug}` : "",
  ].filter(Boolean);

  const caption = pieces.join("  ·  ");

  const results: Record<string, unknown> = {};

  if (platforms.includes("facebook")) {
    results.facebook = await postToFacebookPage({ imageUrl: product.image!, caption });
  }
  if (platforms.includes("instagram")) {
    results.instagram = await postToInstagram({ imageUrl: product.image!, caption });
  }

  return NextResponse.json({ ok: true, results }, { status: 200 });
}
