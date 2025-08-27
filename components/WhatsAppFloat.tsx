"use client";
import { useCart } from "../context/CartContext";
import { waHrefForCart } from "../utils/whatsapp";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function WhatsAppFloat() {
  const { items } = useCart();
  const href = waHrefForCart(items, SITE);
  return (
    <a href={href} target="_blank" rel="noopener" aria-label="WhatsApp"
       style={{position:"fixed",right:20,bottom:20,zIndex:1000}}>
      <img src="https://img.icons8.com/color/64/whatsapp--v1.png" width="64" height="64" alt="WhatsApp" />
    </a>
  );
}
