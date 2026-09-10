import { BadgeCheck } from "lucide-react";

/**
 * Small trust marker shown only when the review's author owns an order that
 * actually contained the product (verified server-side at creation).
 */
export default function VerifiedPurchaseBadge({
  className = "",
}: {
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-soft/30 bg-soft/8 px-2.5 py-0.5 text-[0.66rem] font-medium uppercase tracking-[0.12em] text-soft ${className}`}
    >
      <BadgeCheck className="h-3 w-3 flex-shrink-0" strokeWidth={1.6} />
      Verified purchase
    </span>
  );
}