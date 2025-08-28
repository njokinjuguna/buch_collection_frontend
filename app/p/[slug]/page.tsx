import { products } from "../../../data/products";
import type { Metadata } from "next";

type Params = { slug: string };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const p = products.find((x) => x.slug === params.slug)!;

  const site =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://buch-collection-frontend.vercel.app"; // fallback to your prod URL

  const pageUrl = `${site}/p/${p.slug}`;

  // ensure absolute image URL (WA requires absolute)
  const img =
    p.image.startsWith("http") ? p.image : `${site}${p.image.startsWith("/") ? "" : "/"}${p.image}`;

  const title = `${p.name} – KSh ${p.price.toLocaleString()} | BUCH`;
  const desc = "Payment: Cash on Delivery.";

  return {
    title,
    description: desc,
    openGraph: {
      // ❌ "product" not in the union; use "website" or omit
      type: "website",
      url: pageUrl,
      title,
      description: desc,
      images: [{ url: img }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      images: [img],
    },
  };
}

export default function ProductPage({ params }: { params: Params }) {
  const p = products.find((x) => x.slug === params.slug)!;
  return (
    <main style={{ maxWidth: 900, margin: "40px auto", padding: "0 20px" }}>
      <h1>
        {p.name} – KSh {p.price.toLocaleString()}
      </h1>
      <img src={p.image} alt={p.name} style={{ maxWidth: "100%", borderRadius: 12 }} />
      <p>
        Payment: <strong>Cash on Delivery</strong>
      </p>
    </main>
  );
}
