// app/enquiry/[slugs]/page.tsx
import { headers } from "next/headers";
import Image from "next/image";

type Params = { slugs: string };

// Minimal shape for the collage
type EnquiryProduct = {
  slug: string;
  name: string;
  image?: string | null;
};

// Build absolute origin (local & Vercel)
async function siteOrigin() {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (env) return env;

  const h = await headers(); // Next 15: await headers()
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

async function fetchOne(
  base: string,
  slug: string
): Promise<EnquiryProduct | null> {
  const res = await fetch(`${base}/api/products/slug/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  const j = (await res.json()) as EnquiryProduct;
  return j;
}

export default async function EnquiryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slugs } = await params;

  const base = await siteOrigin();

  const slugsArr = decodeURIComponent(slugs)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const fetched = await Promise.all(slugsArr.map((s) => fetchOne(base, s)));

  // ✅ Properly narrow away nulls (no `any`)
  const products: EnquiryProduct[] = fetched.filter(
    (p): p is EnquiryProduct => p !== null
  );

  return (
    <main style={{ maxWidth: 900, margin: "32px auto", padding: "0 16px" }}>
      <h1>Enquiry</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {products.map((p) =>
          p.image ? (
            <div
              key={p.slug}
              style={{ position: "relative", width: "100%", aspectRatio: "4 / 5" }}
            >
              <Image
                src={p.image}
                alt={p.name}
                fill
                sizes="(max-width: 900px) 100vw, 300px"
                style={{ objectFit: "cover", borderRadius: 12 }}
                unoptimized
              />
            </div>
          ) : null
        )}
      </div>
    </main>
  );
}
