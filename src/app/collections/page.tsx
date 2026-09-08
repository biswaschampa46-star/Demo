import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import Reveal from "@/components/Reveal";
import { getAllProducts } from "@/lib/products";
import { CATEGORIES } from "@/lib/config";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Collections" };

const COVERS: Record<string, string> = {
  electronics: "/images/products/headphones.jpg",
  fashion: "/images/products/tote.jpg",
  accessories: "/images/products/sunglasses.jpg",
  home: "/images/products/lamp.jpg",
};

export default async function CollectionsPage() {
  const products = await getAllProducts();
  const counts = new Map<string, number>();
  for (const p of products) counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  const newCount = products.filter((p) => p.isNew).length;

  const rows = [
    ...CATEGORIES.map((c, i) => ({
      n: `0${i + 1}`,
      label: c.label,
      href: `/shop?category=${c.slug}`,
      count: counts.get(c.slug) ?? 0,
      cover: COVERS[c.slug] ?? "/images/hero.jpg",
    })),
    {
      n: `0${CATEGORIES.length + 1}`,
      label: "New Arrivals",
      href: "/shop?view=new",
      count: newCount,
      cover: "/images/products/journal.jpg",
    },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-28 pt-36 md:px-10 md:pt-44">
      <header className="mb-16 md:mb-24">
        <p className="label">Browse By Mood</p>
        <h1 className="display-2 mt-6 text-foam">Collections</h1>
        <p className="body-lead mt-7 max-w-md">
          Four quiet corners of the catalogue — plus everything that just landed.
        </p>
      </header>

      <ul className="divide-y divide-line-soft border-y border-line-soft">
        {rows.map((row, i) => (
          <Reveal key={row.label} delay={i * 70} as="li">
            <Link href={row.href} className="group grid grid-cols-12 items-center gap-5 py-8 md:py-10">
              <span className="font-display col-span-2 text-sm tracking-[0.3em] text-soft/60 md:col-span-1">
                {row.n}
              </span>
              <span className="font-display col-span-10 text-[clamp(1.6rem,4.5vw,3.4rem)] font-bold uppercase leading-none tracking-tight text-foam/85 transition-colors duration-500 group-hover:text-ice md:col-span-6">
                {row.label}
              </span>
              <span className="col-span-4 col-start-7 hidden text-sm text-mist md:col-span-2 md:col-start-9 md:block">
                {row.count} {row.count === 1 ? "piece" : "pieces"}
              </span>
              <span className="media-frame relative col-span-5 ml-auto hidden aspect-[16/10] w-40 overflow-hidden md:col-span-2 md:col-start-11 md:block">
                <Image
                  src={row.cover}
                  alt=""
                  fill
                  sizes="160px"
                  className="object-cover opacity-80 transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.06] group-hover:opacity-100"
                />
              </span>
              <ArrowUpRight className="col-span-1 hidden h-5 w-5 justify-self-end text-mist/50 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-ice md:col-start-13 md:block" />
            </Link>
          </Reveal>
        ))}
      </ul>

      <div className="mt-16">
        <Link
          href="/shop"
          className="group inline-flex items-center gap-3 text-xs uppercase tracking-[0.28em] text-soft hover:text-ice"
        >
          Or browse everything
          <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
