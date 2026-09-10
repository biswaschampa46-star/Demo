"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

type VariantGroup = { name: string; options: string[] };

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  material: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  stock: number;
  isNew: boolean;
  isFeatured: boolean;
  variants: VariantGroup[];
};

const EMPTY: ProductFormValues = {
  name: "",
  slug: "",
  description: "",
  material: "",
  price: 0,
  compareAtPrice: null,
  image: "",
  stock: 25,
  isNew: false,
  isFeatured: false,
  variants: [],
};

export default function ProductForm({ initial }: { initial?: ProductFormValues }) {
  const router = useRouter();
  const [v, setV] = useState<ProductFormValues>(initial ?? EMPTY);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const set = <K extends keyof ProductFormValues>(k: K, value: ProductFormValues[K]) =>
    setV((s) => ({ ...s, [k]: value }));

  const upload = async (file: File) => {
    setUploading(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      const data = (await res.json()) as { ok: boolean; url?: string; message?: string };
      if (data.ok && data.url) set("image", data.url);
      else setError(data.message ?? "Upload failed.");
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const res = await fetch(initial?.id ? `/api/admin/products/${initial.id}` : "/api/admin/products", {
        method: initial?.id ? "PUT" : "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(v),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (!data.ok) {
        setError(data.message ?? "Save failed.");
        setBusy(false);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch {
      setError("Save failed.");
      setBusy(false);
    }
  };

  const inputCls = "mt-2 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-sm text-foam placeholder:text-mist/40 focus:border-soft/60 focus:outline-none";

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-5">
      <label className="block text-xs uppercase tracking-[0.18em] text-mist">
        Name *
        <input value={v.name} onChange={(e) => set("name", e.target.value)} required className={inputCls} />
      </label>

      <label className="block text-xs uppercase tracking-[0.18em] text-mist">
        URL slug (leave empty to auto-generate)
        <input value={v.slug} onChange={(e) => set("slug", e.target.value)} maxLength={160} className={inputCls} placeholder="auto" />
      </label>

      <div className="grid grid-cols-2 gap-5">
        <label className="block text-xs uppercase tracking-[0.18em] text-mist">
          Price (৳) *
          <input type="number" min={0} value={v.price} onChange={(e) => set("price", Number(e.target.value))} required className={inputCls} />
        </label>
        <label className="block text-xs uppercase tracking-[0.18em] text-mist">
          Compare-at price (৳)
          <input
            type="number"
            min={0}
            value={v.compareAtPrice ?? ""}
            onChange={(e) => set("compareAtPrice", e.target.value === "" ? null : Number(e.target.value))}
            className={inputCls}
          />
        </label>
      </div>

      <label className="block text-xs uppercase tracking-[0.18em] text-mist">
        Stock
        <input type="number" min={0} value={v.stock} onChange={(e) => set("stock", Number(e.target.value))} className={inputCls} />
      </label>

      <div>
        <p className="text-xs uppercase tracking-[0.18em] text-mist">Image *</p>
        <div className="mt-2 flex items-start gap-4">
          {v.image && (
            <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-md border border-line-soft">
              <Image src={v.image} alt="" fill sizes="80px" className="object-cover" unoptimized />
            </div>
          )}
          <div className="flex-1">
            <input
              value={v.image}
              onChange={(e) => set("image", e.target.value)}
              placeholder="/images/products/mug.jpg or https://…"
              className={inputCls}
            />
            <label className="mt-2 inline-block cursor-pointer rounded-lg border border-line-soft px-3 py-2 text-xs text-mist hover:text-foam">
              {uploading ? "Uploading…" : "Upload from computer"}
              <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])} />
            </label>
          </div>
        </div>
      </div>

      <label className="block text-xs uppercase tracking-[0.18em] text-mist">
        Description
        <textarea value={v.description} onChange={(e) => set("description", e.target.value)} rows={4} className={inputCls} />
      </label>

      <label className="block text-xs uppercase tracking-[0.18em] text-mist">
        Material & care
        <textarea value={v.material} onChange={(e) => set("material", e.target.value)} rows={3} className={inputCls} />
      </label>

      {/* variants editor */}
      <div>
        <div className="flex items-center justify-between">
          <p className="text-xs uppercase tracking-[0.18em] text-mist">Variants (e.g. Color, Size)</p>
          <button
            type="button"
            onClick={() => set("variants", [...v.variants, { name: "", options: [] }])}
            className="rounded-lg border border-line-soft px-3 py-1.5 text-xs text-mist hover:text-foam"
          >
            + Add group
          </button>
        </div>
        <div className="mt-3 space-y-3">
          {v.variants.map((g, i) => (
            <div key={i} className="rounded-lg border border-line-soft p-3">
              <div className="flex gap-3">
                <input
                  value={g.name}
                  onChange={(e) =>
                    set("variants", v.variants.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                  }
                  placeholder="Group name (Color)"
                  className="flex-1 rounded-lg border border-line bg-transparent px-3 py-2 text-sm text-foam focus:border-soft/60 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => set("variants", v.variants.filter((_, j) => j !== i))}
                  className="rounded-lg border border-accent/40 px-3 text-xs text-accent"
                >
                  Remove
                </button>
              </div>
              <input
                value={g.options.join(", ")}
                onChange={(e) =>
                  set(
                    "variants",
                    v.variants.map((x, j) =>
                      j === i ? { ...x, options: e.target.value.split(",").map((o) => o.trim()).filter(Boolean) } : x,
                    ),
                  )
                }
                placeholder="Options, comma separated (Midnight, Fog)"
                className="mt-2 w-full rounded-lg border border-line bg-transparent px-3 py-2 text-sm text-foam focus:border-soft/60 focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-8 pt-2">
        <label className="flex items-center gap-3 text-sm text-mist">
          <input type="checkbox" checked={v.isNew} onChange={(e) => set("isNew", e.target.checked)} className="h-4 w-4 accent-white" />
          New arrival
        </label>
        <label className="flex items-center gap-3 text-sm text-mist">
          <input type="checkbox" checked={v.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} className="h-4 w-4 accent-white" />
          Featured
        </label>
      </div>

      {error && <p className="text-sm text-accent">{error}</p>}

      <button type="submit" disabled={busy} className="rounded-lg bg-white/10 px-6 py-3 text-sm font-semibold text-foam hover:bg-white/15 disabled:opacity-50">
        {busy ? "Saving…" : initial?.id ? "Save changes" : "Create product"}
      </button>
    </form>
  );
}
