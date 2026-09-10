import { NextResponse } from "next/server";
import { db } from "@/db";
import { products } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin, unauthorized } from "@/lib/auth";
import { normalizeVariants, slugify, type ProductInput } from "../route";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(request: Request, ctx: Ctx) {
  if (!(await isAdmin())) return unauthorized();
  const { id } = await ctx.params;
  try {
    const body = (await request.json()) as ProductInput;
    const name = (body.name ?? "").trim();
    const price = Math.floor(Number(body.price));
    const image = (body.image ?? "").trim();
    if (name.length < 2) return NextResponse.json({ ok: false, message: "Name is required." }, { status: 400 });
    if (!Number.isFinite(price) || price < 0) return NextResponse.json({ ok: false, message: "Valid price is required." }, { status: 400 });
    if (!image) return NextResponse.json({ ok: false, message: "An image URL or upload is required." }, { status: 400 });

    const compare = body.compareAtPrice == null ? null : Math.floor(Number(body.compareAtPrice));

    await db
      .update(products)
      .set({
        name: name.slice(0, 160),
        slug: (body.slug ?? "").trim().slice(0, 160) || slugify(name),
        description: (body.description ?? "").trim(),
        material: (body.material ?? "").trim(),
        price,
        compareAtPrice: Number.isFinite(compare) && compare! > 0 ? compare : null,
        image: image.slice(0, 300),
        stock: Number.isFinite(Number(body.stock)) ? Math.max(0, Math.floor(Number(body.stock))) : 25,
        isNew: Boolean(body.isNew),
        isFeatured: Boolean(body.isFeatured),
        variants: normalizeVariants(body.variants),
      })
      .where(eq(products.id, id));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("admin product update failed", err);
    return NextResponse.json({ ok: false, message: "Could not update the product." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  if (!(await isAdmin())) return unauthorized();
  const { id } = await ctx.params;
  try {
    await db.delete(products).where(eq(products.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("admin product delete failed", err);
    return NextResponse.json({ ok: false, message: "Could not delete the product." }, { status: 500 });
  }
}
