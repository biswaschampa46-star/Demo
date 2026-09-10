import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, ORDER_STAGES } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin, unauthorized } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, ctx: Ctx) {
  if (!(await isAdmin())) return unauthorized();
  const { id } = await ctx.params;
  try {
    const body = (await request.json()) as { status?: string };
    const status = (body.status ?? "").trim();
    if (!(ORDER_STAGES as readonly string[]).includes(status) && status !== "cancelled") {
      return NextResponse.json({ ok: false, message: "Invalid status." }, { status: 400 });
    }
    await db.update(orders).set({ status: status as (typeof ORDER_STAGES)[number] | "cancelled" }).where(eq(orders.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("admin order update failed", err);
    return NextResponse.json({ ok: false, message: "Could not update the order." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, ctx: Ctx) {
  if (!(await isAdmin())) return unauthorized();
  const { id } = await ctx.params;
  try {
    await db.delete(orders).where(eq(orders.id, id));
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("admin order delete failed", err);
    return NextResponse.json({ ok: false, message: "Could not delete the order." }, { status: 500 });
  }
}
