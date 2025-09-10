// components/CategoryNav.tsx
import Link from "next/link";
import { SITE } from "@/lib/site";

type Category = { id: string; name: string; slug: string; is_active?: boolean; sort?: number };

export default async function CategoryNav() {
  // Tagged fetch so admin changes (POST/PATCH/DELETE) revalidate this output
  const res = await fetch(`${SITE}/api/categories`, { next: { tags: ["categories"] } });
  if (!res.ok) return null;

  const cats = (await res.json()) as Category[];
  if (!cats?.length) return null;

  return (
    <nav
      style={{
        maxWidth: 1200,
        margin: "0 auto",
        padding: "14px 20px",
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
      }}
      aria-label="Product categories"
    >
      {cats
        .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0) || a.name.localeCompare(b.name))
        .map((c) => (
          <Link
            key={c.id}
            href={`/c/${c.slug}`} // change if you’ll use a different route (e.g. "/?category="+c.slug)
            style={{
              padding: "6px 10px",
              borderRadius: 999,
              border: "1px solid #e5e5e5",
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            {c.name}
          </Link>
        ))}
    </nav>
  );
}
