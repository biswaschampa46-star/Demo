import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import ShopSort from "@/components/ShopSort";
import { getAllProducts, sortProducts, filterProducts, type SortKey } from "@/lib/products";
import { CATEGORIES } from "@/lib/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Shop" };

const SORTS: SortKey[] = ["featured", "newest", "price-asc", "price-desc", "name"];

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const category = typeof sp.category === "string" ? sp.category : "all";
  const view = typeof sp.view === "string" ? sp.view : undefined;
  const q = typeof sp.q === "string" ? sp.q : undefined;
  const sort: SortKey = SORTS.includes(sp.sort as SortKey) ? (sp.sort as SortKey) : "featured";

  const all = await getAllProducts();
  const filtered = sortProducts(filterProducts(all, { category, view, q }), sort);

  const title = q
    ? `“${q}”`
    : view === "new"
      ? "New Arrivals"
      : category !== "all"
        ? (CATEGORIES.find((c) => c.slug === category)?.label ?? "Shop")
        : "Shop All";

  const params: Record<string, string> = {};
  if (category !== "all") params.category = category;
  if (view) params.view = view;
  if (q) params.q = q;
  const filterHref = (patch: Record<string, string | null>) => {
    const merged = { ...params };
    for (const [k, v] of Object.entries(patch)) {
      if (v === null) delete merged[k];
      else merged[k] = v;
    }
    const str = new URLSearchParams(merged).toString();
    return `/shop${str ? `?${str}` : ""}`;
  };

  const chips = [
    { label: "All", href: filterHref({ category: null, view: null }), active: category === "all" && !view },
    ...CATEGORIES.map((c) => ({
      label: c.label,
      href: filterHref({ category: c.slug, view: null }),
      active: category === c.slug && !view,
    })),
    { label: "New Arrivals", href: filterHref({ view: "new", category: null }), active: view === "new" },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-28 pt-36 md:px-10 md:pt-44">
      {/* header */}
      <header className="mb-12 md:mb-16">
        <p className="label">{q ? "Search results" : "The Catalogue"}</p>
        <h1 className="display-2 mt-6 text-foam">{title}</h1>
        <p className="mt-5 text-sm text-mist">
          {filtered.length} {filtered.length === 1 ? "product" : "products"}
        </p>
      </header>

      {/* controls */}
      <div className="mb-14 flex flex-wrap items-center justify-between gap-x-8 gap-y-5 border-b border-line-soft pb-5">
        <nav aria-label="Categories" className="flex flex-wrap gap-x-7 gap-y-2">
          {chips.map((c) => (
            <Link key={c.label} href={c.href} className="chip" aria-pressed={c.active}>
              {c.label}
            </Link>
          ))}
        </nav>
        <Suspense>
          <ShopSort sort={sort} params={{ ...params, sort }} />
        </Suspense>
      </div>

      {/* grid — subtle editorial stagger */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-12 gap-x-6 gap-y-14 md:gap-x-8">
          {filtered.map((p, i) => (
            <div
              key={p.id}
              className={`col-span-12 sm:col-span-6 lg:col-span-4 ${
                i % 3 === 1 ? "lg:mt-14" : ""
              }`}
            >
              <ProductCard product={p} priority={i < 3} sizes="(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 30vw" />
            </div>
          ))}
        </div>
      ) : (
        <div className="py-24 text-center">
          <p className="font-display text-xl font-bold uppercase tracking-[0.12em] text-foam">
            Nothing here yet
          </p>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-mist">
            {q
              ? `No products matched “${q}”. Try a different search.`
              : "This shelf is being restocked. Explore the full catalogue instead."}
          </p>
          <Link href="/shop" className="btn btn-line mt-9">
            Browse everything
          </Link>
        </div>
      )}
    </div>
  );
}
