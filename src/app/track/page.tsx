"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, Loader2, PackageSearch } from "lucide-react";

export default function TrackPage() {
  const [number, setNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [state, setState] = useState<"idle" | "searching">("idle");
  const [error, setError] = useState("");
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setState("searching");
    try {
      const res = await fetch(
        `/api/orders/lookup?number=${encodeURIComponent(number)}&phone=${encodeURIComponent(phone)}`,
      );
      const data = (await res.json()) as { ok: boolean; orderId?: string; message?: string };
      if (res.ok && data.ok && data.orderId) {
        router.push(`/order/${data.orderId}`);
        return;
      }
      setError(data.message ?? "We could not find that order.");
      setState("idle");
    } catch {
      setError("Network error. Please try again.");
      setState("idle");
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-28 pt-36 md:px-10 md:pt-44">
      <div className="grid gap-14 md:grid-cols-12">
        <div className="md:col-span-6">
          <p className="label">Track Order</p>
          <h1 className="display-2 mt-6 text-foam">
            Where is
            <br />
            <span className="text-stroke">my order?</span>
          </h1>
          <p className="body-lead mt-7 max-w-md">
            Enter your order number and the phone number used at checkout to
            follow your order, step by step.
          </p>
        </div>

        <div className="md:col-span-5 md:col-start-8">
          <form onSubmit={submit} className="card-glass rounded-2xl p-8 md:p-10">
            <PackageSearch className="h-7 w-7 text-soft/70" strokeWidth={1.2} />
            <div className="mt-8 space-y-6">
              <div>
                <label htmlFor="track-number" className="label mb-2.5 block !tracking-[0.2em]">
                  Order number
                </label>
                <input
                  id="track-number"
                  required
                  className="field"
                  placeholder="EV-123456"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="track-phone" className="label mb-2.5 block !tracking-[0.2em]">
                  Phone number
                </label>
                <input
                  id="track-phone"
                  required
                  inputMode="tel"
                  className="field"
                  placeholder="01XXXXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </div>

            {error && <p className="mt-5 text-sm text-amber-200/90">{error}</p>}

            <button type="submit" disabled={state === "searching"} className="btn btn-solid mt-8 w-full">
              {state === "searching" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Searching…
                </>
              ) : (
                <>
                  Find my order <ArrowRight className="btn-arrow h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
