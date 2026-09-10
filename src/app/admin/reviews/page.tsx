import type { Metadata } from "next";
import { db } from "@/db";
import { productReviews, products } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import AdminShell from "@/components/admin/AdminShell";
import ReviewsManager from "@/components/admin/ReviewsManager";
import type { AdminReview } from "@/app/api/admin/reviews/route";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — Reviews", robots: { index: false } };

export default async function ReviewsPage() {
  let reviews: AdminReview[] = [];

  try {
    reviews = (await db
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
      .limit(200)) as unknown as AdminReview[];
  } catch {
    /* db not reachable — render empty */
  }

  return (
    <AdminShell active="Reviews">
      <h1 className="font-display text-2xl font-bold text-foam">Reviews</h1>
      <p className="mt-2 text-sm text-mist">
        Review, moderate and curate customer ratings. Hidden reviews are not shown on the store.
      </p>
      <div className="mt-8">
        <ReviewsManager reviews={reviews} />
      </div>
    </AdminShell>
  );
}