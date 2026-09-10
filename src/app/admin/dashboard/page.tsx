import type { Metadata } from "next";
import Link from "next/link";
import { db } from "@/db";
import { orders, products, subscribers, messages } from "@/db/schema";
import { desc, ne, sql } from "drizzle-orm";
import { bdt, stageLabel, formatDate } from "@/lib/format";
import AdminShell from "@/components/admin/AdminShell";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin — Dashboard", robots: { index: false } };

export default async function DashboardPage() {
  let revenue = 0;
  let orderCount = 0;
  let productCount = 0;
  let subscriberCount = 0;
  let messageCount = 0;
  let lowStock: { name: string; stock: number }[] = [];
  let recent: Awaited<ReturnType<typeof db.select>> extends never ? never[] : { id: string; orderNumber: string; customerName: string; total: number; status: string; createdAt: Date }[] = [];

  try {
    const [rev] = await db
      .select({ total: sql<number>`coalesce(sum(${orders.total}), 0)::int`, n: sql<number>`count(*)::int` })
      .from(orders)
      .where(ne(orders.status, "cancelled"));
    revenue = rev?.total ?? 0;
    orderCount = rev?.n ?? 0;
    const [p] = await db.select({ n: sql<number>`count(*)::int` }).from(products);
    productCount = p?.n ?? 0;
    const [s] = await db.select({ n: sql<number>`count(*)::int` }).from(subscribers);
    subscriberCount = s?.n ?? 0;
    const [m] = await db.select({ n: sql<number>`count(*)::int` }).from(messages);
    messageCount = m?.n ?? 0;
    lowStock = await db
      .select({ name: products.name, stock: products.stock })
      .from(products)
      .where(sql`${products.stock} <= 5`)
      .limit(5);
    recent = await db
      .select({ id: orders.id, orderNumber: orders.orderNumber, customerName: orders.customerName, total: orders.total, status: orders.status, createdAt: orders.createdAt })
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(10);
  } catch {
    /* db not reachable — render zeros */
  }

  const stats = [
    { label: "Revenue", value: bdt(revenue) },
    { label: "Orders", value: String(orderCount) },
    { label: "Products", value: String(productCount) },
    { label: "Subscribers", value: String(subscriberCount) },
    { label: "Messages", value: String(messageCount) },
  ];

  return (
    <AdminShell active="Dashboard">
      <h1 className="font-display text-2xl font-bold text-foam">Dashboard</h1>

      <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-line-soft p-5">
            <p className="text-xs uppercase tracking-[0.18em] text-mist">{s.label}</p>
            <p className="font-display mt-2 text-xl font-bold text-foam">{s.value}</p>
          </div>
        ))}
      </div>

      {lowStock.length > 0 && (
        <div className="mt-8 rounded-xl border border-accent/40 p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-accent">Low stock (≤ 5)</p>
          <ul className="mt-3 space-y-1.5 text-sm text-mist">
            {lowStock.map((p) => (
              <li key={p.name}>{p.name} — {p.stock} left</li>
            ))}
          </ul>
        </div>
      )}

      <h2 className="font-display mt-12 text-lg font-bold text-foam">Recent orders</h2>
      {recent.length === 0 ? (
        <p className="mt-4 text-sm text-mist">No orders yet.</p>
      ) : (
        <ul className="mt-4 divide-y divide-line-soft rounded-xl border border-line-soft">
          {recent.map((o) => (
            <li key={o.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 p-4 text-sm">
              <span className="font-display font-bold tracking-[0.1em] text-foam">{o.orderNumber}</span>
              <span className="text-mist">{o.customerName}</span>
              <span className="text-ice">{bdt(o.total)}</span>
              <span className="text-xs text-mist">{stageLabel(o.status)}</span>
              <span className="ml-auto text-xs text-mist">{formatDate(o.createdAt)}</span>
              <Link href="/admin/orders" className="text-xs uppercase tracking-[0.15em] text-soft hover:text-ice">
                Manage →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AdminShell>
  );
}
