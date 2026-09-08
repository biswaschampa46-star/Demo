import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, products, type OrderItem } from "@/db/schema";
import { inArray } from "drizzle-orm";
import { SHIPPING_FEE, FREE_SHIPPING_OVER } from "@/lib/config";
import { randomInt } from "crypto";

const METHODS = new Set(["bkash", "nagad", "rocket"]);

type IncomingItem = { productId?: string; variant?: string; qty?: number };

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      name?: string;
      phone?: string;
      email?: string;
      address?: string;
      city?: string;
      notes?: string;
      method?: string;
      senderNumber?: string;
      transactionId?: string;
      items?: IncomingItem[];
    };

    const name = (body.name ?? "").trim();
    const phone = (body.phone ?? "").trim();
    const email = (body.email ?? "").trim();
    const address = (body.address ?? "").trim();
    const city = (body.city ?? "").trim();
    const notes = (body.notes ?? "").trim();
    const method = (body.method ?? "").trim().toLowerCase();
    const senderNumber = (body.senderNumber ?? "").trim();
    const transactionId = (body.transactionId ?? "").trim();
    const items = Array.isArray(body.items) ? body.items : [];

    /* ——— validation ——— */
    if (name.length < 2) return fail("Please enter your full name.");
    if (!/^[0-9+\-\s()]{6,18}$/.test(phone)) return fail("Please enter a valid phone number.");
    if (address.length < 4) return fail("Please enter your delivery address.");
    if (city.length < 2) return fail("Please enter your city.");
    if (!METHODS.has(method)) {
      return fail("Please choose a payment method: bKash, Nagad or Rocket.");
    }
    if (items.length === 0) return fail("Your cart is empty.");

    const ids = items
      .map((i) => i.productId)
      .filter((v): v is string => typeof v === "string" && v.length > 8);
    if (ids.length === 0) return fail("Your cart looks out of date. Please refresh and try again.");

    /* ——— recompute everything server-side. Never trust client prices. ——— */
    const dbProducts = await db.select().from(products).where(inArray(products.id, ids));
    const byId = new Map(dbProducts.map((p) => [p.id, p]));

    const orderItems: OrderItem[] = [];
    for (const item of items) {
      if (!item.productId) continue;
      const p = byId.get(item.productId);
      if (!p) {
        return fail(`"${item.productId.slice(0, 8)}…" is no longer available.`);
      }
      const qty = Math.max(1, Math.min(Math.floor(Number(item.qty) || 1), 99));
      const variant = (item.variant ?? "").slice(0, 80) || "Standard";
      orderItems.push({
        productId: p.id,
        slug: p.slug,
        name: p.name,
        image: p.image,
        variant,
        price: p.price,
        qty,
      });
    }

    if (orderItems.length === 0) return fail("Your cart is empty.");

    const subtotal = orderItems.reduce((n, i) => n + i.price * i.qty, 0);
    const shippingFee = subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
    const total = subtotal + shippingFee;

    const orderNumber = `EV-${String(randomInt(100000, 999999))}`;

    const [created] = await db
      .insert(orders)
      .values({
        orderNumber,
        customerName: name.slice(0, 120),
        phone: phone.slice(0, 20),
        email: email ? email.slice(0, 160) : null,
        address,
        city: city.slice(0, 80),
        notes: notes || null,
        paymentMethod: method,
        senderNumber: senderNumber || null,
        transactionId: transactionId || null,
        subtotal,
        shippingFee,
        total,
        items: orderItems,
        status: "pending_payment", // payments are verified only by the store team
      })
      .returning({ id: orders.id, orderNumber: orders.orderNumber });

    return NextResponse.json({
      ok: true,
      orderId: created.id,
      orderNumber: created.orderNumber,
      total,
    });
  } catch (err) {
    console.error("checkout failed", err);
    return NextResponse.json(
      { ok: false, message: "We could not place your order. Please try again." },
      { status: 500 },
    );
  }
}

function fail(message: string) {
  return NextResponse.json({ ok: false, message }, { status: 400 });
}
