import type { CartItem } from "../context/CartContext";
import type { Product } from "../data/products";


const PHONE = process.env.NEXT_PUBLIC_WA_PHONE || "393717670312"; // <— now from env
const SITE  = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function currency(amount: number) {
  return new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES" }).format(amount);
}

// single product
export function waHrefForProduct(p: Product, siteUrl: string) {
  const url = `${siteUrl}/p/${p.slug}`;
  const msg =
    `Hello! I'm interested in:\n` +
    `*${p.name}* — ${currency(p.price)}\n` +
    `Link: ${url}\n` +
    `Options: Size ___, Color ___\n` +
    `Payment: Cash on Delivery`;
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
}

// multiple items (enquiry cart)
export function waHrefForCart(items: CartItem[], siteUrl: string) {
  if (!items.length) {
    return `https://wa.me/${PHONE}?text=${encodeURIComponent("Hello! I'd like to make an enquiry.")}`;
  }
  const lines = items.map(
    (x, i) =>
      `${i + 1}. ${x.product.name} ×${x.qty} — ${currency(x.product.price)}\n` +
      `   Link: ${siteUrl}/p/${x.product.slug}`
  );
  const total = items.reduce((s, x) => s + x.product.price * x.qty, 0);
  const footer =
    `\nTotal (approx): ${currency(total)}\n` +
    `Payment: Cash on Delivery\n` +
    `Customer name: ___\nLocation: ___\nPhone: ___`;
  const msg = `Hello! I'd like to order/enquire:\n\n${lines.join("\n")}${footer}`;
  return `https://wa.me/${PHONE}?text=${encodeURIComponent(msg)}`;
}
