import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";

export async function GET() {
  const authed = await isAdminAuthed();   // ⬅️ await
  return NextResponse.json({ authed });
}

