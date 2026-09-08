import { db } from "@/db";
import { products, type Product } from "@/db/schema";
import { desc, eq, ilike, or, sql } from "drizzle-orm";

export type ProductCard = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  isNew: boolean;
  isFeatured: boolean;
};

const cardColumns = {
  id: products.id,
  slug: products.slug,
  name: products.name,
  category: products.category,
  price: products.price,
  compareAtPrice: products.compareAtPrice,
  image: products.image,
  isNew: products.isNew,
  isFeatured: products.isFeatured,
} as const;

export async function getAllProducts(): Promise<ProductCard[]> {
  try {
    return await db.select(cardColumns).from(products).orderBy(desc(products.createdAt));
  } catch {
    return [];
  }
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const rows = await db.select().from(products).where(eq(products.slug, slug)).limit(1);
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function getRelatedProducts(product: Product, limit = 3): Promise<ProductCard[]> {
  try {
    return await db
      .select(cardColumns)
      .from(products)
      .where(sql`${products.category} = ${product.category} and ${products.id} <> ${product.id}`)
      .limit(limit);
  } catch {
    return [];
  }
}

export async function searchProducts(q: string, limit = 6): Promise<ProductCard[]> {
  const term = `%${q.trim()}%`;
  if (!q.trim()) return [];
  try {
    return await db
      .select(cardColumns)
      .from(products)
      .where(or(ilike(products.name, term), ilike(products.category, term), ilike(products.description, term)))
      .limit(limit);
  } catch {
    return [];
  }
}

export type SortKey = "featured" | "newest" | "price-asc" | "price-desc" | "name";

export function sortProducts(list: ProductCard[], sort: SortKey): ProductCard[] {
  const arr = [...list];
  switch (sort) {
    case "price-asc":
      return arr.sort((a, b) => a.price - b.price);
    case "price-desc":
      return arr.sort((a, b) => b.price - a.price);
    case "name":
      return arr.sort((a, b) => a.name.localeCompare(b.name));
    case "featured":
      return arr.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
    case "newest":
    default:
      return arr;
  }
}

export function filterProducts(
  list: ProductCard[],
  opts: { category?: string; view?: string; q?: string },
): ProductCard[] {
  let out = list;
  if (opts.view === "new") out = out.filter((p) => p.isNew);
  if (opts.category && opts.category !== "all") {
    out = out.filter((p) => p.category === opts.category);
  }
  if (opts.q) {
    const t = opts.q.toLowerCase();
    out = out.filter(
      (p) => p.name.toLowerCase().includes(t) || p.category.toLowerCase().includes(t),
    );
  }
  return out;
}
