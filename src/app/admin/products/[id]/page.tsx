import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import AdminShell from "@/components/admin/AdminShell";
import ProductForm, { type ProductFormValues } from "@/components/admin/ProductForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — Edit Product", robots: { index: false } };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const rows = await db.select().from(products).where(eq(products.id, id)).limit(1);
  const p = rows[0];
  if (!p) notFound();

  const initial: ProductFormValues = {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    material: p.material,
    price: p.price,
    compareAtPrice: p.compareAtPrice,
    image: p.image,
    stock: p.stock,
    isNew: p.isNew,
    isFeatured: p.isFeatured,
    variants: p.variants ?? [],
  };

  return (
    <AdminShell active="Products">
      <h1 className="font-display mb-8 text-2xl font-bold text-foam">Edit product</h1>
      <ProductForm initial={initial} />
    </AdminShell>
  );
}
