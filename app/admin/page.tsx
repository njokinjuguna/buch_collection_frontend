"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import type { Category } from "@/types/category";

type Visibility = "draft" | "published" | "archived";
type StockStatus = "in_stock" | "out_of_stock" | "restock";
// UI state can be empty string for "None"
type StockStatusUI = StockStatus | "";

type OfferPercent = 10 | 30 | 50 | null;

type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  image?: string;
  visibility: Visibility;
  in_stock: boolean;
  category?: string; 
  // API may also return these, but we keep them optional to avoid breaking:
  is_banner?: boolean;
  is_new?: boolean;
  stock_status?: StockStatus;
  offer_percent?: OfferPercent;
};




function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [pw, setPw] = useState("");
  const [list, setList] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);

  // NEW (Create-form flags)
  const [isBanner, setIsBanner] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [stockStatus, setStockStatus] = useState<StockStatusUI>(""); // was "in_stock"
  
  const [offerPercent, setOfferPercent] = useState<OfferPercent>(null);
  
  const [postFBOnCreate, setPostFBOnCreate] = useState(false);
  const [postIGOnCreate, setPostIGOnCreate] = useState(false);

//categories


// Load categories for the dropdowns
const [categories, setCategories] = useState<Category[]>([]);
useEffect(() => {
  fetch("/api/categories")
    .then((r) => r.json())
    .then((j) => setCategories(Array.isArray(j) ? j : []))
    .catch(() => setCategories([]));
}, []);


  // Existing create form fields
  const [form, setForm] = useState({
    name: "",
    price: 0,
    currency: "KES",
    image: "",
    in_stock: true, // kept for create compatibility (server still derives from stock_status)
    visibility: "draft" as const,
    slug: "",
    category: "",  
  });

  // detect cookie/session on mount
  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((j) => setLoggedIn(!!j.ok))
      .catch(() => {});
  }, []);

  async function login() {
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    setLoggedIn(r.ok);
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    setLoggedIn(false);
  }

  async function loadAll() {
    const r = await fetch("/api/products");
    if (r.ok) setList(await r.json());
  }

  useEffect(() => {
    loadAll();
  }, []);

  // Cloudinary signed upload (admin-only endpoint)
  async function signAndUpload(file: File) {
    const sigRes = await fetch("/api/upload/sign", { method: "POST" });
    if (!sigRes.ok) throw new Error("Not authorized or missing Cloudinary env vars");
    const sig = await sigRes.json();

    const fd = new FormData();
    fd.append("file", file);
    fd.append("api_key", sig.apiKey);
    fd.append("timestamp", String(sig.timestamp));
    fd.append("signature", sig.signature);
    fd.append("upload_preset", sig.upload_preset);

    const up = await fetch(`https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`, {
      method: "POST",
      body: fd,
    });
    const json = await up.json();
    if (!json.secure_url) throw new Error(JSON.stringify(json));
    // store optimized URL
    const optimized: string = (json.secure_url as string).replace(
      "/upload/",
      "/upload/f_auto,q_auto,w_1200/"
    );
    return optimized;
  }

  async function createProduct() {
  setSaving(true);
  try {
    const slug =
      form.slug || `${slugify(form.name)}-${Math.random().toString(36).slice(2, 6)}`;

    // 1) Create in app
    const r = await fetch("/api/products", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        ...form,
        slug,
        is_banner: isBanner,
        is_new: isNew,
        stock_status: stockStatus || null, // "" -> null
        offer_percent: offerPercent,
      }),
    });

    if (!r.ok) {
      const e = await r.json().catch(() => ({}));
      alert("Create failed: " + (e.error || r.status));
      return;
    }

    const created = await r.json(); // <-- use this for socials



    // 3) Reset (after socials so values are still available)
    setForm({
      name: "",
      price: 0,
      currency: "KES",
      image: "",
      in_stock: true,
      visibility: "draft",
      slug: "",
      category: "",
    });
    setIsBanner(false);
    setIsNew(false);
    setStockStatus(""); // reset to None
    setOfferPercent(null);

    await loadAll();
    alert("Created!");
  } finally {
    setSaving(false);
  }
}


  return (
    <main style={{ maxWidth: 980, margin: "40px auto", padding: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700 }}>Admin</h1>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={loadAll} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd" }}>
            Refresh
          </button>
          {loggedIn ? (
            <button onClick={logout} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd" }}>
              Logout
            </button>
          ) : null}
        </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
    
    <nav style={{ display: "flex", gap: 10, fontSize: 14 }}>
      <strong>Products</strong>
      <span style={{ opacity: 0.5 }}>•</span>
      <a href="/admin/setup">Setup</a>
    </nav>
  </div>
      </header>

      {!loggedIn && (
        <section style={{ border: "1px solid #e5e5e5", padding: 16, borderRadius: 12, marginBottom: 24 }}>
          <h2 style={{ marginBottom: 8, fontSize: 18 }}>Login</h2>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="password"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
              placeholder="Admin password"
              style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            />
            <button onClick={login} style={{ padding: "10px 14px", borderRadius: 8, background: "black", color: "white" }}>
              Login
            </button>
          </div>
          <p style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
            After login you can upload images, create, edit, publish and delete products.
          </p>
        </section>
      )}

      <section style={{ border: "1px solid #e5e5e5", padding: 16, borderRadius: 12, marginBottom: 24 }}>
        <h2 style={{ marginBottom: 8, fontSize: 18 }}>Create product</h2>
        <div style={{ display: "grid", gap: 10 }}>
          <input
            placeholder="Name"
            value={form.name}
            onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="number"
              placeholder="Price"
              value={form.price}
              onChange={(e) => setForm((s) => ({ ...s, price: Number(e.target.value || 0) }))}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc", width: 160 }}
            />
            <input
              placeholder="Currency"
              value={form.currency}
              onChange={(e) => setForm((s) => ({ ...s, currency: e.target.value }))}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc", width: 100 }}
            />
            <input
              placeholder="Slug (optional)"
              value={form.slug}
              onChange={(e) => setForm((s) => ({ ...s, slug: slugify(e.target.value) }))}
              style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc", flex: 1 }}
            />
          </div>
          

<div style={{ display: "flex", gap: 8 }}>
  {/* existing name/price/currency/slug inputs... */}
</div>

{/* Category */}
<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
  <span>Category</span>
  <select
    value={form.category}
    onChange={(e) => setForm((s) => ({ ...s, category: e.target.value }))}
    style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc", minWidth: 220 }}
  >
    <option value="">— pick category —</option>
    {categories.map((c) => (
      <option key={c.id} value={c.name}>
        {c.name}
      </option>
    ))}
  </select>
</div>

   
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              placeholder="Image URL (or use Upload)"
              value={form.image}
              onChange={(e) => setForm((s) => ({ ...s, image: e.target.value }))}
              style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #ccc" }}
            />
            <label
              style={{
                padding: "10px 12px",
                border: "1px solid #ccc",
                borderRadius: 8,
                cursor: loggedIn ? "pointer" : "not-allowed",
                opacity: loggedIn ? 1 : 0.6,
              }}
              title={loggedIn ? "Upload to Cloudinary" : "Login first"}
            >
              Upload
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (!f) return;
                  try {
                    const url = await signAndUpload(f);
                    setForm((s) => ({ ...s, image: url }));
                  } catch (err) {
                    console.error(err);
                    alert("Upload failed (check Cloudinary env and /api/upload/sign).");
                  }
                }}
                disabled={!loggedIn}
              />
            </label>
          </div>

          {/* NEW flags for Create */}
          <div style={{ display: "grid", gap: 8, gridTemplateColumns: "repeat(4, minmax(0,1fr))" }}>
            <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={isBanner} onChange={(e) => setIsBanner(e.target.checked)} />
              Make banner image
            </label>

            <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} />
              New
            </label>

