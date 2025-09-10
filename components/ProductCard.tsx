"use client";
// import Link from "next/link"; // ← keep commented to avoid unused import for now
import Image from "next/image";
import { useCart } from "../context/CartContext";
import type { Product } from "@/types/product";

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  // Gracefully support older Product type: read extra fields via `any`
  const isNew: boolean = (product as any).is_new ?? false;
  const offer: 10 | 30 | 50 | null = (product as any).offer_percent ?? null;
  const stockStatus: "in_stock" | "out_of_stock" | "restock" =
    (product as any).stock_status ?? (product.in_stock ? "in_stock" : "out_of_stock");

  const isOut = stockStatus === "out_of_stock";
  const isRestock = stockStatus === "restock";

  const price = product.price ?? 0;
  const discounted = offer ? Math.round(price * (1 - offer / 100)) : price;

  const handleAdd = () => {
    if (isOut) return;
    add(product, 1);
    window.dispatchEvent(new CustomEvent("cart:added", { detail: { slug: product.slug } }));
  };

  return (
    <div className="card">
      {/* <Link href={`/p/${product.slug}`} aria-label={`View details for ${product.name}`}> */}
      <div className="media">
        {/* BADGES */}
        <div className="badges">
          {isNew && <span className="badge new">New</span>}
          {offer && <span className="badge offer">-{offer}%</span>}
          {isOut && <span className="badge out">Out of stock</span>}
          {!isOut && isRestock && <span className="badge restock">Restock soon</span>}
        </div>

        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            style={{ objectFit: "cover" }}
            priority={false}
            unoptimized
          />
        ) : (
          <div className="fallback">No Image</div>
        )}
      </div>
      {/* </Link> */}

      <div className="info">
        {/** keep optional category if present */}
        {(product as any).category && <span className="cat">{(product as any).category}</span>}

        {/* <h3><Link href={`/p/${product.slug}`}>{product.name}</Link></h3> */}
        <h3>{product.name}</h3>

        {/* PRICE: show discount if offer */}
        {offer ? (
          <div className="price-wrap">
            <p className="price strike">KSh {price?.toLocaleString()}</p>
            <p className="price">KSh {discounted?.toLocaleString()}</p>
          </div>
        ) : (
          <p className="price">KSh {price?.toLocaleString()}</p>
        )}

        <div className="row">
          <button
            onClick={handleAdd}
            aria-label={`Add ${product.name} to enquiry`}
            disabled={isOut}
            className={isOut ? "btn disabled" : "btn"}
            title={isOut ? "Currently out of stock" : ""}
          >
            {isOut ? "Unavailable" : "Add to Enquiry"}
          </button>
        </div>
      </div>

      <style jsx>{`
        .card {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .card:hover {
          transform: translateY(-4px);
          box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
        }
        .media {
          position: relative;
          width: 100%;
          height: 220px;
          background: #f0f0f0;
        }
        .badges {
          position: absolute;
          top: 10px;
          left: 10px;
          display: flex;
          gap: 6px;
          z-index: 2;
        }
        .badge {
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 12px;
          color: #fff;
          line-height: 1.4;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
        }
        .badge.new {
          background: #16a34a;
        }
        .badge.offer {
          background: #ef4444;
        }
        .badge.out {
          background: #111827;
        }
        .badge.restock {
          background: #f59e0b;
        }
        .fallback {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #999;
          font-size: 0.9rem;
        }
        .info {
          padding: 14px 16px;
        }
        .cat {
          color: #666;
          font-size: 0.85rem;
          margin-bottom: 4px;
          display: block;
        }
        h3 {
          font-size: 1.1rem;
          margin: 6px 0;
        }
        .price {
          font-weight: bold;
          color: #333;
          margin-top: 4px;
        }
        .price-wrap {
          display: flex;
          align-items: baseline;
          gap: 8px;
        }
        .strike {
          text-decoration: line-through;
          opacity: 0.6;
          font-weight: normal;
        }
        .row {
          display: flex;
          gap: 10px;
          margin-top: 12px;
        }
        .btn {
          padding: 8px 14px;
          border-radius: 8px;
          border: none;
          background: #1b6da8;
          color: #fff;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        .btn:hover {
          background: #155886;
        }
        .btn.disabled,
        .btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        @media (max-width: 600px) {
          .media {
            height: 180px;
          }
          .info {
            padding: 12px;
          }
        }
      `}</style>
    </div>
  );
}
