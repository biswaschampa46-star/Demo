import Link from "next/link";
import Image from "next/image";
import type { ProductCard as ProductCardType } from "@/lib/products";
import { bdt, discountPct } from "@/lib/format";

export default function ProductCard({
  product,
  sizes = "(max-width: 768px) 90vw, 40vw",
  priority = false,
}: {
  product: ProductCardType;
  sizes?: string;
  priority?: boolean;
}) {
  const pct = discountPct(product.price, product.compareAtPrice);

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group block"
      aria-label={`${product.name} — ${bdt(product.price)}`}
    >
      <div className="pcard-media media-frame relative aspect-[4/5]">
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
        {/* soft blue veil */}
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(7,26,43,0.35)] via-transparent to-transparent"
          aria-hidden="true"
        />
        {product.isNew && !pct && (
          <span className="badge-tag absolute left-4 top-4">New</span>
        )}
        {pct && <span className="badge-tag absolute left-4 top-4">Sale</span>}
      </div>

      <div className="pcard-meta mt-5 flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-[0.95rem] font-semibold uppercase tracking-[0.08em] text-foam">
            {product.name}
          </h3>
          <p className="label mt-1.5 !tracking-[0.24em] !text-mist/70">
            {product.category}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[0.95rem] font-medium text-ice">{bdt(product.price)}</p>
          {product.compareAtPrice ? (
            <p className="mt-1 flex items-center justify-end gap-2 text-xs text-mist/70">
              <span className="line-through">{bdt(product.compareAtPrice)}</span>
              {pct && <span className="text-accent">{pct}% off</span>}
            </p>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
