"use client";

import Image from "next/image";
import { useUI } from "@/lib/store";

export default function AiChatTrigger() {
  const aiOpen = useUI((s) => s.aiOpen);
  const setAiOpen = useUI((s) => s.setAiOpen);

  return (
    <button
      type="button"
      onClick={() => setAiOpen(!aiOpen)}
      aria-label={aiOpen ? "Close AI assistant" : "Open AI assistant"}
      aria-expanded={aiOpen}
      className="group inline-flex shrink-0 items-center gap-3 self-center whitespace-nowrap rounded-full border border-soft/40 bg-[#071a2b]/80 py-1.5 pl-1.5 pr-5 shadow-[0_10px_30px_-8px_rgba(0,0,0,0.7)] backdrop-blur transition-transform duration-300 hover:scale-[1.03]"
    >
      <Image
        src="/images/ai.png"
        alt=""
        width={48}
        height={48}
        className="h-12 w-12 rounded-full object-cover"
      />
      <span className="text-left leading-tight">
        <span className="block whitespace-nowrap font-display text-[0.7rem] font-bold tracking-[0.15em] text-foam">
          ASK MKR AI
        </span>
        <span className="block whitespace-nowrap text-[0.68rem] text-mist/70">
          {aiOpen ? "বন্ধ করুন" : "চ্যাট শুরু করুন"}
        </span>
      </span>
    </button>
  );
}
