// types/category.ts
export type Category = {
  id: string;
  name: string;
  slug: string;
  sort: number;
  is_active: boolean;
  created_at?: string;
};
