/** Bangladeshi Taka — ৳1,299 / ৳12,999 grouped in the local style. */
export function bdt(amount: number): string {
  return `৳${new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(amount)}`;
}

export function discountPct(price: number, compareAt: number | null): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

export function stageLabel(stage: string): string {
  switch (stage) {
    case "pending_payment": return "Pending Payment";
    case "payment_verified": return "Payment Verified";
    case "confirmed": return "Confirmed";
    case "processing": return "Processing";
    case "shipped": return "Shipped";
    case "delivered": return "Delivered";
    case "cancelled": return "Cancelled";
    default: return stage;
  }
}

export function methodLabel(method: string): string {
  switch (method) {
    case "bkash": return "bKash";
    case "nagad": return "Nagad";
    case "rocket": return "Rocket";
    default: return method;
  }
}

export function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
