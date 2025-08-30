"use client";

import { useEffect, useMemo, useState } from "react";

type Visibility = "draft" | "published" | "archived";

type Product = {
  id: string;
  slug: string;
  name: string;
  price: number;
  currency: string;
  image?: string;
  visibility: Visibility;
  in_stock: boolean;
};

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

export default function AdminPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [pw, setPw] = useState("");
  const [list, setList] = useState<Product[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    price: 0,
    currency: "KES",
    image: "",
    in_stock: true,
    visibility: "draft" as const,
    slug: "",
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
      const slug = form.slug || `${slugify(form.name)}-${Math.random().toString(36).slice(2, 6)}`;
      const r = await fetch("/api/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...form, slug }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        alert("Create failed: " + (e.error || r.status));
        return;
      }
      setForm({
        name: "",
        price: 0,
        currency: "KES",
        image: "",
        in_stock: true,
        visibility: "draft",
        slug: "",
      });
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
}: {
  items: Product[];
  loggedIn: boolean;
  onChanged: () => Promise<void> | void;
  signAndUpload: (file: File) => Promise<string>;
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
}: {
  product: Product;
  loggedIn: boolean;
  onChanged: () => Promise<void> | void;
  signAndUpload: (file: File) => Promise<string>;
}) {
  const [edit, setEdit] = useState(false);
  const [busy, setBusy] = useState(false);
  const [local, setLocal] = useState<Product>(product);

  useEffect(() => setLocal(product), [product.id]); // reset if list reloads

  const changed =
    local.name !== product.name ||
    local.price !== product.price ||
    local.currency !== product.currency ||
    local.image !== product.image ||
    local.visibility !== product.visibility ||
    local.in_stock !== product.in_stock;

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
          in_stock: local.in_stock,
        }),
      });
      if (!r.ok) {
        const e = await r.json().catch(() => ({}));
        alert("Save failed: " + (e.error || r.status));
        return;
      }
      setEdit(false);
      await onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function publish() {
    setBusy(true);
    try {
      const r = await fetch(`/api/products/${product.id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ visibility: "published" as Visibility }),
      });
      if (!r.ok) alert("Publish failed");
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
      <div style={{ width: 64, height: 64, background: "#f7f7f7", borderRadius: 8, overflow: "hidden" }}>
        {local.image ? (
          <img src={local.image} alt={local.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        ) : null}
      </div>

      <div style={{ display: "grid", gap: 6 }}>
        {!edit ? (
          <>
            <div style={{ fontWeight: 600 }}>{product.name}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              {product.currency} {product.price} • {product.visibility} {product.in_stock ? "• in stock" : "• out of stock"}
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
            <div style={{ display: "flex", gap: 8 }}>
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
              <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 14 }}>
                <input
                  type="checkbox"
                  checked={local.in_stock}
                  onChange={(e) => setLocal((s) => ({ ...s, in_stock: e.target.checked }))}
                />
                in stock
              </label>
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
              <button onClick={publish} disabled={busy} style={{ padding: "6px 10px", borderRadius: 6 }}>
                {busy ? "Publishing..." : "Publish"}
              </button>
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
