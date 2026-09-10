"use client";

import { useEffect, useRef, useState } from "react";
import { X, Check, Loader2 } from "lucide-react";
import StarRating from "@/components/StarRating";

type ReviewModalProps = {
  open: boolean;
  productId: string;
  productName: string;
  onClose: () => void;
};

export default function ReviewModal({
  open,
  productId,
  productName,
  onClose,
}: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  // lock body scroll + focus the dialog while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const submit = async () => {
    setError(null);
    if (rating < 1 || rating > 5) {
      setError("Please choose a star rating between 1 and 5.");
      return;
    }
    if (name.trim().length < 2) {
      setError("Please add your name.");
      return;
    }
    if (body.trim().length < 6) {
      setError("Please share a few words about your experience.");
      return;
    }
    try {
      setBusy(true);
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          productId,
          name: name.trim(),
          rating,
          review: body.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.message || "Could not save your review. Please try again.");
        return;
      }
      setSent(true);
      window.dispatchEvent(new CustomEvent("reviews:published"));
    } catch {
      setError("Could not save your review. Please check your connection and try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 md:p-6"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* scrim */}
      <div className="scrim absolute inset-0 bg-abyss/80 backdrop-blur-sm" aria-hidden="true" />

      <div
        ref={dialogRef}
        role="document"
        className="review-modal-panel relative w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-deep/95 shadow-2xl"
      >
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close review form"
          className="absolute right-4 top-4 grid h-9 w-9 place-items-center rounded-full border border-line text-mist transition-colors hover:bg-white/5 hover:text-foam"
        >
          <X className="h-4 w-4" />
        </button>

        {sent ? (
          <div className="px-7 py-10 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-soft/10 text-soft">
              <Check className="h-7 w-7" strokeWidth={1.6} />
            </div>
            <h2 className="font-display mt-6 text-lg font-bold uppercase tracking-[0.06em] text-foam">
              Thanks for sharing your experience
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-mist">
              Your review for {productName} has been added. It may take a moment to show up.
            </p>
            <button type="button" onClick={onClose} className="btn btn-line mt-8">
              Close
            </button>
          </div>
        ) : (
          <div className="px-7 py-9">
            <h2 id="review-modal-title" className="display-3 text-foam">
              Write a review
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-mist/85">
              {productName}
            </p>

            <div className="mt-7">
              <p className="label">Your rating</p>
              <div className="mt-3">
                <StarRating value={rating} onChange={setRating} size={26} label="Your rating" />
              </div>
            </div>

            <label className="mt-6 block">
              <span className="label">Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={120}
                autoComplete="name"
                placeholder="How should we address you?"
                className="field mt-2"
              />
            </label>

            <label className="mt-4 block">
              <span className="label">Your review</span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={1500}
                rows={4}
                placeholder="What did you like about it? How are the quality and fit?"
                className="field mt-2 resize-none"
              />
              <span className="mt-1.5 block text-right text-[0.7rem] text-mist/60">
                {body.length}/1500
              </span>
            </label>

            <div className="mt-5 rounded-xl border border-line-soft bg-white/[0.03] p-3.5 text-xs leading-relaxed text-mist/80">
              <strong className="text-soft">Verified purchase?</strong> Add the phone
              number you used on an order for this item (optional) — we’ll check it
              against past orders and mark your review as verified if it matches.
            </div>

            <label className="mt-3 block">
              <span className="label">Phone (optional — for verification)</span>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                maxLength={24}
                inputMode="tel"
                autoComplete="tel"
                placeholder="01XXXXXXXXX"
                className="field-under mt-1.5"
              />
            </label>

            <label className="mt-3 block">
              <span className="label">Email (optional — for order updates)</span>
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                maxLength={160}
                inputMode="email"
                autoComplete="email"
                type="email"
                placeholder="you@example.com"
                className="field-under mt-1.5"
              />
            </label>

            {error && (
              <p role="alert" className="mt-5 flex items-center gap-2 text-sm text-accent/90">
                <span aria-hidden="true" className="grid h-5 w-5 place-items-center rounded-full border border-accent/50 text-xs">
                  !
                </span>
                {error}
              </p>
            )}

            <button
              type="button"
              onClick={submit}
              disabled={busy}
              className="btn btn-solid mt-6 w-full"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Submitting…
                </>
              ) : (
                "Submit review"
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}