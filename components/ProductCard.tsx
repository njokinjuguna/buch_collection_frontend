"use client";
import Link from "next/link";
import { useCart } from "../context/CartContext";
import type { Product } from "../data/products";

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  const handleAdd = () => {
    add(product, 1);
    // notify the floating widget so it can “pop” open briefly
    window.dispatchEvent(new CustomEvent("cart:added", { detail: { slug: product.slug } }));
  };

  return (
    <div className="card">
      <Link href={`/p/${product.slug}`}>
        <img src={product.image} alt={product.name} />
      </Link>
      <div className="info">
        <span className="cat">{product.category}</span>
        <h3><Link href={`/p/${product.slug}`}>{product.name}</Link></h3>

        <div className="row">
          <button onClick={handleAdd}>Add to Enquiry</button>
        </div>
      </div>

      <style jsx>{`
        .card{background:#fff;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,.08);overflow:hidden}
        img{width:100%;height:220px;object-fit:cover;display:block}
        .info{padding:12px 14px}
        .cat{color:#666;font-size:.9rem}
        .row{display:flex;gap:10px;margin-top:10px}
        button{padding:8px 12px;border-radius:8px;border:none;background:#1B6DA8;color:#fff;cursor:pointer}
        button:hover{background:#155886}
      `}</style>
    </div>
  );
}
