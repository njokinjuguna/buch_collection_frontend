// utils/whatsapp.ts
import type { CartItem } from "@/context/CartContext";

// Simple formatter used by the WhatsApp widget and elsewhere
export function currency(n: number, code = "KSh") {
  return `${code} ${Number(n || 0).toLocaleString()}`;
}

export function waHrefForCart(items: CartItem[], SITE: string) {
  const slugs = items.map(i => i.product.slug).join(",");
  const shareUrl = `${SITE}/enquiry/${encodeURIComponent(slugs)}?v=${Date.now().toString(36)}`;

  const lines: string[] = [];
  lines.push(shareUrl);     // <- FIRST line so WhatsApp previews this URL
  lines.push("");
  lines.push("Hello! I'd like to order/enquire:\n");

  let total = 0;
  items.forEach((x, i) => {
    total += x.product.price * x.qty;
    lines.push(`${i + 1}. ${x.product.name} ×${x.qty} — ${currency(x.product.price)}`);
    lines.push(`   Link: ${SITE}/p/${x.product.slug}`);
  });

  lines.push(`Total (approx): ${currency(total)}`);
  lines.push("Payment: Cash on Delivery");
  lines.push("Customer name: ___");
  lines.push("Location: ___");
  lines.push("Phone: ___");

  const text = encodeURIComponent(lines.join("\n"));
  const phone = process.env.NEXT_PUBLIC_WA_PHONE ?? "";
  return `https://wa.me/${phone}?text=${text}`;
}
