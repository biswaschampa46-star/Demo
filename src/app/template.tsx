import type { ReactNode } from "react";

/** Subtle page transition: soft blur + small rise on every navigation. */
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
