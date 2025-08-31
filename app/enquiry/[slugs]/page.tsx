// app/enquiry/[slugs]/page.tsx
import type { Metadata } from "next";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

type Params = { slugs: string };

function siteOrigin() {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (env) return env;
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slugs } = await params;
  const base = siteOrigin();
  const img = `${base}/api/og/enquiry?u=${encodeURIComponent(slugs)}`;

  return {
    title: "Enquiry – Buch Collection",
    description: "Your site description here",
    robots: { index: false },
    openGraph: {
      type: "website",
      url: `${base}/enquiry/${encodeURIComponent(slugs)}`,
      images: [{ url: img, width: 1200, height: 630, alt: "Enquiry – Buch Collection" }],
    },
    twitter: {
      card: "summary_large_image",
      images: [img],
    },
  };
}

export default function Page() {
  // This page is just a placeholder; bots only need the meta tags.
  return (
    <main style={{ padding: 20 }}>
      <h1>Thanks!</h1>
      <p>You can close this tab.</p>
    </main>
  );
}
