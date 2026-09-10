"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const logout = async () => {
    setBusy(true);
    await fetch("/api/admin/logout", { method: "POST" });
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <button
      type="button"
      onClick={logout}
      disabled={busy}
      className={`rounded-lg border border-line-soft text-xs uppercase tracking-[0.2em] text-mist transition-colors hover:border-white/30 hover:text-foam disabled:opacity-50 ${
        compact ? "px-3 py-1.5" : "px-4 py-2.5 text-left"
      }`}
    >
      {busy ? "…" : "Logout"}
    </button>
  );
}
