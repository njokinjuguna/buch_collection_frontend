"use client";
type Cat = { id: string; name: string };
export default function CategoryPills({ items, onPick }:{
  items: Cat[]; onPick?: (name:string)=>void
}) {
  return (
    <div className="pills">
      {items.map(c => (
        <button key={c.id} className="pill" onClick={()=>onPick?.(c.name)}>
          {c.name}
        </button>
      ))}
    </div>
  );
}
