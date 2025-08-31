// app/api/og/enquiry/route.tsx
import { ImageResponse } from "next/og";

export const runtime = "edge";

const W = 1200;
const H = 630;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);

  // up to 4 images in ?i=<url>&i=<url>...
  const imgs = searchParams.getAll("i").slice(0, 4);

  // grid based on count
  const gridStyle: React.CSSProperties =
    imgs.length <= 1
      ? { display: "grid", gridTemplateColumns: "1fr", gridTemplateRows: "1fr", gap: 16, width: "100%", height: "100%", padding: 24 }
      : imgs.length === 2
      ? { display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr", gap: 16, width: "100%", height: "100%", padding: 24 }
      : { display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 16, width: "100%", height: "100%", padding: 24 };

  return new ImageResponse(
    (
      <div
        style={{
          width: W,
          height: H,
          background: "#0b0b0b",
          color: "#fff",
          fontFamily: "Inter, Arial, sans-serif",
          display: "grid",
          placeItems: "center",
        }}
      >
        <div style={gridStyle}>
          {imgs.length === 0 ? (
            <div
              style={{
                gridColumn: "1 / -1",
                gridRow: "1 / -1",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontSize: 48,
                letterSpacing: 1,
              }}
            >
              Buch Collection
            </div>
          ) : null}

          {imgs.map((src, i) => (
            <img
              key={i}
              src={src}
              style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 12 }}
            />
          ))}
        </div>
      </div>
    ),
    { width: W, height: H }
  );
}
