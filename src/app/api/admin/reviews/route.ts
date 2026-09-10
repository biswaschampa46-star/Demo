import { NextResponse } from "next/server";
import { db } from "@/db";
import { productReviews, products } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { isAdmin, unauthorized } from "@/lib/auth";

export const dynamic = "force-dynamic";

export type AdminReview = {
  id: string;
  productId: string;
  productName: string;
  name: string;
  rating: number;
  review: string;
  email: string | null;
  phone: string | null;
  verifiedPurchase: boolean;
  approved: boolean;
  createdAt: Date;
};

/** GET /api/admin/reviews — all reviews with their product names. */
export async function GET() {
  if (!(await isAdmin())) return unauthorized();
  try {
    const rows = await db
      .select({
        id: productReviews.id,
        productId: productReviews.productId,
        productName: products.name,
        name: productReviews.name,
        rating: productReviews.rating,
        review: productReviews.review,
        email: productReviews.email,
        phone: productReviews.phone,
        verifiedPurchase: productReviews.verifiedPurchase,
        approved: productReviews.approved,
        createdAt: productReviews.createdAt,
      })
      .from(productReviews)
      .innerJoin(products, eq(productReviews.productId, products.id))
      .orderBy(desc(productReviews.createdAt))
      .limit(200);

    return NextResponse.json({ ok: true, reviews: rows as AdminReview[] });
  } catch (err) {
    console.error("admin list reviews failed", err);
    return NextResponse.json({ ok: false, message: "Could not load reviews." }, { status: 500 });
  }
}