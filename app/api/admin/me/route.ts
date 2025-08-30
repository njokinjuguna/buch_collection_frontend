import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";

export function GET() {
  return NextResponse.json({ ok: isAdminAuthed() });
}
