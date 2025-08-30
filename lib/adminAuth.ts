// lib/adminAuth.ts
import { cookies } from "next/headers";
import crypto from "crypto";

const PASSWORD = process.env.ADMIN_PASSWORD ?? process.env.NEXT_PUBLIC_ADMIN_PASSWORD;

function tokenFromPassword(pw: string) {
  return crypto.createHash("sha256").update(pw).digest("hex");
}

// ⬇️ make these async and await cookies()
export async function setAdminCookie() {
  const jar = await cookies();
  jar.set({
    name: "admin_token",
    value: tokenFromPassword(PASSWORD!),
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearAdminCookie() {
  const jar = await cookies();
  jar.delete("admin_token");
}

export async function isAdminAuthed(): Promise<boolean> {
  const jar = await cookies();
  return jar.get("admin_token")?.value === tokenFromPassword(PASSWORD!);
}
