export const revalidate = 86400; // daily fallback
export default async function ProductsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/products`, {
    next: { tags: ["products"] },
    cache: "force-cache",
  });
  const products = await res.json();
  // render your current cards using products[]
  return /* ... */;
}
