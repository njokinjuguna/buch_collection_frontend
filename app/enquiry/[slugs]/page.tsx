// app/enquiry/[slugs]/page.tsx
import type { Metadata } from "next";
import { SITE } from "@/lib/site";

type Params = { slugs: string };

export async function generateMetadata(
  { params }: { params: Promise<Params> }
): Promise<Metadata> {
  const { slugs } = await params;
  const og = `${SITE}/api/og/enquiry?slugs=${encodeURIComponent(slugs)}`;

  return {
    title: "Enquiry – Buch Collection",
    openGraph: {
      title: "Enquiry – Buch Collection",
      url: `${SITE}/enquiry/${encodeURIComponent(slugs)}`,
      images: [{ url: og, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", images: [og] },
  };
}

export default async function EnquirySharePage({ params }: { params: Promise<Params> }) {
  const { slugs } = await params;
  const list = slugs.split(",").filter(Boolean);

  return (
    <main style={{ maxWidth: 800, margin: "40px auto", padding: "0 20px" }}>
      <h1>Enquiry</h1>
      <p>This page is for sharing your enquiry. The preview image on WhatsApp shows the selected items.</p>
      <ul>
        {list.map(s => (
          <li key={s}><a href={`/p/${s}`}>/p/{s}</a></li>
        ))}
      </ul>
    </main>
  );
}
