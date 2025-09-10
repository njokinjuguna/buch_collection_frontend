// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { CartProvider } from "../context/CartContext";
import CategoryNav from "@/components/CategoryNav";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://buch-collection-frontend.vercel.app"),
  title: { default: "Buch Collection", template: "%s • Buch Collection" },
  description: "Your site description here",
  openGraph: {
    type: "website",
    url: "/",
    title: "Buch Collection",
    description: "Your site description here",
    images: [{ url: "/og-default.jpg", width: 1200, height: 630, alt: "Buch Collection" }],
  },
  twitter: { card: "summary_large_image", title: "Buch Collection", description: "Your site description here", images: ["/og-default.jpg"] },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <CategoryNav />    {/* <-- this fetch is tagged with next: { tags: ["categories"] } */}
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
