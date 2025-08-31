// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { CartProvider } from "../context/CartContext";

export const metadata: Metadata = {
  // This lets relative image URLs (e.g. "/og-default.jpg") resolve to a full URL
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      "https://buch-collection-frontend.vercel.app"
  ),

  title: {
    default: "Buch Collection",
    template: "%s • Buch Collection",
  },
  description: "Your site description here",

  // Default OG for pages that don't set their own metadata (e.g. home page)
  openGraph: {
    type: "website",
    url: "/",
    title: "Buch Collection",
    description: "Your site description here",
    images: [
      {
        url: "/og-default.jpg", // put this file in /public
        width: 1200,
        height: 630,
        alt: "Buch Collection",
      },
    ],
  },

  // Default Twitter card
  twitter: {
    card: "summary_large_image",
    title: "Buch Collection",
    description: "Your site description here",
    images: ["/og-default.jpg"],
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
