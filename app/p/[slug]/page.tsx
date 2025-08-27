import { products } from "../../../data/products";
import type { Metadata } from "next";

type Params = { slug: string };

export function generateStaticParams() {
  return products.map(p => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: Params }): Metadata {
  const p = products.find(x => x.slug === params.slug)!;
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const url = `${site}/p/${p.slug}`;
  return {
    title: `${p.name} – KSh ${p.price.toLocaleString()} | BUCH`,
    openGraph: {
      title: `${p.name} – KSh ${p.price.toLocaleString()}`,
      description: "Payment: Cash on Delivery.",
      images: [{ url: p.image }],
      url,
      type: "product",
    },
    twitter: {
      card: "summary_large_image",
      title: `${p.name} – KSh ${p.price.toLocaleString()}`,
      description: "Payment: Cash on Delivery.",
      images: [p.image],
    },
  };
}

export default function ProductPage({ params }: { params: Params }) {
  const p = products.find(x => x.slug === params.slug)!;
  return (
    <main style={{maxWidth:900, margin:"40px auto", padding:"0 20px"}}>
      <h1>{p.name} – KSh {p.price.toLocaleString()}</h1>
      <img src={p.image} alt={p.name} style={{maxWidth:"100%", borderRadius:12}} />
      <p>Payment: <strong>Cash on Delivery</strong></p>
    </main>
  );
}
