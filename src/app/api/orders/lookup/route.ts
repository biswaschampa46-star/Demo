import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { and, eq } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const number = (searchParams.get("number") ?? "").trim().toUpperCase();
    const phone = (searchParams.get("phone") ?? "").trim();

    if (!number || !phone) {
      return NextResponse.json(
        { ok: false, message: "Order number and phone number are required." },
        { status: 400 },
      );
    }

    const rows = await db
      .select({ id: orders.id })
      .from(orders)
      .where(and(eq(orders.orderNumber, number), eq(orders.phone, phone)))
      .limit(1);

    if (!rows[0]) {
      return NextResponse.json(
        { ok: false, message: "We could not find an order with those details." },
        { status: 404 },
      );
    }

    return NextResponse.json({ ok: true, orderId: rows[0].id });
  } catch {
    return NextResponse.json(
      { ok: false, message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
