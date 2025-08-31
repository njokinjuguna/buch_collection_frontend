// utils/whatsapp.ts
import type { CartItem } from "@/context/CartContext";

/** Format prices for WhatsApp text. Tweak to show decimals if you prefer. */
export function currency(amount: number, symbol = "KSh") {
  if (Number.isNaN(amount)) amount = 0;
  return `${symbol} ${amount.toLocaleString("en-KE", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2, // change to 0 if you never want .00
  })}`;
}

/**
 * Build a WhatsApp deep-link with a readable cart message.
 * `SITE` should be your public origin (e.g. https://yourdomain.com).
 * The first line is a share URL which should render a nice OG preview (collage).
 */
export function waHrefForCart(items: CartItem[], SITE: string) {
  // first URL in the message: your enquiry page that sets OG tags to the collage
  const slugs = items.map((i) => i.product.slug).join(",");
  const shareUrl = `${SITE}/enquiry/${encodeURIComponent(slugs)}`;

  const lines: string[] = [];
  lines.push(shareUrl); // WhatsApp will fetch preview from this page
  lines.push("");       // blank line so the preview stands alone

  lines.push("Hello! I'd like to order/enquire:\n");

  let total = 0;
  items.forEach((x, i) => {
    total += x.product.price * x.qty;
    lines.push(
      `${i + 1}. ${x.product.name} ×${x.qty} — ${currency(x.product.price)}`
    );
    lines.push(`   Link: ${SITE}/p/${x.product.slug}`);
  });

  lines.push(`Total (approx): ${currency(total)}`);
  lines.push("Payment: Cash on Delivery");
  lines.push("Customer name: ___");
  lines.push("Location: ___");
  lines.push("Phone: ___");

  const text = encodeURIComponent(lines.join("\n"));
  const phone = process.env.NEXT_PUBLIC_WA_PHONE ?? ""; // keep empty to open plain WhatsApp
  return `https://wa.me/${phone}?text=${text}`;
}
