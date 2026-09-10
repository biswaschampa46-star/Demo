"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { bdt } from "@/lib/format";
import type { ProductCard } from "@/lib/products";

export default function ProductsManager({ products }: { products: ProductCard[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(
    () => products.filter((p) => p.name.toLowerCase().includes(q.trim().toLowerCase())),
    [products, q],
  );

  const remove = async (id: string, name: string) => {
    if (!confirm(`Delete “${name}”? This cannot be undone.`)) return;
    setBusyId(id);
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          className="w-64 rounded-lg border border-line bg-transparent px-4 py-2.5 text-sm text-foam placeholder:text-mist/40 focus:border-soft/60 focus:outline-none"
        />
        <Link href="/admin/products/new" className="rounded-lg bg-white/10 px-4 py-2.5 text-sm font-semibold text-foam hover:bg-white/15">
          + New product
        </Link>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-mist">No products found.</p>
      ) : (
        <ul className="divide-y divide-line-soft rounded-xl border border-line-soft">
          {filtered.map((p) => (
            <li key={p.id} className="flex items-center gap-4 p-4">
              <div className="relative h-16 w-14 shrink-0 overflow-hidden rounded-md bg-white/5">
                <Image src={p.image} alt="" fill sizes="56px" className="object-cover" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foam">{p.name}</p>
                <p className="mt-1 text-xs text-mist">
                  {bdt(p.price)}{p.isNew ? " · New" : ""}{p.isFeatured ? " · Featured" : ""}
                </p>
              </div>
              <Link href={`/admin/products/${p.id}`} className="rounded-lg border border-line-soft px-3 py-1.5 text-xs text-mist hover:text-foam">
                Edit
              </Link>
              <button
                type="button"
                onClick={() => remove(p.id, p.name)}
                disabled={busyId === p.id}
                className="rounded-lg border border-accent/40 px-3 py-1.5 text-xs text-accent hover:bg-accent/10 disabled:opacity-50"
              >
                {busyId === p.id ? "…" : "Delete"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
