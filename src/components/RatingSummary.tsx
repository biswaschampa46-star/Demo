"use client";

import { useEffect, useState } from "react";
import StarRating from "@/components/StarRating";
import type { RatingSummary } from "@/lib/reviews";

/**
 * Live, compact rating summary. Fetches the averaged summary for a product
 * (never faked) and refreshes when a new review is published.
 * Returns null (renders nothing) until a product has approved reviews.
 */
export default function RatingSummary({
  productId,
  variant = "card",
  className = "",
}: {
  productId: string;
  variant?: "card" | "inline";
  className?: string;
}) {
  const [summary, setSummary] = useState<RatingSummary | null>(null);
  const [loaded, setLoaded] = useState(false);

  const load = async () => {
    try {
      const res = await fetch(`/api/reviews/summary?productId=${encodeURIComponent(productId)}`);
      const data = await res.json();
      setSummary(data.summary ?? null);
    } catch {
      setSummary(null);
    } finally {
      setLoaded(true);
    }
  };

  useEffect(() => {
    void load();
  }, [productId]);

  useEffect(() => {
    const onPublished = () => void load();
    window.addEventListener("reviews:published", onPublished);
    return () => window.removeEventListener("reviews:published", onPublished);
  }, [productId]);

  if (!loaded || !summary || summary.total === 0) return null;

  const label = `${summary.average.toFixed(1)} out of 5 stars from ${summary.total} ` +
    `${summary.total === 1 ? "review" : "reviews"}`;

  if (variant === "inline") {
    return (
      <div className={`inline-flex flex-wrap items-center gap-2.5 ${className}`}>
        <StarRating value={summary.average} size={14} label={label} />
        <span className="text-sm font-medium text-ice">{summary.average.toFixed(1)}</span>
        <span className="text-sm text-mist/80">
          · {summary.total} {summary.total === 1 ? "review" : "reviews"}
          {summary.verifiedCount > 0 ? ` · ${summary.verifiedCount} verified` : ""}
        </span>
      </div>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs text-mist/85 ${className}`}>
      <StarRating value={summary.average} size={12} label={label} />
      <span className="text-mist/70">({summary.total})</span>
    </span>
  );
}