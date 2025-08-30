"use client";
import { useCart } from "../context/CartContext";
import { waHrefForCart } from "../utils/whatsapp";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://buch-collection-frontend.vercel.app";

export default function WhatsAppFloat() {
  const { items } = useCart();
  const href = waHrefForCart(items, SITE);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener"
      aria-label="WhatsApp"
      style={{ position: "fixed", right: 20, bottom: 20, zIndex: 1000, width: 64, height: 64,
               borderRadius: "50%", background: "#25D366", boxShadow: "0 8px 20px rgba(0,0,0,.2)",
               display: "grid", placeItems: "center" }}
    >
      {/* Inline WhatsApp SVG to avoid <img> warning */}
      <svg
        width="36" height="36" viewBox="0 0 24 24" role="img" aria-label="WhatsApp"
        xmlns="http://www.w3.org/2000/svg" fill="currentColor" style={{ color: "white" }}
      >
        <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .2 5.3.2 11.86c0 2.08.55 4.1 1.6 5.88L0 24l6.42-1.75a11.72 11.72 0 0 0 5.64 1.43h.01c6.55 0 11.86-5.3 11.86-11.86 0-3.17-1.24-6.16-3.41-8.34ZM12.06 21.6h-.01a9.7 9.7 0 0 1-4.95-1.35l-.35-.2-3.8 1.04 1.02-3.7-.23-.38a9.72 9.72 0 0 1-1.5-5.15C2.24 6.46 6.7 2 12.06 2c2.59 0 5.02 1 6.85 2.82a9.63 9.63 0 0 1 2.82 6.84c0 5.36-4.46 9.94-9.67 9.94Zm5.62-7.28c-.3-.15-1.75-.86-2.02-.95-.27-.1-.47-.15-.68.15-.2.29-.77.95-.95 1.14-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.37-1.47-.88-.78-1.47-1.74-1.65-2.04-.17-.29-.02-.45.13-.6.14-.14.3-.35.45-.52.15-.17.2-.29.3-.49.1-.2.05-.37-.02-.52-.07-.15-.68-1.64-.93-2.25-.24-.58-.49-.49-.68-.5l-.58-.01c-.2 0-.52.07-.8.37-.27.29-1.05 1.03-1.05 2.52 0 1.49 1.08 2.94 1.24 3.14.15.2 2.12 3.25 5.13 4.42.72.31 1.28.49 1.72.63.72.23 1.37.2 1.88.12.57-.08 1.75-.72 2-1.42.25-.7.25-1.3.18-1.42-.07-.12-.27-.2-.57-.35Z"/>
      </svg>
    </a>
  );
}
