"use client";
import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import type { Product } from "@/types/product";

export type CartItem = { product: Product; qty: number };
type Ctx = {
  items: CartItem[];
  add: (p: Product, qty?: number) => void;
  remove: (slug: string) => void;
  setQty: (slug: string, qty: number) => void;
  clear: () => void;
  total: number;
};

const CartContext = createContext<Ctx | null>(null);
const KEY = "buch_cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  // load from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  // save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {}
  }, [items]);

  const add = (p: Product, qty = 1) => {
    setItems(prev => {
      const i = prev.findIndex(x => x.product.slug === p.slug);
      if (i >= 0) {
        const copy = [...prev];
        copy[i] = { ...copy[i], qty: copy[i].qty + qty };
        return copy;
      }
      return [...prev, { product: p, qty }];
    });
  };

  const remove = (slug: string) => setItems(prev => prev.filter(x => x.product.slug !== slug));

  const setQty = (slug: string, qty: number) => {
    setItems(prev => {
      if (qty <= 0) return prev.filter(x => x.product.slug === slug ? false : true);
      return prev.map(x => x.product.slug === slug ? { ...x, qty } : x);
    });
  };

  const total = useMemo(
    () => items.reduce((s, x) => s + x.product.price * x.qty, 0),
    [items]
  );

  const value = useMemo(() => ({ items, add, remove, setQty, clear: () => setItems([]), total }), [items, total]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
