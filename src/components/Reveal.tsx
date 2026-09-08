"use client";

import {
  useEffect,
  useRef,
  type ReactNode,
  type CSSProperties,
  type ElementType,
} from "react";

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  as?: ElementType;
};

/**
 * Scroll-triggered reveal: blur → sharp, opacity → visible, gentle rise.
 * Honours prefers-reduced-motion (renders instantly).
 */
export default function Reveal({ children, className = "", delay = 0, as }: Props) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("rv-in");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            el.classList.add("rv-in");
            io.disconnect();
          }
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const Tag = (as ?? "div") as ElementType;

  return (
    <Tag
      ref={ref}
      className={`rv ${className}`}
      style={{ "--rd": `${delay}ms` } as CSSProperties}
    >
      {children}
    </Tag>
  );
}