<div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
  <span>Stock</span>
  <select
    value={stockStatus}
    onChange={(e) => setStockStatus(e.target.value as StockStatusUI)}
    style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc", flex: 1 }}
  >
    
    <option value="">None</option>        {/* ← new */}
    <option value="in_stock">in stock</option>
    <option value="out_of_stock">out of stock</option>
    <option value="restock">restock</option>
  </select>
</div>


            <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              <span>On offer</span>
              <select
                value={offerPercent ?? ""}
                onChange={(e) =>
                  setOfferPercent(e.target.value === "" ? null : (Number(e.target.value) as OfferPercent))
                }
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc", flex: 1 }}
              >
                <option value="">None</option>
                <option value="10">10%</option>
                <option value="30">30%</option>
                <option value="50">50%</option>
              </select>
            </div>
          </div>

          <button
            disabled={saving || !loggedIn}
            onClick={createProduct}
            style={{
              padding: "12px 16px",
              borderRadius: 10,
              background: loggedIn ? "black" : "#999",
              color: "white",
            }}
            title={loggedIn ? "" : "Login to create"}
          >
            {saving ? "Saving..." : "Create product"}
          </button>

        </div>
      </section>

      <EditableList
        items={list}
        loggedIn={loggedIn}
        onChanged={loadAll}
        signAndUpload={signAndUpload}
        categories={categories}
      />
    </main>
  );
}

