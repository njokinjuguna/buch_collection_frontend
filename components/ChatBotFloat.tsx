"use client";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "../context/CartContext";
import { waHrefForCart, currency } from "../utils/whatsapp";
import Image from "next/image";

export default function ChatBotFloat() {
  const { items, setQty, remove, total } = useCart();
  const [open, setOpen] = useState(false);

// Site URL for building product links inside WhatsApp message
  const SITE =
    process.env.NEXT_PUBLIC_SITE_URL || "https://buch-collection-frontend.vercel.app";

    // Single brand color for the whole widget
  const WA_COLOR = "#128C7E"; 
  const count = useMemo(() => items.reduce((s, x) => s + x.qty, 0), [items]);
  const href = useMemo(() => waHrefForCart(items, SITE), [items, SITE]);


  // auto-pop open briefly when an item is added
  useEffect(() => {
    const onAdded = () => {
      setOpen(true);
      // small pulse then keep open; or auto-close after a while:
      // const t = setTimeout(() => setOpen(false), 2500);
      // return () => clearTimeout(t);
    };
    window.addEventListener("cart:added", onAdded);
    return () => window.removeEventListener("cart:added", onAdded);
  }, []);

  return (
    <>
      {/* FAB */}
<button
  aria-label="WhatsApp Enquiry"
  onClick={() => setOpen(o => !o)}
  style={{
    position:"fixed", right:20, bottom:20, width:64, height:64, borderRadius:"50%",
    border:"none", background:"#25D366", boxShadow:"0 8px 20px rgba(0,0,0,.2)",
    cursor:"pointer", zIndex:1000, display:"grid", placeItems:"center"
  }}
>
  {/* Inline WhatsApp SVG */}
  <svg
    width="32" height="32" viewBox="0 0 24 24" role="img" aria-label="WhatsApp"
    xmlns="http://www.w3.org/2000/svg" fill="currentColor"
    style={{ color: "white" }}
  >
    <path d="M20.52 3.48A11.86 11.86 0 0 0 12.06 0C5.5 0 .2 5.3.2 11.86c0 2.08.55 4.1 1.6 5.88L0 24l6.42-1.75a11.72 11.72 0 0 0 5.64 1.43h.01c6.55 0 11.86-5.3 11.86-11.86 0-3.17-1.24-6.16-3.41-8.34ZM12.06 21.6h-.01a9.7 9.7 0 0 1-4.95-1.35l-.35-.2-3.8 1.04 1.02-3.7-.23-.38a9.72 9.72 0 0 1-1.5-5.15C2.24 6.46 6.7 2 12.06 2c2.59 0 5.02 1 6.85 2.82a9.63 9.63 0 0 1 2.82 6.84c0 5.36-4.46 9.94-9.67 9.94Zm5.62-7.28c-.3-.15-1.75-.86-2.02-.95-.27-.1-.47-.15-.68.15-.2.29-.77.95-.95 1.14-.17.2-.35.22-.65.07-.3-.15-1.25-.46-2.37-1.47-.88-.78-1.47-1.74-1.65-2.04-.17-.29-.02-.45.13-.6.14-.14.3-.35.45-.52.15-.17.2-.29.3-.49.1-.2.05-.37-.02-.52-.07-.15-.68-1.64-.93-2.25-.24-.58-.49-.49-.68-.5l-.58-.01c-.2 0-.52.07-.8.37-.27.29-1.05 1.03-1.05 2.52 0 1.49 1.08 2.94 1.24 3.14.15.2 2.12 3.25 5.13 4.42.72.31 1.28.49 1.72.63.72.23 1.37.2 1.88.12.57-.08 1.75-.72 2-1.42.25-.7.25-1.3.18-1.42-.07-.12-.27-.2-.57-.35Z"/>
  </svg>

  {count > 0 && (
    <span style={{
      position:"absolute", top:-2, right:-2, background:"#e11d48", color:"#fff",
      borderRadius:999, fontSize:12, padding:"2px 6px", lineHeight:1,
      boxShadow:"0 2px 8px rgba(0,0,0,.2)"
    }}>{count}</span>
  )}
</button>


      {/* Panel */}
      {open && (
        <div style={{
          position:"fixed", right:20, bottom:96, width:320, maxHeight:"60vh",
          background:"#fff", borderRadius:12, boxShadow:"0 16px 40px rgba(0,0,0,.25)", zIndex:1000,
          display:"flex", flexDirection:"column", overflow:"hidden"
        }}>
          <div style={{padding:"12px 14px", background:WA_COLOR, color:"#fff", display:"flex", justifyContent:"space-between", alignItems:"center"}}>
            <strong>Enquiry ({count})</strong>
            <span>Total: {currency(total)}</span>
          </div>

          <div style={{padding:12, overflowY:"auto"}}>
            {items.length === 0 ? (
              <p style={{color:"#555"}}>No items yet. Click <em>Add to Enquiry</em> on products.</p>
            ) : items.map(x => (
              <div key={x.product.slug} style={{display:"grid", gridTemplateColumns:"56px 1fr auto", gap:10, alignItems:"center", marginBottom:10}}>
                <div style={{ position: "relative", width: 56, height: 56, borderRadius: 8, overflow: "hidden" }}>
                    {x.product.image ? (
                      <Image
                        src={x.product.image}
                        alt={x.product.name}
                        fill
                        sizes="56px"
                        style={{ objectFit: "cover" }}
                        // Cloudinary already optimizes => avoid double work:
                        unoptimized
                      />
                    ) : null}
                  </div>

                <div>
                  <div style={{fontWeight:600}}>{x.product.name}</div>
                  <div style={{fontSize:12, color:"#555"}}>{currency(x.product.price)}</div>
                </div>
                <div style={{display:"flex", alignItems:"center", gap:6}}>
                  <button onClick={() => setQty(x.product.slug, x.qty - 1)} style={btnMini}>−</button>
                  <span>{x.qty}</span>
                  <button onClick={() => setQty(x.product.slug, x.qty + 1)} style={btnMini}>+</button>
                  <button onClick={() => remove(x.product.slug)} title="Remove" style={{...btnMini, background:"#eee", color:"#333"}}>×</button>
                </div>
              </div>
            ))}
          </div>

          <div style={{padding:12, borderTop:"1px solid #eee"}}>
            <a href={href} target="_blank" rel="noopener"
               style={{
                 display:"inline-block", width:"100%", textAlign:"center",
                 background:WA_COLOR, color:"#fff", padding:"10px 12px",
                 borderRadius:8, textDecoration:"none", fontWeight:700
               }}>
              Chat on WhatsApp
            </a>
            <div style={{fontSize:12, color:"#555", marginTop:6, textAlign:"center"}}>
              Payment: Cash on Delivery
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const btnMini: React.CSSProperties = {
  width:26, height:26, borderRadius:6, border:"none", background:"#1B6DA8", color:"#fff", cursor:"pointer"
};
