"use client";

import { Star } from "lucide-react";

function SingleStar({
  fill,
  size,
  className = "",
}: {
  fill: number; // 0 → 1
  size: number;
  className?: string;
}) {
  return (
    <span
      className={`relative inline-block ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Star
        className="absolute inset-0"
        style={{ width: size, height: size }}
        stroke="rgba(140,203,255,0.35)"
        fill="rgba(140,203,255,0.12)"
        strokeWidth={1.2}
      />
      {fill > 0 && (
        <span
          className="absolute inset-0 overflow-hidden"
          style={{ width: `${Math.min(1, Math.max(0, fill)) * 100}%` }}
        >
          <Star
            className="absolute inset-0"
            style={{ width: size, height: size }}
            stroke="#66b8ff"
            fill="#66b8ff"
            strokeWidth={1.2}
          />
        </span>
      )}
    </span>
  );
}

/**
 * Accessible star rating.
 * - `value` renders N/5 with fractional (half) support.
 * - `interactive` (with `onChange`) renders a radio-style group: hover to
 *   preview, click to select, keyboard navigable.
 */
export default function StarRating({
  value,
  onChange,
  size = 16,
  label,
  className = "",
}: {
  value: number;
  onChange?: (v: number) => void;
  size?: number;
  label?: string;
  className?: string;
}) {
  if (onChange) {
    const rounder = [1, 2, 3, 4, 5];
    return (
      <div
        role="radiogroup"
        aria-label={label ?? "Rating"}
        className={`inline-flex items-center gap-0.5 ${className}`}
      >
        {rounder.map((n) => {
          const selected = n <= value;
          return (
            <button
              key={n}
              type="button"
              role="radio"
              aria-checked={selected}
              aria-label={`${n} out of 5 stars`}
              onClick={() => onChange(n)}
              className="rounded px-0.5 py-1 transition-transform duration-300 hover:scale-110 focus-visible:scale-110"
            >
              <Star
                style={{ width: size, height: size }}
                stroke={selected ? "#66b8ff" : "rgba(140,203,255,0.35)"}
                fill={selected ? "#66b8ff" : "rgba(140,203,255,0.12)"}
                strokeWidth={1.2}
                className="transition-all duration-300"
              />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      aria-label={label ? `${label}: ${value.toFixed(1)} out of 5` : undefined}
      role="img"
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <SingleStar key={i} fill={value - i} size={size} />
      ))}
    </span>
  );
}