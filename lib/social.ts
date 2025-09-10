// lib/social.ts
const FB_VER = "v19.0"; // or the Graph API version you prefer

type SocialInput = {
  imageUrl: string;
  caption: string;
};

export async function postToFacebookPage({ imageUrl, caption }: SocialInput) {
  const PAGE_ID = process.env.FB_PAGE_ID!;
  const TOKEN = process.env.FB_PAGE_ACCESS_TOKEN!;
  if (!PAGE_ID || !TOKEN) return { ok: false, reason: "Missing FB config" };

  const url = `https://graph.facebook.com/${FB_VER}/${PAGE_ID}/photos`;
  const params = new URLSearchParams({
    url: imageUrl,
    caption,
    access_token: TOKEN,
  });

  const res = await fetch(url, { method: "POST", body: params });
  const json = await res.json();
  return { ok: res.ok, res: json };
}

export async function postToInstagram({ imageUrl, caption }: SocialInput) {
  const IG_ID = process.env.IG_USER_ID!;
  const TOKEN = process.env.IG_ACCESS_TOKEN || process.env.FB_PAGE_ACCESS_TOKEN!;
  if (!IG_ID || !TOKEN) return { ok: false, reason: "Missing IG config" };

  // 1) Create media container
  const createUrl = `https://graph.facebook.com/${FB_VER}/${IG_ID}/media`;
  const createParams = new URLSearchParams({
    image_url: imageUrl,
    caption,
    access_token: TOKEN,
  });
  const createRes = await fetch(createUrl, { method: "POST", body: createParams });
  const createJson = await createRes.json();
  if (!createRes.ok) return { ok: false, step: "create", res: createJson };

  // 2) Publish it
  const publishUrl = `https://graph.facebook.com/${FB_VER}/${IG_ID}/media_publish`;
  const publishParams = new URLSearchParams({
    creation_id: createJson.id,
    access_token: TOKEN,
  });
  const publishRes = await fetch(publishUrl, { method: "POST", body: publishParams });
  const publishJson = await publishRes.json();
  return { ok: publishRes.ok, res: publishJson };
}
