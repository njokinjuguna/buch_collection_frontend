import { NextResponse } from "next/server";
import { setAdminCookie } from "@/lib/adminAuth";

export async function POST() {
  await setAdminCookie();                  // ⬅️ await
  return NextResponse.json({ ok: true });
}
