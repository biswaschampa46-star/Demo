"use client";

import { useState } from "react";
import { ArrowRight, Check, Loader2, MapPin } from "lucide-react";
import Reveal from "@/components/Reveal";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("sending");
    setMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = (await res.json()) as { ok: boolean; message?: string };
      if (res.ok && data.ok) {
        setState("done");
        setMsg(data.message ?? "Message received.");
      } else {
        setState("error");
        setMsg(data.message ?? "Something went wrong. Please try again.");
      }
    } catch {
      setState("error");
      setMsg("Network error. Please try again.");
    }
  };

  return (
    <div className="mx-auto max-w-[1400px] px-6 pb-28 pt-36 md:px-10 md:pt-44">
      <div className="grid gap-16 md:grid-cols-12">
        <Reveal className="md:col-span-6">
          <p className="label">Contact</p>
          <h1 className="display-2 mt-6 text-foam">
            Say hello.
          </h1>
          <p className="body-lead mt-7 max-w-md">
            Questions about an order, a product, or a payment — write to us and
            a real person will reply.
          </p>
          <p className="mt-10 flex items-center gap-3 text-sm text-mist">
            <MapPin className="h-4 w-4 text-soft/70" strokeWidth={1.5} />
            Dhaka, Bangladesh
          </p>
          <p className="mt-4 text-sm text-mist/70">
            Include your order number for anything order-related — it helps us
            help you faster.
          </p>
        </Reveal>

        <Reveal delay={130} className="md:col-span-5 md:col-start-8">
          {state === "done" ? (
            <div className="card-glass flex flex-col items-start gap-6 rounded-2xl p-10">
              <span className="grid h-11 w-11 place-items-center rounded-full border border-soft/40">
                <Check className="h-5 w-5 text-soft" strokeWidth={1.5} />
              </span>
              <div>
                <p className="font-display text-lg font-bold uppercase tracking-[0.1em] text-foam">
                  Message sent
                </p>
                <p className="mt-3 text-sm leading-relaxed text-mist">{msg}</p>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="card-glass rounded-2xl p-8 md:p-10">
              <div className="space-y-6">
                <div>
                  <label htmlFor="ct-name" className="label mb-2.5 block !tracking-[0.2em]">Name *</label>
                  <input id="ct-name" required className="field" placeholder="Your name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label htmlFor="ct-email" className="label mb-2.5 block !tracking-[0.2em]">Email *</label>
                  <input id="ct-email" type="email" required className="field" placeholder="you@example.com" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
                </div>
                <div>
                  <label htmlFor="ct-msg" className="label mb-2.5 block !tracking-[0.2em]">Message *</label>
                  <textarea id="ct-msg" required rows={5} className="field resize-none" placeholder="How can we help?" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
                </div>
              </div>
              {state === "error" && <p className="mt-5 text-sm text-amber-200/90">{msg}</p>}
              <button type="submit" disabled={state === "sending"} className="btn btn-solid mt-8 w-full">
                {state === "sending" ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                ) : (
                  <>Send Message <ArrowRight className="btn-arrow h-3.5 w-3.5" /></>
                )}
              </button>
            </form>
          )}
        </Reveal>
      </div>
    </div>
  );
}
