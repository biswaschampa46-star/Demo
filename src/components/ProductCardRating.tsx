"use client";

import RatingSummary from "@/components/RatingSummary";

/**
 * Compact star summary shown on a product card. Renders nothing until the
 * product has at least one approved review. Averages are computed live —
 * never displayed until real review data exists.
 */
export default function ProductCardRating({
  productId,
  className = "",
}: {
  productId: string;
  className?: string;
}) {
  return (
    <RatingSummary
      productId={productId}
      variant="card"
      className={className}
    />
  );
}