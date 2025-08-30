// app/p/[slug]/page.tsx
import Image from "next/image";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Params = { slug: string };
type Product = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  price?: number | null;
  currency?: string | null;
  image?: string | null;
};

// Build absolute origin for server fetches (dev + Vercel)
function siteOrigin() {
  const h = headers();
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

async function fetchProduct(slug: string): Promise<Product | null> {
  const base = siteOrigin();
  const res = await fetch(`${base}/api/products/slug/${encodeURIComponent(slug)}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  return res.json();
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  // Next 15: await the params Promise
  const { slug } = await params;

  const p = await fetchProduct(slug);
  if (!p) return notFound();

  const price = Number(p.price ?? 0);

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 20px" }}>
      <h1>
        {p.name} – KSh {price.toLocaleString()}
      </h1>

      {p.image ? (
        <div
          style={{
            position: "relative",      // required when using <Image fill />
            width: "100%",
            maxWidth: 900,
            aspectRatio: "4 / 5",      // consistent product ratio; tweak as needed
            borderRadius: 12,
            overflow: "hidden",
            margin: "0 auto",
          }}
        >
          <Image
            src={p.image}
            alt={p.name}
            fill
            sizes="(max-width: 900px) 100vw, 900px"
            style={{ objectFit: "cover" }}
            priority
          />
        </div>
      ) : null}

      <p style={{ marginTop: 16 }}>
        Payment: <strong>Cash on Delivery</strong>
      </p>
    </main>
  );
}
