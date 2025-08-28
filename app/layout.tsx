import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://buch-collection-frontend.vercel.app"
  ),
  title: "Buch Collection",
  description: "Your site description here",
};
