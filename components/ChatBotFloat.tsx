"use client";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "../context/CartContext";
import { waHrefForCart, currency } from "../utils/whatsapp";

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
        }}>
        <img src="https://img.icons8.com/color/48/whatsapp--v1.png" width="40" height="40" alt="WhatsApp"/>
        {count > 0 && (
          <span style={{
            position:"absolute", top:-2, right:-2, background:"#e11d48", color:"#fff",
            borderRadius:999, fontSize:12, padding:"2px 6px", lineHeight:1, boxShadow:"0 2px 8px rgba(0,0,0,.2)"
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
                <img src={x.product.image} alt={x.product.name} style={{width:56, height:56, objectFit:"cover", borderRadius:8}}/>
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
