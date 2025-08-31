// app/enquiry/[slugs]/page.tsx
import { headers } from "next/headers";
import Image from "next/image";
// ...other imports

type Params = { slugs: string };

// ⬇⬇⬇ make this ASYNC and await headers()
async function siteOrigin() {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (env) return env;

  const h = await headers(); // <- await
  const host =
    h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.includes("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}

export default async function EnquiryPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slugs } = await params;

  // ⬇⬇⬇ await the async origin helper
  const base = await siteOrigin();

  const slugsArr = decodeURIComponent(slugs)
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  const products = await Promise.all(
    slugsArr.map(async (slug) => {
      const r = await fetch(`${base}/api/products/slug/${slug}`, {
        cache: "no-store",
      });
      return r.ok ? r.json() : null;
    })
  ).then(list => list.filter(Boolean));

  return (
    <main style={{ maxWidth: 900, margin: "32px auto", padding: "0 16px" }}>
      <h1>Enquiry</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 16,
        }}
      >
        {products.map((p: any) =>
          p?.image ? (
            <div key={p.slug} style={{ position: "relative", width: "100%", aspectRatio: "4/5" }}>
              <Image
                src={p.image}
                alt={p.name}
                fill
                sizes="(max-width: 900px) 100vw, 300px"
                style={{ objectFit: "cover", borderRadius: 12 }}
                unoptimized
              />
            </div>
          ) : null
        )}
      </div>
    </main>
  );
}
