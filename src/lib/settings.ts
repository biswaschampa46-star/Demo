import { db } from "@/db";
import { settings } from "@/db/schema";

export type StoreSettings = {
  deliveryFeeInside: number; // inside Chittagong
  deliveryFeeOutside: number; // outside Chittagong
  bkashNumber: string;
  nagadNumber: string;
  rocketNumber: string;
  tagline: string;
};

export const DEFAULT_SETTINGS: StoreSettings = {
  deliveryFeeInside: 70,
  deliveryFeeOutside: 130,
  bkashNumber: "",
  nagadNumber: "",
  rocketNumber: "",
  tagline: "",
};

export async function getSettings(): Promise<StoreSettings> {
  try {
    const rows = await db.select().from(settings);
    const map = new Map(rows.map((r) => [r.key, r.value]));
    const num = (k: string, d: number) => {
      const v = Number(map.get(k));
      return Number.isFinite(v) && v >= 0 ? Math.floor(v) : d;
    };
    return {
      deliveryFeeInside: num("deliveryFeeInside", DEFAULT_SETTINGS.deliveryFeeInside),
      deliveryFeeOutside: num("deliveryFeeOutside", DEFAULT_SETTINGS.deliveryFeeOutside),
      bkashNumber: map.get("bkashNumber") ?? "",
      nagadNumber: map.get("nagadNumber") ?? "",
      rocketNumber: map.get("rocketNumber") ?? "",
      tagline: map.get("tagline") ?? "",
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(values: Record<string, string>): Promise<void> {
  for (const [key, value] of Object.entries(values)) {
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({
        target: settings.key,
        set: { value, updatedAt: new Date() },
      });
  }
}

/** True when the city string looks like Chittagong / Chattogram. */
export function isInsideChittagong(city: string): boolean {
  return /chittagong|chattogram|chatgaon|ctg/i.test(city.trim());
}

/** Delivery charge is prepaid; product payment is cash on delivery. */
export function deliveryFeeFor(city: string, s: StoreSettings): number {
  return isInsideChittagong(city) ? s.deliveryFeeInside : s.deliveryFeeOutside;
}

/** Payment number for a method: admin setting first, then env fallback. */
export async function getPaymentNumber(method: string): Promise<string | null> {
  const s = await getSettings();
  const fromSettings =
    method === "bkash" ? s.bkashNumber : method === "nagad" ? s.nagadNumber : method === "rocket" ? s.rocketNumber : "";
  if (fromSettings.trim()) return fromSettings.trim();
  const envMap: Record<string, string | null> = {
    bkash: process.env.PAYMENT_BKASH_NUMBER || null,
    nagad: process.env.PAYMENT_NAGAD_NUMBER || null,
    rocket: process.env.PAYMENT_ROCKET_NUMBER || null,
  };
  return envMap[method] ?? null;
}
