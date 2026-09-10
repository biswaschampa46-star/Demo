import { NextResponse } from "next/server";
import { getReviewSummary } from "@/lib/reviews";

export const dynamic = "force-dynamic";

/** Lightweight per-product rating summary for cards & the sticky header pill. */
export async function GET(request: Request) {
  const productId = new URL(request.url).searchParams.get("productId") ?? "";
  if (!productId) {
    return NextResponse.json({ ok: false, summary: null }, { status: 400 });
  }
  const summary = await getReviewSummary(productId);
  return NextResponse.json({ ok: true, summary });
}