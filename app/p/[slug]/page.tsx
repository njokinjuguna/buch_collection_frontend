import { headers } from "next/headers";
import { notFound } from "next/navigation";

type Params = { slug: string };

// build absolute origin (works locally & on Vercel)
function siteOrigin() {
  const h = headers();
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

async function fetchProduct(slug: string) {
  const base = siteOrigin();
  const res = await fetch(`${base}/api/products/slug/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  return res.json();
}

export default async function ProductPage({ params }: { params: Promise<Params> }) {
  // ⬅️ Next 15: await params before using it
  const { slug } = await params;

  const p = await fetchProduct(slug);
  if (!p) return notFound();

  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 20px" }}>
      <h1>
        {p.name} – KSh {Number(p.price ?? 0).toLocaleString()}
      </h1>
      {p.image && (
        <img src={p.image} alt={p.name} style={{ maxWidth: "100%", borderRadius: 12 }} />
      )}
      <p>
        Payment: <strong>Cash on Delivery</strong>
      </p>
    </main>
  );
}
