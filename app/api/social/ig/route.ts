// app/api/social/ig/route.ts
import { NextRequest, NextResponse } from "next/server";

const IG_USER_ID = process.env.IG_USER_ID;
const IG_ACCESS_TOKEN = process.env.IG_ACCESS_TOKEN;
const SOCIAL_ON = process.env.SOCIAL_PUBLISH_ENABLED === "true";

export async function POST(req: NextRequest) {
  try {
    if (!SOCIAL_ON) {
      return NextResponse.json({ error: "Social publishing disabled" }, { status: 501 });
    }
    if (!IG_USER_ID || !IG_ACCESS_TOKEN) {
      return NextResponse.json({ error: "Missing IG env vars" }, { status: 500 });
    }

    // simple admin check (uses your existing /api/admin/me cookie session)
    const me = await fetch(new URL("/api/admin/me", req.nextUrl), {
      headers: { cookie: req.headers.get("cookie") ?? "" },
      cache: "no-store",
    }).then(r => r.json()).catch(() => ({}));
    if (!me?.ok) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { image, caption } = await req.json();

    if (!image) return NextResponse.json({ error: "image is required" }, { status: 400 });

    // 1) Create a media container
    const createParams = new URLSearchParams({
      image_url: image,
      caption: caption ?? "",
      access_token: IG_ACCESS_TOKEN,
    });

    const createRes = await fetch(
      `https://graph.facebook.com/v23.0/${IG_USER_ID}/media`,
      { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: createParams }
    );
    const createJson = await createRes.json();

    if (!createRes.ok) {
      return NextResponse.json({ error: "IG media create failed", detail: createJson }, { status: 500 });
    }

    const creation_id = createJson.id;
    if (!creation_id) {
      return NextResponse.json({ error: "No creation_id from IG", detail: createJson }, { status: 500 });
    }

    // 2) Publish the container
    const pubParams = new URLSearchParams({
      creation_id,
      access_token: IG_ACCESS_TOKEN,
    });

    const pubRes = await fetch(
      `https://graph.facebook.com/v23.0/${IG_USER_ID}/media_publish`,
      { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded" }, body: pubParams }
    );
    const pubJson = await pubRes.json();

    if (!pubRes.ok) {
      return NextResponse.json({ error: "IG publish failed", detail: pubJson }, { status: 500 });
    }

    return NextResponse.json({ ok: true, creation_id, result: pubJson });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
