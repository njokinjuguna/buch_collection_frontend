import "./globals.css";
import type { Metadata } from "next";
import { ReactNode } from "react";
import { CartProvider } from "../context/CartContext"; // <-- import your provider

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      "https://buch-collection-frontend.vercel.app"
  ),
  title: "Buch Collection",
  description: "Your site description here",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
