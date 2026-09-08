/**
 * Store configuration — edit these values (or set env vars) to match the
 * real store. Nothing here is invented merchant data: payment numbers are
 * only surfaced when explicitly configured via environment variables.
 */

export const STORE = {
  name: "EVERE",
  tagline: "Everyday objects, elevated.",
  city: "Dhaka, Bangladesh",
};

/** Flat shipping fee in BDT. Free above FREE_SHIPPING_OVER. */
export const SHIPPING_FEE = 80;
export const FREE_SHIPPING_OVER = 5000;

/**
 * Payment collection numbers — read from env. When unset, checkout still
 * works: the customer places the order and the store follows up directly.
 * Never display a number that is not configured here.
 */
export function paymentNumber(method: string): string | null {
  switch (method) {
    case "bkash":
      return process.env.PAYMENT_BKASH_NUMBER || null;
    case "nagad":
      return process.env.PAYMENT_NAGAD_NUMBER || null;
    case "rocket":
      return process.env.PAYMENT_ROCKET_NUMBER || null;
    default:
      return null;
  }
}

export const CATEGORIES = [
  { slug: "electronics", label: "Electronics" },
  { slug: "fashion", label: "Fashion" },
  { slug: "accessories", label: "Accessories" },
  { slug: "home", label: "Home" },
] as const;

export function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}
