// app/page.tsx
import { SITE } from "@/lib/site";
import ProductCard from "../components/ProductCard";
import ChatBotFloat from "../components/ChatBotFloat";
import type { Product } from "@/types/product";
import type { Category } from "@/types/category";

export const revalidate = 86400;

async function fetchProducts(): Promise<Product[]> {
  const res = await fetch(`${SITE}/api/products?visibility=published`, {
    next: { tags: ["products"] },
  });
  if (!res.ok) return [];
  return res.json();
}

async function fetchCategories(): Promise<Category[]> {
  try {
    const res = await fetch(`${SITE}/api/categories`, { next: { tags: ["categories"] } });
    if (!res.ok) return [];
    const json = await res.json();
    return Array.isArray(json) ? json : [];
  } catch {
    return [];
  }
}

function formatKsh(n: number) {
  try {
    return new Intl.NumberFormat("en-KE").format(n);
  } catch {
    return String(n);
  }
}

export default async function Page({
  searchParams,
}: {
  searchParams?: { category?: string };
}) {
  const [products, categories] = await Promise.all([fetchProducts(), fetchCategories()]);
  const selectedCategory = (searchParams?.category || "").trim();

  // Hero: pick the first banner product if available
  const hero = products.find((p: any) => (p as any).is_banner) ?? products[0];

  // Rails
  const newArrivals = products.filter((p: any) => (p as any).is_new);
  const onOffer = products.filter((p: any) => (p as any).offer_percent);
  const restockSoon = products.filter((p: any) => (p as any).stock_status === "restock");

  // Featured grid (optionally filtered by category)
  const featured = selectedCategory
    ? products.filter((p) => (p.category || "").toLowerCase() === selectedCategory.toLowerCase())
    : products;

  return (
    <main style={{ maxWidth: 1200, margin: "24px auto 60px", padding: "0 20px" }}>
      {/* HERO */}
      {hero ? (
        <section
          style={{
            position: "relative",
            borderRadius: 16,
            overflow: "hidden",
            marginBottom: 28,
            border: "1px solid #eee",
          }}
        >
          {/* image */}
          <div
            style={{
              width: "100%",
              aspectRatio: "21/9",
              background: `#fafafa url("${hero.image}") center/cover no-repeat`,
            }}
          />
          {/* overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.55))",
            }}
          />
          {/* content */}
          <div
            style={{
              position: "absolute",
              left: 24,
              bottom: 20,
              color: "white",
              textShadow: "0 2px 8px rgba(0,0,0,0.35)",
            }}
          >
            <div style={{ fontSize: 28, fontWeight: 800, lineHeight: 1.1 }}>
              {hero.name}
            </div>
            <div style={{ marginTop: 6, opacity: 0.95 }}>
              {hero.currency} {formatKsh(hero.price)}
              {(hero as any).offer_percent ? (
                <span style={{ marginLeft: 8, padding: "2px 8px", borderRadius: 999, background: "#10b981", color: "white", fontSize: 12 }}>
                  {(hero as any).offer_percent}% OFF
                </span>
              ) : null}
              {(hero as any).stock_status === "restock" ? (
                <span style={{ marginLeft: 8, padding: "2px 8px", borderRadius: 999, background: "#f59e0b", color: "white", fontSize: 12 }}>
                  Restock soon
                </span>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}

      {/* CATEGORY CHIPS */}
      {categories.length > 0 ? (
        <nav
          aria-label="Categories"
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "center",
            marginBottom: 24,
          }}
        >
          <a
            href="/"
            style={{
              padding: "8px 12px",
              borderRadius: 999,
              border: "1px solid #ddd",
              background: selectedCategory ? "#fff" : "#111",
              color: selectedCategory ? "#111" : "#fff",
              textDecoration: "none",
              fontSize: 14,
            }}
          >
            All
          </a>
          {categories.map((c) => {
            const active = selectedCategory.toLowerCase() === c.name.toLowerCase();
            return (
              <a
                key={c.id}
                href={`/?category=${encodeURIComponent(c.name)}`}
                style={{
                  padding: "8px 12px",
                  borderRadius: 999,
                  border: "1px solid #ddd",
                  background: active ? "#111" : "#fff",
                  color: active ? "#fff" : "#111",
                  textDecoration: "none",
                  fontSize: 14,
                }}
              >
                {c.name}
              </a>
            );
          })}
        </nav>
      ) : null}

      {/* FEATURED GRID */}
      <section style={{ marginTop: 8 }}>
        <h2
          style={{
            textAlign: "center",
            fontSize: 28,
            marginBottom: 14,
            fontWeight: 800,
            letterSpacing: 0.2,
          }}
        >
          Featured Products
        </h2>

        {featured.length === 0 ? (
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
            {featured.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </div>
        )}
      </section>

      {/* NEW ARRIVALS */}
      {newArrivals.length > 0 && (
        <section style={{ marginTop: 40 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: 22, fontWeight: 800 }}>New arrivals</h3>
            <span style={{ fontSize: 12, opacity: 0.6 }}>{newArrivals.length} item(s)</span>
          </div>
          <div
            style={{
              display: "grid",
              gap: 20,
              gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
              alignItems: "start",
              marginTop: 10,
            }}
          >
            {newArrivals.slice(0, 8).map((p) => (
              <ProductCard key={`new-${p.slug}`} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* ON OFFER */}
      {onOffer.length > 0 && (
        <section style={{ marginTop: 40 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: 22, fontWeight: 800 }}>On offer</h3>
            <span style={{ fontSize: 12, opacity: 0.6 }}>{onOffer.length} item(s)</span>
          </div>
          <div
            style={{
              display: "grid",
              gap: 20,
              gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
              alignItems: "start",
              marginTop: 10,
            }}
          >
            {onOffer.slice(0, 8).map((p) => (
              <ProductCard key={`offer-${p.slug}`} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* RESTOCK SOON */}
      {restockSoon.length > 0 && (
        <section style={{ marginTop: 40 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
            <h3 style={{ fontSize: 22, fontWeight: 800 }}>Restock soon</h3>
            <span style={{ fontSize: 12, opacity: 0.6 }}>{restockSoon.length} item(s)</span>
          </div>
          <div
            style={{
              display: "grid",
              gap: 20,
              gridTemplateColumns: "repeat(auto-fill,minmax(220px,1fr))",
              alignItems: "start",
              marginTop: 10,
            }}
          >
            {restockSoon.slice(0, 8).map((p) => (
              <ProductCard key={`restock-${p.slug}`} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* Chat / Floating CTA */}
      <ChatBotFloat />
    </main>
  );
}
