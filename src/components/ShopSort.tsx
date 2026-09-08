"use client";

import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import type { SortKey } from "@/lib/products";

const OPTIONS: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name A–Z" },
];

export default function ShopSort({
  sort,
  params,
}: {
  sort: SortKey;
  params: Record<string, string>;
}) {
  const router = useRouter();

  const onChange = (value: string) => {
    const sp = new URLSearchParams(params);
    sp.set("sort", value);
    router.push(`/shop?${sp.toString()}`);
  };

  return (
    <label className="relative inline-flex items-center gap-3">
      <span className="label sr-only md:not-sr-only">Sort</span>
      <span className="relative">
        <select
          value={sort}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Sort products"
          className="cursor-pointer appearance-none rounded-full border border-line bg-transparent py-2.5 pl-5 pr-10 text-xs uppercase tracking-[0.18em] text-foam transition-colors hover:border-soft/50 focus:outline-none focus:border-soft/60"
        >
          {OPTIONS.map((o) => (
            <option key={o.value} value={o.value} className="bg-deep text-foam normal-case">
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-mist" />
      </span>
    </label>
  );
}
