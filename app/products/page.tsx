// app/products/page.tsx
import { SITE } from "@/lib/site";
import ProductCard from "@/components/ProductCard";
import type { Product } from "@/types/product";

export const revalidate = 86400; // daily fallback; instant via revalidateTag('products')

async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${SITE}/api/products`, {
    next: { tags: ["products"] },
  });
  if (!res.ok) return [];
  return res.json();
}

export default async function ProductsPage() {
  const products = await getProducts();

  return (
    <main style={{ maxWidth: 1200, margin: "40px auto", padding: "0 20px" }}>
      <h1 style={{ textAlign: "center" }}>All Products</h1>

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
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}