/** ---------- Editable list & rows ---------- */



function EditableList({
  items,
  loggedIn,
  onChanged,
  signAndUpload,
  categories,  
}: {
  items: Product[];
  loggedIn: boolean;
  onChanged: () => Promise<void> | void;
  signAndUpload: (file: File) => Promise<string>;
  categories: Category[];
}) {
  return (
    <section>
      <h2 style={{ marginBottom: 8, fontSize: 18 }}>All products</h2>
      <div style={{ display: "grid", gap: 10 }}>
        {items.map((p) => (
          <EditableRow
            key={p.id}
            product={p}
            loggedIn={loggedIn}
            onChanged={onChanged}
            signAndUpload={signAndUpload}
            categories={categories}
          />
        ))}
      </div>
    </section>
  );
}

function EditableRow({
  product,
  loggedIn,
  onChanged,
  signAndUpload,
  categories,

}: {
  product: Product;
  loggedIn: boolean;
  onChanged: () => Promise<void> | void;
  signAndUpload: (file: File) => Promise<string>;
  categories: Category[]; 
}) {
  const [edit, setEdit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [local, setLocal] = useState<Product>(product);

  // Extra flags for edit (seed from product if present)
  const [isBanner, setIsBanner] = useState<boolean>((product as any).is_banner ?? false);
  const [isNew, setIsNew] = useState<boolean>((product as any).is_new ?? false);
const [stockStatus, setStockStatus] = useState<StockStatusUI>(
  (product as any).stock_status ?? ""
);
  const [offerPercent, setOfferPercent] = useState<OfferPercent>(
    (((product as any).offer_percent ?? null) as OfferPercent)
  );

const [pubOpen, setPubOpen] = useState(false);
const [pubWeb, setPubWeb] = useState(true);     // default publish to website
const [pubFB, setPubFB] = useState(false);
const [pubIG, setPubIG] = useState(false);

// close the small menu when clicking elsewhere
useEffect(() => {
  function onDocClick(e: MouseEvent) {
    const el = document.getElementById(`pub-${product.id}`);
    if (el && !el.contains(e.target as Node)) setPubOpen(false);
  }
  if (pubOpen) document.addEventListener("click", onDocClick);
  return () => document.removeEventListener("click", onDocClick);
}, [pubOpen, product.id]);

  useEffect(() => {
    if (!edit) {
      setLocal(product); // don't overwrite while editing
      setIsBanner((product as any).is_banner ?? false);
      setIsNew((product as any).is_new ?? false);
      setStockStatus((product as any).stock_status ?? "");

      setOfferPercent((((product as any).offer_percent ?? null) as OfferPercent));
    }
  }, [product, edit]);


  // Derive the stock label from stock_status (fallback to boolean for older rows)
const viewStock = (product as any).stock_status as StockStatus | undefined;
let viewStatusLabel = "";
if (viewStock === "in_stock") viewStatusLabel = "• in stock";
else if (viewStock === "out_of_stock") viewStatusLabel = "• out of stock";
else if (viewStock === "restock") viewStatusLabel = "• restock soon";
// if undefined or "", show nothing



  const changed =
    local.name !== product.name ||
    local.price !== product.price ||
    local.currency !== product.currency ||
    local.image !== product.image ||
    local.visibility !== product.visibility ||
    (local.category || "") !== (product.category || "") || 
    // removed: local.in_stock !== product.in_stock
    isBanner !== ((product as any).is_banner ?? false) ||
    isNew !== ((product as any).is_new ?? false) ||
    (stockStatus || "") !== (((product as any).stock_status ?? "") as string) ||
    (offerPercent ?? null) !== (((product as any).offer_percent ?? null) as OfferPercent);

  async function save() {
    setBusy(true);
    try {
      const r = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: local.name,
          price: local.price,
          currency: local.currency,
          image: local.image,
          visibility: local.visibility,
          category: local.category ?? "", 
          // removed: in_stock: local.in_stock,
          // NEW
          is_banner: isBanner,
          is_new: isNew,
          stock_status: stockStatus || null,
          offer_percent: offerPercent,
        }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        alert("Save failed: " + (e.error || r.status));
        return;
      }


          // ✅ POST to social (best-effort; don't block)
    try {
      await fetch("/api/social/publish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          product: {
            name: local.name,
            price: local.price,
            currency: local.currency,
            image: local.image,
            slug: product.slug,            // keep existing slug
            stock_status: (stockStatus as any) || null,
            is_new: isNew,
            offer_percent: offerPercent,
            category: local.category || "",
          },
          platforms: ["facebook", "instagram"],
        }),
      });
    } catch {}

      setEdit(false);
      await onChanged();
    } finally {
      setBusy(false);
    }
  }


  

