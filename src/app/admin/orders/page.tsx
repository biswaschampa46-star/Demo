import type { Metadata } from "next";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { desc } from "drizzle-orm";
import AdminShell from "@/components/admin/AdminShell";
import OrdersManager from "@/components/admin/OrdersManager";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — Orders", robots: { index: false } };

export default async function AdminOrdersPage() {
  let list: Awaited<ReturnType<typeof loadOrders>> = [];
  try {
    list = await loadOrders();
  } catch {
    list = [];
  }
  return (
    <AdminShell active="Orders">
      <h1 className="font-display mb-8 text-2xl font-bold text-foam">Orders</h1>
      <OrdersManager orders={list} />
    </AdminShell>
  );
}

function loadOrders() {
  return db.select().from(orders).orderBy(desc(orders.createdAt));
}
