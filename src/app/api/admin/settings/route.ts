import { NextResponse } from "next/server";
import { isAdmin, unauthorized } from "@/lib/auth";
import { saveSettings } from "@/lib/settings";

const ALLOWED = new Set(["deliveryFeeInside", "deliveryFeeOutside", "bkashNumber", "nagadNumber", "rocketNumber", "tagline"]);

export async function PUT(request: Request) {
  if (!(await isAdmin())) return unauthorized();
  try {
    const body = (await request.json()) as Record<string, string>;
    const values: Record<string, string> = {};
    for (const [k, v] of Object.entries(body)) {
      if (ALLOWED.has(k)) values[k] = String(v).slice(0, 120);
    }
    await saveSettings(values);
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("admin settings save failed", err);
    return NextResponse.json({ ok: false, message: "Could not save settings." }, { status: 500 });
  }
}
