import crypto from "crypto";
import { NextResponse } from "next/server";
import { isAdminAuthed } from "@/lib/adminAuth";

export async function POST() {
  if (!(await isAdminAuthed())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cloudName = process.env.CLOUDINARY_CLOUD_NAME!;
  const apiKey     = process.env.CLOUDINARY_API_KEY!;
  const apiSecret  = process.env.CLOUDINARY_API_SECRET!;
  const upload_preset = process.env.CLOUDINARY_UPLOAD_PRESET || "buch_unsigned"; // create this preset

  const timestamp = Math.floor(Date.now() / 1000);
  // we sign only timestamp + preset (simple & safe)
  const toSign = `timestamp=${timestamp}&upload_preset=${upload_preset}`;
  const signature = crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");

  return NextResponse.json({ cloudName, apiKey, timestamp, signature, upload_preset });
}