async function publishSelected() {
  if (!pubWeb && !pubFB && !pubIG) {
    setPubOpen(false);
    return;
  }
  setBusy(true);
  try {
    // 1) Website publish (sets visibility)
    if (pubWeb) {
      const r = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ visibility: "published" as Visibility }),
      });
      if (!r.ok) alert("Publish to website failed");
    }

    // 2) Socials
    const platforms: Array<"facebook" | "instagram"> = [];
    if (pubFB) platforms.push("facebook");
    if (pubIG) platforms.push("instagram");

    if (platforms.length && product.image) {
      await fetch("/api/social/publish", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          product: {
            name: product.name,
            price: product.price,
            currency: product.currency,
            image: product.image,
            slug: product.slug,
            stock_status: (product as any).stock_status ?? null,
            is_new: (product as any).is_new ?? false,
            offer_percent: (product as any).offer_percent ?? null,
            category: product.category ?? "",
          },
          platforms,
        }),
      });
    }

    setPubOpen(false);
    await onChanged();
  } finally {
    setBusy(false);
  }
}


  async function del() {
    if (!confirm("Delete this product?")) return;
    setBusy(true);
    try {
      const r = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      if (!r.ok) alert("Delete failed");
      await onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "auto 1fr auto",
        gap: 12,
        alignItems: "center",
        border: "1px solid #eee",
        padding: 12,
        borderRadius: 10,
      }}
    >
      <div
        style={{
          position: "relative",
          width: 64,
          height: 64,
          background: "#f7f7f7",
          borderRadius: 8,
          overflow: "hidden",
        }}
      >
        {local.image ? (
          <Image
            src={local.image}
            alt={local.name}
            fill
            sizes="64px"
            style={{ objectFit: "cover" }}
          />
        ) : null}
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        {!edit ? 
        (
          <>
            <div style={{ fontWeight: 600 }}>{product.name}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              {product.currency} {product.price} • {product.visibility} {viewStatusLabel}
{(product as any).is_new ? " • new" : ""}

            </div>
          </>
        ) : (
          <div style={{ display: "grid", gap: 6 }}>
            <input
              value={local.name}
              onChange={(e) => setLocal((s) => ({ ...s, name: e.target.value }))}
              style={{ padding: 8, border: "1px solid #ccc", borderRadius: 8 }}
              placeholder="Name"
            />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <input
                type="number"
                value={local.price}
                onChange={(e) => setLocal((s) => ({ ...s, price: Number(e.target.value || 0) }))}
                style={{ padding: 8, border: "1px solid #ccc", borderRadius: 8, width: 140 }}
                placeholder="Price"
              />
              <input
                value={local.currency}
                onChange={(e) => setLocal((s) => ({ ...s, currency: e.target.value }))}
                style={{ padding: 8, border: "1px solid #ccc", borderRadius: 8, width: 100 }}
                placeholder="Currency"
              />
              <select
                value={local.visibility}
                onChange={(e) => setLocal((s) => ({ ...s, visibility: e.target.value as Visibility }))}
                style={{ padding: 8, border: "1px solid #ccc", borderRadius: 8, width: 140 }}
              >
                <option value="draft">draft</option>
                <option value="published">published</option>
                <option value="archived">archived</option>
              </select>
              {/* removed "in stock" checkbox */}
            </div>

            {/* NEW flags in edit */}
            <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span>Category</span>
                <select
                  value={local.category || ""}
                  onChange={(e) => setLocal((s) => ({ ...s, category: e.target.value }))}
                  style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
                >
                  <option value="">— pick category —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <input type="checkbox" checked={isBanner} onChange={(e) => setIsBanner(e.target.checked)} />
                banner
              </label>

              <label style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <input type="checkbox" checked={isNew} onChange={(e) => setIsNew(e.target.checked)} />
                new
              </label>

              <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span>Stock</span>
                <select
                  value={stockStatus ?? ""}
                  onChange={(e) => setStockStatus(e.target.value as StockStatusUI)}
                  style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
                >
                  <option value="">none</option>
                  <option value="in_stock">in stock</option>
                  <option value="out_of_stock">out of stock</option>
                  <option value="restock">restock</option>
                </select>
              </div>

              <div style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                <span>On offer</span>
                <select
                  value={offerPercent ?? ""}
                  onChange={(e) =>
                    setOfferPercent(e.target.value === "" ? null : (Number(e.target.value) as OfferPercent))
                  }
                  style={{ padding: 8, borderRadius: 8, border: "1px solid #ccc" }}
                >
                  <option value="">none</option>
                  <option value="10">10%</option>
                  <option value="30">30%</option>
                  <option value="50">50%</option>
                </select>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                value={local.image || ""}
                onChange={(e) => setLocal((s) => ({ ...s, image: e.target.value }))}
                style={{ padding: 8, border: "1px solid #ccc", borderRadius: 8, flex: 1 }}
                placeholder="Image URL"
              />
              <label
                style={{
                  padding: "8px 10px",
                  border: "1px solid #ccc",
                  borderRadius: 8,
                  cursor: loggedIn ? "pointer" : "not-allowed",
                  opacity: loggedIn ? 1 : 0.6,
                }}
                title={loggedIn ? "Upload to Cloudinary" : "Login first"}
              >
                Change image
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    try {
                      const url = await signAndUpload(f);
                      setLocal((s) => ({ ...s, image: url }));
                    } catch (err) {
                      console.error(err);
                      alert("Upload failed.");
                    }
                  }}
                  disabled={!loggedIn}
                />
              </label>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        {!edit ? (
          <>

          {loggedIn && product.visibility !== "published" && (
  <div id={`pub-${product.id}`} style={{ position: "relative", display: "inline-block" }}>
    <button
      onClick={() => setPubOpen((v) => !v)}
      disabled={busy}
      style={{ padding: "6px 10px", borderRadius: 6 }}
    >
      {busy ? "..." : "Publish"}
    </button>

    {pubOpen && (
      <div
        style={{
          position: "absolute",
          top: "110%",
          right: 0,
          zIndex: 10,
          background: "#fff",
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 10,
          minWidth: 220,
          boxShadow: "0 8px 24px rgba(0,0,0,.12)",
        }}
      >
        <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, opacity: 0.7 }}>
          Publish to
        </div>

        <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
          <input type="checkbox" checked={pubWeb} onChange={(e) => setPubWeb(e.target.checked)} />
          Website (set “published”)
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
          <input type="checkbox" checked={pubFB} onChange={(e) => setPubFB(e.target.checked)} />
          Facebook Page
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 0" }}>
          <input type="checkbox" checked={pubIG} onChange={(e) => setPubIG(e.target.checked)} />
          Instagram
        </label>

        <button
          onClick={publishSelected}
          disabled={busy || (!pubWeb && !pubFB && !pubIG)}
          style={{
            marginTop: 8,
            width: "100%",
            padding: "6px 10px",
            borderRadius: 6,
            background: "black",
            color: "white",
          }}
        >
          Go
        </button>
      </div>
    )}
  </div>
)}


            {loggedIn && (
              <button onClick={() => setEdit(true)} style={{ padding: "6px 10px", borderRadius: 6 }}>
                Edit
              </button>
            )}
            {loggedIn && (
              <button onClick={del} disabled={busy} style={{ padding: "6px 10px", borderRadius: 6 }}>
                {busy ? "Deleting..." : "Delete"}
              </button>
            )}
          </>
        ) : (
          <>
            <button
              onClick={() => {
                setLocal(product);
                setIsBanner((product as any).is_banner ?? false);
                setIsNew((product as any).is_new ?? false);
                setStockStatus((product as any).stock_status ?? "");
                setOfferPercent((((product as any).offer_percent ?? null) as OfferPercent));
                setEdit(false);
              }}
              style={{ padding: "6px 10px", borderRadius: 6 }}
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={!changed || busy}
              style={{ padding: "6px 10px", borderRadius: 6, background: changed ? "black" : "#999", color: "white" }}
            >
              {busy ? "Saving..." : "Save"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
