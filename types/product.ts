// types/product.ts
export type Product = {
  id: string;
  slug: string;
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
};
