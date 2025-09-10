// types/product.ts
export type StockStatus = 'in_stock' | 'out_of_stock' | 'restock';
export type OfferPercent = 10 | 30 | 50 | null;
export type Product = {
  id: string;
  slug?: string | null;
  name: string;
  description?: string;
  price: number;
  currency: string;
  image?: string | null;
  gallery?: string[];
  in_stock: boolean;
  visibility: "draft" | "published" | "archived";
  created_at?: string;
  updated_at?: string;
  category?: string | null;
  is_banner?: boolean;
  is_new?: boolean;
  stock_status?: StockStatus;
  offer_percent?: OfferPercent;
};




