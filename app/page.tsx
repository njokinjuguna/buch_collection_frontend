// app/page.tsx
import { headers } from "next/headers";
import ProductCard from "../components/ProductCard";
import ChatBotFloat from "../components/ChatBotFloat";

export const revalidate = 0; // disable cache while testing

type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  image?: string;
  visibility: "draft" | "published" | "archived";
};

// Build absolute site origin from headers (fallback to env)
function siteOrigin() {
  const h = headers();
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

async function fetchProducts(): Promise<Product[]> {
  const base = siteOrigin();
  const res = await fetch(`${base}/api/products?visibility=published`, {
    cache: "no-store",
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`/api/products failed: ${res.status} ${txt}`);
  }
  return res.json();
}

export default async function Page() {
  const products = await fetchProducts();

  return (
    <main style={{ maxWidth: 1200, margin: "40px auto", padding: "0 20px" }}>
      <h1 style={{ textAlign: "center" }}>Featured Products</h1>

      {products.length === 0 ? (
        <p style={{ textAlign: "center", opacity: 0.7 }}>
          No products yet. Add one in <code>/admin</code> and click Publish.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gap: 20,
            gridTemplateColumns: "repeat(auto-fill,minmax(260px,1fr))",
          }}
        >
          {products.map((p) => (
            <ProductCard key={p.slug} product={p as any} />
          ))}
        </div>
      )}

      <ChatBotFloat />
    </main>
  );
}
