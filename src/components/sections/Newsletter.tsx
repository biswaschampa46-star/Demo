"use client";

import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import Reveal from "@/components/Reveal";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setState("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (res.ok && data.ok) {
        setState("done");
        setMsg(data.message ?? "You're on the list.");
      } else {
        setState("error");
        setMsg(data.message ?? "Something went wrong. Please try again.");
      }
    } catch {
      setState("error");
      setMsg("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="relative py-24 md:py-36" aria-label="Newsletter">
      <div className="mx-auto max-w-[1400px] px-6 md:px-10">
        <div className="grid items-end gap-12 md:grid-cols-12">
          <Reveal className="md:col-span-7">
            <p className="label">Newsletter</p>
            <h2 className="display-2 mt-7 text-foam">
              Stay in
              <br />
              <span className="text-stroke">the loop.</span>
            </h2>
            <p className="body-lead mt-7 max-w-md">
              New arrivals, selected offers and product updates — sent rarely,
              written carefully.
            </p>
          </Reveal>

          <Reveal delay={130} className="md:col-span-5">
            {state === "done" ? (
              <div className="flex items-center gap-4 border-b border-line pb-6">
                <span className="grid h-9 w-9 place-items-center rounded-full border border-soft/40">
                  <Check className="h-4 w-4 text-soft" strokeWidth={1.5} />
                </span>
                <p className="text-sm text-ice">{msg}</p>
              </div>
            ) : (
              <form onSubmit={submit} noValidate={false}>
                <label htmlFor="newsletter-email" className="label sr-only">
                  Email address
                </label>
                <div className="flex items-center gap-4 border-b border-line pb-2 transition-colors focus-within:border-soft/60">
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="field-under !border-none flex-1 text-lg placeholder:text-mist/40"
                  />
                  <button
                    type="submit"
                    disabled={state === "sending"}
                    className="group inline-flex shrink-0 items-center gap-3 pb-3 text-xs uppercase tracking-[0.28em] text-soft transition-colors hover:text-ice disabled:opacity-50"
                  >
                    {state === "sending" ? "Sending" : "Subscribe"}
                    <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
                  </button>
                </div>
                {state === "error" && (
                  <p className="mt-4 text-sm text-amber-200/90">{msg}</p>
                )}
                <p className="mt-5 text-xs leading-relaxed text-mist/60">
                  No spam. Unsubscribe anytime.
                </p>
              </form>
            )}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
