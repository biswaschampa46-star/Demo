import { NextResponse } from "next/server";
import { db } from "@/db";
import { productReviews } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { isAdmin, unauthorized } from "@/lib/auth";

/** PATCH /api/admin/reviews/[id] — moderate (approve / hide). */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) return unauthorized();
  const { id } = await params;
  try {
    const body = (await request.json()) as { approved?: boolean };
    const [updated] = await db
      .update(productReviews)
      .set({
        approved: Boolean(body.approved),
        updatedAt: sql`now()`,
      })
      .where(eq(productReviews.id, id))
      .returning({ id: productReviews.id, approved: productReviews.approved });
    if (!updated) {
      return NextResponse.json({ ok: false, message: "Review not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, review: updated });
  } catch (err) {
    console.error("admin update review failed", err);
    return NextResponse.json({ ok: false, message: "Could not update the review." }, { status: 500 });
  }
}

/** DELETE /api/admin/reviews/[id] — remove a review. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  if (!(await isAdmin())) return unauthorized();
  const { id } = await params;
  try {
    const [deleted] = await db
      .delete(productReviews)
      .where(eq(productReviews.id, id))
      .returning({ id: productReviews.id, productId: productReviews.productId });
    if (!deleted) {
      return NextResponse.json({ ok: false, message: "Review not found." }, { status: 404 });
    }
    return NextResponse.json({ ok: true, id: deleted.id });
  } catch (err) {
    console.error("admin delete review failed", err);
    return NextResponse.json({ ok: false, message: "Could not delete the review." }, { status: 500 });
  }
}