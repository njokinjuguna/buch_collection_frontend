import { products } from "../data/products";
import ProductCard from "../components/ProductCard";
import ChatBotFloat from "../components/ChatBotFloat";

export default function Home() {
  return (
    <main style={{maxWidth:1200, margin:"40px auto", padding:"0 20px"}}>
      <h1 style={{textAlign:"center"}}>Featured Products</h1>
      <div style={{display:"grid", gap:20, gridTemplateColumns:"repeat(auto-fill,minmax(260px,1fr))"}}>
        {products.map(p => <ProductCard key={p.slug} product={p} />)}
      </div>
      <ChatBotFloat />
    </main>
  );
}
