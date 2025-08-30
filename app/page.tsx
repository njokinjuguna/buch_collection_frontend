// app/page.tsx
import { SITE } from "@/lib/site";
import ProductCard from "../components/ProductCard";
import ChatBotFloat from "../components/ChatBotFloat";
import type { Product } from "@/types/product";

export const revalidate = 86400;

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${SITE}/api/products?visibility=published`, {
    next: { tags: ["products"] },
  });
  if (!res.ok) return [];
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
            alignItems: "start",
          }}
        >
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}

      <ChatBotFloat />
    </main>
  );
}
