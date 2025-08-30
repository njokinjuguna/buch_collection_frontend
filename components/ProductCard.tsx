"use client";
// import Link from "next/link"; // ← keep commented to avoid unused import for now
import Image from "next/image";
import { useCart } from "../context/CartContext";
import type { Product } from "@/types/product";

export default function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();

  const handleAdd = () => {
    add(product, 1);
    window.dispatchEvent(new CustomEvent("cart:added", { detail: { slug: product.slug } }));
  };

  return (
    <div className="card">
      {/* <Link href={`/p/${product.slug}`} aria-label={`View details for ${product.name}`}> */}
        <div className="media">
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
        {product.category && <span className="cat">{product.category}</span>}

        {/* <h3><Link href={`/p/${product.slug}`}>{product.name}</Link></h3> */}
        <h3>{product.name}</h3>

        <p className="price">KSh {product.price?.toLocaleString()}</p>

        <div className="row">
          <button onClick={handleAdd} aria-label={`Add ${product.name} to enquiry`}>
            Add to Enquiry
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
        .row {
          display: flex;
          gap: 10px;
          margin-top: 12px;
        }
        button {
          padding: 8px 14px;
          border-radius: 8px;
          border: none;
          background: #1b6da8;
          color: #fff;
          cursor: pointer;
          transition: background 0.2s ease;
        }
        button:hover {
          background: #155886;
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
