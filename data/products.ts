// Simple in-memory catalog (you can switch to DB/API later)
export type Product = {
  slug: string;
  name: string;
  price: number;     // raw number in KES
  image: string;     // absolute URL preferred for OG preview
  category: string;
};

export const products: Product[] = [
  {
    slug: "sport-shoes",
    name: "Sport Shoes",
    price: 6500,
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=1200",
    category: "Shoes",
  },
  {
    slug: "kitchenware",
    name: "Kitchenware",
    price: 3000,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31b?w=1200",
    category: "Appliances",
  },
  // add more products here...
];
