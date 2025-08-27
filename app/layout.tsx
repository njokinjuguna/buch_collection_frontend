import "./globals.css";
import { CartProvider } from "../context/CartContext";

export const metadata = {
  title: "BUCH Collection",
  description: "Shoes & Appliances. Cash on Delivery.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <CartProvider>{children}</CartProvider>
      </body>
    </html>
  );
}
