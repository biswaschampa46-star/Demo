"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { bdt, stageLabel, methodLabel, formatDate } from "@/lib/format";
import type { Order, OrderItem } from "@/db/schema";

const STATUSES = [
  "pending_payment",
  "payment_verified",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

export default function OrdersManager({ orders }: { orders: Order[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState("all");
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      orders.filter(
        (o) =>
          (filter === "all" || o.status === filter) &&
          (o.orderNumber.toLowerCase().includes(q.trim().toLowerCase()) ||
            o.customerName.toLowerCase().includes(q.trim().toLowerCase()) ||
            o.phone.includes(q.trim())),
      ),
    [orders, filter, q],
  );

  const setStatus = async (id: string, status: string) => {
    setBusyId(id);
    await fetch(`/api/admin/orders/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
    setBusyId(null);
    router.refresh();
  };

  const remove = async (id: string, num: string) => {
    if (!confirm(`Delete order ${num}? This cannot be undone.`)) return;
    setBusyId(id);
    await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  };

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search order #, name, phone…"
          className="w-64 rounded-lg border border-line bg-transparent px-4 py-2.5 text-sm text-foam placeholder:text-mist/40 focus:border-soft/60 focus:outline-none"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-line bg-[#061626] px-3 py-2.5 text-sm text-foam focus:outline-none"
        >
          <option value="all">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {stageLabel(s)}
            </option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <p className="py-12 text-center text-sm text-mist">No orders found.</p>
      ) : (
        <ul className="space-y-4">
          {filtered.map((o) => (
            <li key={o.id} className="rounded-xl border border-line-soft p-5">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
                <div className="min-w-40">
                  <p className="font-display text-sm font-bold tracking-[0.1em] text-foam">{o.orderNumber}</p>
                  <p className="mt-1 text-xs text-mist">{formatDate(o.createdAt)}</p>
                </div>
                <div className="min-w-44">
                  <p className="text-sm text-foam">{o.customerName}</p>
                  <p className="mt-1 text-xs text-mist">{o.phone} · {o.city}</p>
                </div>
                <div className="min-w-32">
                  <p className="text-sm text-ice">{bdt(o.total)}</p>
                  <p className="mt-1 text-xs text-mist">{methodLabel(o.paymentMethod)}{o.transactionId ? ` · ${o.transactionId}` : ""}</p>
                </div>
                <select
                  value={o.status}
                  disabled={busyId === o.id}
                  onChange={(e) => setStatus(o.id, e.target.value)}
                  className="rounded-lg border border-line bg-[#061626] px-3 py-2 text-xs text-foam focus:outline-none disabled:opacity-50"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {stageLabel(s)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => remove(o.id, o.orderNumber)}
                  disabled={busyId === o.id}
                  className="rounded-lg border border-accent/40 px-3 py-1.5 text-xs text-accent hover:bg-accent/10 disabled:opacity-50"
                >
                  Delete
                </button>
              </div>

              <details className="mt-4">
                <summary className="cursor-pointer text-xs uppercase tracking-[0.18em] text-mist hover:text-foam">
                  Items & address
                </summary>
                <ul className="mt-4 space-y-3">
                  {o.items.map((item: OrderItem) => (
                    <li key={`${item.productId}-${item.variant}`} className="flex items-center gap-4">
                      <div className="relative h-14 w-12 shrink-0 overflow-hidden rounded-md bg-white/5">
                        <Image src={item.image} alt="" fill sizes="48px" className="object-cover" />
                      </div>
                      <p className="flex-1 text-sm text-foam">
                        {item.name} <span className="text-mist">· {item.variant} × {item.qty}</span>
                      </p>
                      <p className="text-sm text-ice">{bdt(item.price * item.qty)}</p>
                    </li>
                  ))}
                </ul>
                <p className="mt-4 border-t border-line-soft pt-3 text-xs leading-relaxed text-mist">
                  {o.customerName} · {o.phone} · {o.address}, {o.city}
                  {o.notes ? ` — Note: ${o.notes}` : ""}
                  {o.senderNumber ? ` — Sender: ${o.senderNumber}` : ""}
                </p>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
