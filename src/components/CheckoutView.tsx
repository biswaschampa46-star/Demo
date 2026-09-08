"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ShoppingBag, Smartphone, Loader2 } from "lucide-react";
import { useCart, useCartTotals, useHydrated } from "@/lib/store";
import { bdt } from "@/lib/format";
import { FREE_SHIPPING_OVER, SHIPPING_FEE } from "@/lib/config";

const METHODS = [
  { id: "bkash", label: "bKash", hint: "Send Money from your bKash app" },
  { id: "nagad", label: "Nagad", hint: "Send Money from your Nagad app" },
  { id: "rocket", label: "Rocket", hint: "Send Money from your Rocket app" },
];

type Fields = {
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  notes: string;
  senderNumber: string;
  transactionId: string;
};

export default function CheckoutView() {
  const hydrated = useHydrated();
  const { items, subtotal } = useCartTotals();
  const clear = useCart((s) => s.clear);
  const router = useRouter();

  const [fields, setFields] = useState<Fields>({
    name: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    notes: "",
    senderNumber: "",
    transactionId: "",
  });
  const [method, setMethod] = useState("bkash");
  const [state, setState] = useState<"idle" | "placing">("idle");
  const [error, setError] = useState("");

  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_OVER ? 0 : SHIPPING_FEE;
  const total = subtotal + shipping;

  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setState("placing");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...fields,
          method,
          items: items.map((i) => ({ productId: i.productId, variant: i.variant, qty: i.qty })),
        }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string; orderId?: string };
      if (!res.ok || !data.ok || !data.orderId) {
        setError(data.message ?? "We could not place your order. Please try again.");
        setState("idle");
        return;
      }
      clear();
      router.push(`/order/${data.orderId}?placed=1`);
    } catch {
      setError("Network error. Please check your connection and try again.");
      setState("idle");
    }
  };

  /* ——— empty cart state (post-hydration) ——— */
  if (hydrated && items.length === 0) {
    return (
      <div className="mx-auto flex max-w-[1400px] flex-col items-center gap-7 px-6 pb-32 pt-48 text-center md:px-10">
        <ShoppingBag className="h-9 w-9 text-mist/40" strokeWidth={1} />
        <div>
          <p className="font-display text-xl font-bold uppercase tracking-[0.14em] text-foam">
            Your cart is empty
          </p>
          <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-mist">
            Add something to your cart before checking out.
          </p>
        </div>
        <Link href="/shop" className="btn btn-solid">
          Explore Shop <ArrowRight className="btn-arrow h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-28 pt-36 md:px-10 md:pt-44">
      <header className="mb-14 md:mb-20">
        <p className="label">Almost There</p>
        <h1 className="display-2 mt-6 text-foam">Checkout</h1>
        <p className="mt-5 max-w-md text-sm leading-relaxed text-mist">
          Orders are paid in advance with bKash, Nagad or Rocket.
        </p>
      </header>

      <form onSubmit={submit} className="grid gap-16 lg:grid-cols-12">
        {/* ——— form column ——— */}
        <div className="space-y-12 lg:col-span-7">
          {/* contact */}
          <fieldset>
            <legend className="font-display mb-7 text-xs font-semibold uppercase tracking-[0.28em] text-foam">
              01 · Contact
            </legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="co-name" className="label mb-2.5 block !tracking-[0.2em]">Full name *</label>
                <input id="co-name" required autoComplete="name" className="field" placeholder="Your name" value={fields.name} onChange={set("name")} />
              </div>
              <div>
                <label htmlFor="co-phone" className="label mb-2.5 block !tracking-[0.2em]">Phone *</label>
                <input id="co-phone" required autoComplete="tel" inputMode="tel" className="field" placeholder="01XXXXXXXXX" value={fields.phone} onChange={set("phone")} />
              </div>
              <div>
                <label htmlFor="co-email" className="label mb-2.5 block !tracking-[0.2em]">Email <span className="normal-case tracking-normal text-mist/50">(optional)</span></label>
                <input id="co-email" type="email" autoComplete="email" className="field" placeholder="you@example.com" value={fields.email} onChange={set("email")} />
              </div>
            </div>
          </fieldset>

          {/* delivery */}
          <fieldset>
            <legend className="font-display mb-7 text-xs font-semibold uppercase tracking-[0.28em] text-foam">
              02 · Delivery
            </legend>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="co-address" className="label mb-2.5 block !tracking-[0.2em]">Address *</label>
                <input id="co-address" required autoComplete="street-address" className="field" placeholder="House, road, area" value={fields.address} onChange={set("address")} />
              </div>
              <div>
                <label htmlFor="co-city" className="label mb-2.5 block !tracking-[0.2em]">City *</label>
                <input id="co-city" required autoComplete="address-level2" className="field" placeholder="Dhaka" value={fields.city} onChange={set("city")} />
              </div>
              <div>
                <label htmlFor="co-notes" className="label mb-2.5 block !tracking-[0.2em]">Notes <span className="normal-case tracking-normal text-mist/50">(optional)</span></label>
                <input id="co-notes" className="field" placeholder="Anything we should know" value={fields.notes} onChange={set("notes")} />
              </div>
            </div>
          </fieldset>

          {/* payment */}
          <fieldset>
            <legend className="font-display mb-7 text-xs font-semibold uppercase tracking-[0.28em] text-foam">
              03 · Payment
            </legend>
            <div className="grid gap-3 sm:grid-cols-3" role="radiogroup" aria-label="Payment method">
              {METHODS.map((m) => {
                const active = method === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => setMethod(m.id)}
                    className={`rounded-2xl border p-5 text-left transition-all duration-300 ${
                      active
                        ? "border-soft/70 bg-soft/10"
                        : "border-line hover:border-soft/40"
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <span className={`font-display text-sm font-bold tracking-[0.08em] ${active ? "text-ice" : "text-foam"}`}>
                        {m.label}
                      </span>
                      <span className={`grid h-5 w-5 place-items-center rounded-full border ${active ? "border-soft" : "border-line"}`}>
                        {active && <span className="h-2 w-2 rounded-full bg-soft" />}
                      </span>
                    </span>
                    <span className="mt-3 block text-[0.72rem] leading-relaxed text-mist/80">{m.hint}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="co-sender" className="label mb-2.5 block !tracking-[0.2em]">
                  Your {METHODS.find((m) => m.id === method)?.label} number <span className="normal-case tracking-normal text-mist/50">(if paid)</span>
                </label>
                <input id="co-sender" inputMode="tel" className="field" placeholder="01XXXXXXXXX" value={fields.senderNumber} onChange={set("senderNumber")} />
              </div>
              <div>
                <label htmlFor="co-trx" className="label mb-2.5 block !tracking-[0.2em]">
                  Transaction ID <span className="normal-case tracking-normal text-mist/50">(if paid)</span>
                </label>
                <input id="co-trx" className="field" placeholder="e.g. 9HXK2…" value={fields.transactionId} onChange={set("transactionId")} />
              </div>
            </div>

            <p className="mt-6 flex gap-3 rounded-2xl border border-line-soft bg-deep/40 p-5 text-xs leading-relaxed text-mist">
              <Smartphone className="mt-0.5 h-4 w-4 shrink-0 text-soft/80" strokeWidth={1.5} />
              Place your order first — payment instructions for your chosen method
              appear on the order page. Your order is confirmed once the store
              verifies your payment.
            </p>
          </fieldset>
        </div>

        {/* ——— summary column ——— */}
        <aside className="lg:col-span-4 lg:col-start-9">
          <div className="card-glass rounded-2xl p-8 lg:sticky lg:top-28">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.28em] text-foam">
              Your Order
            </p>
            <ul className="mt-6 space-y-5">
              {items.map((i) => (
                <li key={i.key} className="flex items-center gap-4">
                  <div className="media-frame relative h-14 w-11 shrink-0">
                    <Image src={i.image} alt={i.name} fill sizes="44px" className="object-cover" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-display truncate text-[0.8rem] font-semibold uppercase tracking-[0.05em] text-foam">
                      {i.name}
                    </p>
                    <p className="mt-1 text-[0.72rem] text-mist/70">
                      {i.variant} · ×{i.qty}
                    </p>
                  </div>
                  <p className="text-sm text-ice">{bdt(i.price * i.qty)}</p>
                </li>
              ))}
            </ul>
            <dl className="mt-7 space-y-3.5 border-t border-line-soft pt-6 text-sm">
              <div className="flex justify-between">
                <dt className="text-mist">Subtotal</dt>
                <dd className="text-foam">{bdt(subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-mist">Delivery</dt>
                <dd className="text-foam">{shipping === 0 ? "Free" : bdt(shipping)}</dd>
              </div>
              <div className="flex items-baseline justify-between pt-2">
                <dt className="label">Total</dt>
                <dd className="font-display text-2xl font-bold text-ice">{bdt(total)}</dd>
              </div>
            </dl>

            {error && (
              <p className="mt-5 rounded-xl border border-amber-200/30 bg-amber-200/10 p-4 text-xs leading-relaxed text-amber-100/90">
                {error}
              </p>
            )}

            <button type="submit" disabled={state === "placing" || items.length === 0} className="btn btn-solid mt-7 w-full">
              {state === "placing" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Placing order…
                </>
              ) : (
                <>
                  Place Order <ArrowRight className="btn-arrow h-3.5 w-3.5" />
                </>
              )}
            </button>
            <p className="mt-5 text-center text-[0.7rem] leading-relaxed text-mist/60">
              Advance payment only · no cash on delivery
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}
