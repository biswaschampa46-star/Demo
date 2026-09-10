"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { StoreSettings } from "@/lib/settings";

export default function SettingsForm({ initial }: { initial: StoreSettings }) {
  const router = useRouter();
  const [v, setV] = useState<StoreSettings>(initial);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          deliveryFeeInside: String(v.deliveryFeeInside),
          deliveryFeeOutside: String(v.deliveryFeeOutside),
          bkashNumber: v.bkashNumber,
          nagadNumber: v.nagadNumber,
          rocketNumber: v.rocketNumber,
          tagline: v.tagline,
        }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (!data.ok) setError(data.message ?? "Save failed.");
      else {
        setSaved(true);
        router.refresh();
      }
    } catch {
      setError("Save failed.");
    } finally {
      setBusy(false);
    }
  };

  const inputCls = "mt-2 w-full rounded-lg border border-line bg-transparent px-4 py-2.5 text-sm text-foam focus:border-soft/60 focus:outline-none";

  return (
    <form onSubmit={submit} className="max-w-xl space-y-5">
      <div className="grid grid-cols-2 gap-5">
        <label className="block text-xs uppercase tracking-[0.18em] text-mist">
          Delivery fee — inside Chittagong (৳, prepaid)
          <input type="number" min={0} value={v.deliveryFeeInside} onChange={(e) => setV({ ...v, deliveryFeeInside: Number(e.target.value) })} className={inputCls} />
        </label>
        <label className="block text-xs uppercase tracking-[0.18em] text-mist">
          Delivery fee — outside Chittagong (৳, prepaid)
          <input type="number" min={0} value={v.deliveryFeeOutside} onChange={(e) => setV({ ...v, deliveryFeeOutside: Number(e.target.value) })} className={inputCls} />
        </label>
      </div>
      <p className="text-xs leading-relaxed text-mist/60">
        Products are paid <span className="text-foam">cash on delivery</span>. Only the delivery
        charge is paid in advance via bKash / Nagad / Rocket.
      </p>

      <label className="block text-xs uppercase tracking-[0.18em] text-mist">
        bKash number (shown to customers for the prepaid delivery charge)
        <input value={v.bkashNumber} onChange={(e) => setV({ ...v, bkashNumber: e.target.value })} placeholder="01XXXXXXXXX" className={inputCls} />
      </label>
      <label className="block text-xs uppercase tracking-[0.18em] text-mist">
        Nagad number
        <input value={v.nagadNumber} onChange={(e) => setV({ ...v, nagadNumber: e.target.value })} placeholder="01XXXXXXXXX" className={inputCls} />
      </label>
      <label className="block text-xs uppercase tracking-[0.18em] text-mist">
        Rocket number
        <input value={v.rocketNumber} onChange={(e) => setV({ ...v, rocketNumber: e.target.value })} placeholder="01XXXXXXXXX" className={inputCls} />
      </label>
      <label className="block text-xs uppercase tracking-[0.18em] text-mist">
        Tagline
        <input value={v.tagline} onChange={(e) => setV({ ...v, tagline: e.target.value })} className={inputCls} />
      </label>

      {error && <p className="text-sm text-accent">{error}</p>}
      {saved && <p className="text-sm text-foam">Settings saved.</p>}

      <button type="submit" disabled={busy} className="rounded-lg bg-white/10 px-6 py-3 text-sm font-semibold text-foam hover:bg-white/15 disabled:opacity-50">
        {busy ? "Saving…" : "Save settings"}
      </button>
    </form>
  );
}
