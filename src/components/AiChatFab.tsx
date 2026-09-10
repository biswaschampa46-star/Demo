"use client";

import Image from "next/image";
import { X } from "lucide-react";
import { useUI } from "@/lib/store";

/** Floating site-wide AI toggle: bottom-right corner, above the chat panel. */
export default function AiChatFab() {
  const aiOpen = useUI((s) => s.aiOpen);
  const setAiOpen = useUI((s) => s.setAiOpen);

  return (
    <button
      type="button"
      onClick={() => setAiOpen(!aiOpen)}
      aria-label={aiOpen ? "Close AI assistant" : "Open AI assistant"}
      aria-expanded={aiOpen}
      title={aiOpen ? "Close MKR AI" : "Ask MKR AI"}
      className={`fixed bottom-6 right-6 z-[76] grid h-14 w-14 place-items-center rounded-full border border-soft/40 bg-[#071a2b]/90 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.7)] backdrop-blur transition-all duration-300 hover:scale-[1.06] ${
        aiOpen ? "rotate-90" : "rotate-0"
      }`}
    >
      {aiOpen ? (
        <X className="h-5 w-5 text-ice" strokeWidth={1.5} />
      ) : (
        <Image src="/images/ai.png" alt="" width={40} height={40} className="h-10 w-10 rounded-full object-contain" />
      )}
    </button>
  );
}
