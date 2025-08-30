import { NextRequest, NextResponse } from "next/server";
import { setAdminCookie } from "@/lib/adminAuth";

export async function POST(req: NextRequest) {
  const { password } = await req.json().catch(() => ({}));
  if (password !== process.env.ADMIN_PASSWORD)
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });

  setAdminCookie();
  return NextResponse.json({ ok: true });
}
