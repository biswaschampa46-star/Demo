"use client";

import { useEffect, useRef, useState } from "react";

const BASE_SPEED = 16; // ms per character

/**
 * Elegant, scroll-driven typewriter for the product description.
 * - Starts when the block scrolls into view; pauses if the reader scrolls
 *   the block out of view and resumes when they return.
 * - Never re-types once complete.
 * - Renders instantly when the user prefers reduced motion; the full text is
 *   always exposed to assistive tech via a visually-hidden duplicate.
 */
export default function TypewriterDescription({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement | null>(null);
  const [shown, setShown] = useState(0);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(text.length);
      setActive(false);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setActive(e.isIntersecting);
      },
      { threshold: 0.18, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [text]);

  const speed = text.length > 420 ? 9 : BASE_SPEED;
  const done = shown >= text.length;

  useEffect(() => {
    if (!active || done) return;
    const t = window.setTimeout(
      () => setShown((s) => Math.min(text.length, s + 1)),
      speed,
    );
    return () => window.clearTimeout(t);
  }, [active, shown, text, speed, done]);

  return (
    <p ref={ref} className={`body-lead ${className}`}>
      <span aria-hidden="true">
        {text.slice(0, shown)}
        {!done && <span className="type-caret" aria-hidden="true" />}
      </span>
      <span className="sr-only">{text}</span>
    </p>
  );
}