"use client";

import { useState } from "react";
import { Minus, Plus, Check, ShoppingBag, Truck, ShieldCheck } from "lucide-react";
import { useCart, useUI } from "@/lib/store";
import type { VariantGroup } from "@/db/schema";

export default function PurchasePanel({
  product,
}: {
  product: {
    id: string;
    slug: string;
    name: string;
    image: string;
    price: number;
    variants: VariantGroup[];
  };
}) {
  const hasVariants = product.variants.length > 0;
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(product.variants.map((v) => [v.name, v.options[0]])),
  );
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const add = useCart((s) => s.add);
  const setCartOpen = useUI((s) => s.setCartOpen);

  const variantLabel = hasVariants
    ? product.variants.map((v) => selected[v.name]).join(" / ")
    : "Standard";

  const ready = hasVariants ? product.variants.every((v) => selected[v.name]) : true;

  const onAdd = () => {
    if (!ready) return;
    add(
      {
        productId: product.id,
        slug: product.slug,
        name: product.name,
        image: product.image,
        variant: variantLabel,
        price: product.price,
      },
      qty,
    );
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      setCartOpen(true);
    }, 550);
  };

  return (
    <div>
      {/* variant groups */}
      {product.variants.map((group) => (
        <div key={group.name} className="mt-9">
          <div className="mb-4 flex items-baseline justify-between">
            <p className="label">{group.name}</p>
            <p className="text-xs text-mist/70">{selected[group.name]}</p>
          </div>
          <div className="flex flex-wrap gap-2.5" role="radiogroup" aria-label={group.name}>
            {group.options.map((opt) => {
              const active = selected[group.name] === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSelected((s) => ({ ...s, [group.name]: opt }))}
                  className={`rounded-full border px-5 py-2.5 text-xs uppercase tracking-[0.14em] transition-all duration-300 ${
                    active
                      ? "border-soft/70 bg-soft/10 text-ice"
                      : "border-line text-mist hover:border-soft/40 hover:text-foam"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* quantity + add */}
      <div className="mt-10 flex flex-wrap items-center gap-4">
        <div className="inline-flex items-center rounded-full border border-line">
          <button
            type="button"
            className="grid h-12 w-11 place-items-center text-mist transition-colors hover:text-ice"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
            aria-label="Decrease quantity"
          >
            <Minus className="h-3.5 w-3.5" />
          </button>
          <span className="w-8 text-center text-sm text-foam" aria-live="polite">{qty}</span>
          <button
            type="button"
            className="grid h-12 w-11 place-items-center text-mist transition-colors hover:text-ice"
            onClick={() => setQty((q) => Math.min(q + 1, 99))}
            aria-label="Increase quantity"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        <button
          type="button"
          onClick={onAdd}
          disabled={!ready}
          className="btn btn-solid flex-1 sm:flex-none sm:min-w-60"
        >
          {added ? (
            <>
              <Check className="h-4 w-4" /> Added
            </>
          ) : (
            <>
              <ShoppingBag className="h-4 w-4" strokeWidth={1.5} /> Add to Cart
            </>
          )}
        </button>
      </div>

      {/* quiet reassurances — no invented claims */}
      <ul className="mt-8 space-y-3 border-t border-line-soft pt-7 text-xs leading-relaxed text-mist/80">
        <li className="flex items-center gap-3">
          <Truck className="h-4 w-4 shrink-0 text-soft/70" strokeWidth={1.5} />
          Delivery across Bangladesh · free on orders over ৳5,000
        </li>
        <li className="flex items-center gap-3">
          <ShieldCheck className="h-4 w-4 shrink-0 text-soft/70" strokeWidth={1.5} />
          Advance payment via bKash, Nagad or Rocket — no cash on delivery
        </li>
      </ul>
    </div>
  );
}
