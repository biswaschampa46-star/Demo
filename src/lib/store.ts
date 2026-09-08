"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useEffect, useState } from "react";

export type CartItem = {
  key: string; // productId + variant
  productId: string;
  slug: string;
  name: string;
  image: string;
  variant: string;
  price: number;
  qty: number;
};

type CartState = {
  items: CartItem[];
  add: (item: Omit<CartItem, "key" | "qty">, qty: number) => void;
  remove: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      add: (item, qty) =>
        set((s) => {
          const key = `${item.productId}::${item.variant}`;
          const existing = s.items.find((i) => i.key === key);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.key === key ? { ...i, qty: Math.min(i.qty + qty, 99) } : i,
              ),
            };
          }
          return { items: [...s.items, { ...item, key, qty }] };
        }),
      remove: (key) => set((s) => ({ items: s.items.filter((i) => i.key !== key) })),
      setQty: (key, qty) =>
        set((s) => ({
          items:
            qty <= 0
              ? s.items.filter((i) => i.key !== key)
              : s.items.map((i) => (i.key === key ? { ...i, qty: Math.min(qty, 99) } : i)),
        })),
      clear: () => set({ items: [] }),
    }),
    { name: "evere-cart" },
  ),
);

type UIState = {
  cartOpen: boolean;
  menuOpen: boolean;
  searchOpen: boolean;
  setCartOpen: (v: boolean) => void;
  setMenuOpen: (v: boolean) => void;
  setSearchOpen: (v: boolean) => void;
};

export const useUI = create<UIState>((set) => ({
  cartOpen: false,
  menuOpen: false,
  searchOpen: false,
  setCartOpen: (v) => set({ cartOpen: v }),
  setMenuOpen: (v) => set({ menuOpen: v }),
  setSearchOpen: (v) => set({ searchOpen: v }),
}));

/** Avoids hydration mismatch for persisted-cart dependent UI. */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}

export function useCartTotals() {
  const items = useCart((s) => s.items);
  const hydrated = useHydrated();
  const count = hydrated ? items.reduce((n, i) => n + i.qty, 0) : 0;
  const subtotal = hydrated ? items.reduce((n, i) => n + i.price * i.qty, 0) : 0;
  return { count, subtotal, items: hydrated ? items : ([] as CartItem[]) };
}
