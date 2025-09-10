"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Category } from "@/types/category";

type ApiErr = { error?: string };

// Small helper
function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

export default function SetupPage() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [pw, setPw] = useState("");
  const [list, setList] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // New category form
  const [newName, setNewName] = useState("");
  const [newSort, setNewSort] = useState<number | "">("");

  useEffect(() => {
    // auth check
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then((j) => setLoggedIn(!!j.ok))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function login() {
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    setLoggedIn(r.ok);
    if (!r.ok) alert("Login failed");
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => {});
    setLoggedIn(false);
  }

  async function loadAll() {
    const r = await fetch("/api/categories");
    if (!r.ok) {
      alert("Failed to load categories");
      return;
    }
    const data = (await r.json()) as Category[];
    setList(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    if (loggedIn) loadAll();
  }, [loggedIn]);

  async function addCategory() {
    if (!newName.trim()) {
      alert("Enter a category name");
      return;
    }
    const body = {
      name: newName.trim(),
      sort:
        newSort === "" || Number.isNaN(Number(newSort))
          ? (list[list.length - 1]?.sort ?? 0) + 10
          : Number(newSort),
    };
    const r = await fetch("/api/categories", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!r.ok) {
      const e: ApiErr = await r.json().catch(() => ({}));
      alert(e.error || "Create failed");
      return;
    }
    setNewName("");
    setNewSort("");
    await loadAll();
  }

  async function patchCategory(id: string, patch: Partial<Category>) {
    const r = await fetch(`/api/categories/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!r.ok) {
      const e: ApiErr = await r.json().catch(() => ({}));
      throw new Error(e.error || "Update failed");
    }
  }

  async function renameCategory(id: string, nextName: string) {
    if (!nextName.trim()) return alert("Name cannot be empty");
    await patchCategory(id, { name: nextName.trim(), slug: slugify(nextName) } as any);
    await loadAll();
  }

  async function toggleActive(id: string, is_active: boolean) {
    await patchCategory(id, { is_active } as any);
    await loadAll();
  }

  async function move(id: string, dir: "up" | "down") {
    const i = list.findIndex((c) => c.id === id);
    if (i < 0) return;

    const swapWith = dir === "up" ? i - 1 : i + 1;
    if (swapWith < 0 || swapWith >= list.length) return;

    const a = list[i];
    const b = list[swapWith];

    try {
      // swap sort values
      await Promise.all([
        patchCategory(a.id, { sort: b.sort } as any),
        patchCategory(b.id, { sort: a.sort } as any),
      ]);
      await loadAll();
    } catch (e: any) {
      alert(e.message || "Reorder failed");
    }
  }

  async function remove(id: string) {
    if (!confirm("Delete this category?")) return;
    const r = await fetch(`/api/categories/${id}`, { method: "DELETE" });
    if (!r.ok) {
      const e: ApiErr = await r.json().catch(() => ({}));
      // If your API enforces “in use” check and returns 409:
      alert(e.error || "Delete failed");
      return;
    }
    await loadAll();
  }

  if (loading) return null;

  return (
    <main style={{ maxWidth: 980, margin: "40px auto", padding: 20 }}>
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700 }}>Admin</h1>
          <nav style={{ display: "flex", gap: 10, fontSize: 14 }}>
            <Link href="/admin">Products</Link>
            <span style={{ opacity: 0.5 }}>•</span>
            <strong>Setup</strong>
          </nav>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {loggedIn && (
            <button onClick={loadAll} style={{ padding: "8px 12px", borderRadius: 8, border: "1px solid #ddd" }}>
              Refresh
            </button>
          )}
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
            <button
              onClick={login}
              style={{ padding: "10px 14px", borderRadius: 8, background: "black", color: "white" }}
            >
              Login
            </button>
          </div>
          <p style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
            After login you can add, rename, reorder, deactivate and delete categories.
          </p>
        </section>
      )}

      {loggedIn && (
        <>
          {/* Add new category */}
          <section style={{ border: "1px solid #e5e5e5", padding: 16, borderRadius: 12, marginBottom: 24 }}>
            <h2 style={{ marginBottom: 8, fontSize: 18 }}>Add category</h2>
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <input
                placeholder="Category name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc", flex: 1 }}
              />
              <input
                type="number"
                placeholder="Sort (optional)"
                value={newSort}
                onChange={(e) => setNewSort(e.target.value === "" ? "" : Number(e.target.value))}
                style={{ padding: 10, borderRadius: 8, border: "1px solid #ccc", width: 140 }}
              />
              <button
                onClick={addCategory}
                style={{ padding: "10px 14px", borderRadius: 8, background: "black", color: "white" }}
              >
                Add
              </button>
            </div>
            <p style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
              Lower <code>sort</code> appears first. You can also use the arrows to reorder.
            </p>
          </section>

          {/* List & manage */}
          <section>
            <h2 style={{ marginBottom: 8, fontSize: 18 }}>Categories</h2>
            <div style={{ display: "grid", gap: 8 }}>
              {list
                .slice()
                .sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0) || a.name.localeCompare(b.name))
                .map((c, idx) => (
                  <Row
                    key={c.id}
                    cat={c}
                    canUp={idx > 0}
                    canDown={idx < list.length - 1}
                    onMoveUp={() => move(c.id, "up")}
                    onMoveDown={() => move(c.id, "down")}
                    onRename={(name) => renameCategory(c.id, name)}
                    onToggleActive={(active) => toggleActive(c.id, active)}
                    onDelete={() => remove(c.id)}
                  />
                ))}
            </div>
          </section>
        </>
      )}
    </main>
  );
}

/** ---------- Row ---------- */

function Row({
  cat,
  canUp,
  canDown,
  onMoveUp,
  onMoveDown,
  onRename,
  onToggleActive,
  onDelete,
}: {
  cat: Category;
  canUp: boolean;
  canDown: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onRename: (name: string) => void;
  onToggleActive: (active: boolean) => void;
  onDelete: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(cat.name);

  useEffect(() => setName(cat.name), [cat.name]);

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr auto auto auto auto",
        gap: 10,
        alignItems: "center",
        border: "1px solid #eee",
        padding: 12,
        borderRadius: 10,
      }}
    >
      {/* name */}
      <div>
        {!editing ? (
          <div style={{ fontWeight: 600 }}>
            {cat.name}{" "}
            {!cat.is_active ? <span style={{ fontSize: 12, color: "#b45309" }}>(inactive)</span> : null}
          </div>
        ) : (
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ padding: 8, border: "1px solid #ccc", borderRadius: 8, width: "100%" }}
          />
        )}
        <div style={{ fontSize: 12, opacity: 0.65, marginTop: 4 }}>
          sort: {cat.sort ?? 0} • slug: {cat.slug}
        </div>
      </div>

      {/* reorder */}
      <div style={{ display: "flex", gap: 6 }}>
        <button onClick={onMoveUp} disabled={!canUp} style={{ padding: "6px 10px", borderRadius: 6 }}>
          ↑
        </button>
        <button onClick={onMoveDown} disabled={!canDown} style={{ padding: "6px 10px", borderRadius: 6 }}>
          ↓
        </button>
      </div>

      {/* rename */}
      <div>
        {!editing ? (
          <button onClick={() => setEditing(true)} style={{ padding: "6px 10px", borderRadius: 6 }}>
            Rename
          </button>
        ) : (
          <button
            onClick={() => {
              setEditing(false);
              if (name !== cat.name) onRename(name);
            }}
            style={{ padding: "6px 10px", borderRadius: 6, background: "black", color: "white" }}
          >
            Save
          </button>
        )}
      </div>

      {/* activate/deactivate */}
      <div>
        {cat.is_active ? (
          <button
            onClick={() => onToggleActive(false)}
            style={{ padding: "6px 10px", borderRadius: 6, background: "#ef4444", color: "white" }}
          >
            Deactivate
          </button>
        ) : (
          <button
            onClick={() => onToggleActive(true)}
            style={{ padding: "6px 10px", borderRadius: 6, background: "#16a34a", color: "white" }}
          >
            Activate
          </button>
        )}
      </div>

      {/* delete */}
      <div>
        <button onClick={onDelete} style={{ padding: "6px 10px", borderRadius: 6 }}>Delete</button>
      </div>
    </div>
  );
}
