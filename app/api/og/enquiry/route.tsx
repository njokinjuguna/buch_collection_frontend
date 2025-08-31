// app/api/og/enquiry/route.ts
export const runtime = "nodejs"; // use Node here (easier with supabase-admin)
import { ImageResponse } from "next/og";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const u = searchParams.get("u") ?? "";
  const slugs = decodeURIComponent(u).split(",").map(s => s.trim()).filter(Boolean);

  // Pull up to 9 images for a 3x3 grid
  const { data } = await supabaseAdmin
    .from("products")
    .select("slug,image")
    .in("slug", slugs)
    .limit(9);

  const imgs = (data ?? [])
    .map(p => p.image)
    .filter((x): x is string => !!x);

  const W = 1200, H = 630;
  const cols = 3, rows = 3;
  const gap = 12;
  const cellW = Math.floor((W - gap * (cols + 1)) / cols);
  const cellH = Math.floor((H - gap * (rows + 1)) / rows);

  return new ImageResponse(
    (
      <div
        style={{
          width: W, height: H, display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${cellW}px)`,
          gridTemplateRows: `repeat(${rows}, ${cellH}px)`,
          gap, padding: gap, background: "#0f172a", color: "#fff",
          fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto",
        }}
      >
        {/* Title overlay if no images */}
        {imgs.length === 0 ? (
          <div style={{
            gridColumn: "1 / -1", gridRow: "1 / -1", display: "grid",
            placeItems: "center", fontSize: 48, letterSpacing: 1
          }}>
            Buch Collection
          </div>
        ) : null}

        {imgs.map((src, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={i}
            src={src}
            alt=""
            style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8 }}
          />
        ))}
      </div>
    ),
    { width: W, height: H }
  );
}
