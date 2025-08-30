import crypto from "crypto";
import { cookies } from "next/headers";

const PASSWORD = process.env.ADMIN_PASSWORD;
if (!PASSWORD) throw new Error("Missing env: ADMIN_PASSWORD");

function tokenFromPassword(pw: string) {
  return crypto.createHmac("sha256", pw).update("admin").digest("hex");
}

export function setAdminCookie() {
  const token = tokenFromPassword(PASSWORD!);
  cookies().set({
    name: "admin_token",
    value: token,
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 8,
  });
}
export function clearAdminCookie() {
  cookies().delete("admin_token");
}
export function isAdminAuthed(): boolean {
  return cookies().get("admin_token")?.value === tokenFromPassword(PASSWORD!);
}

