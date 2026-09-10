import Link from "next/link";
import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/auth";
import LogoutButton from "./LogoutButton";

const LINKS = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/products", label: "Products" },
  { href: "/admin/orders", label: "Orders" },
  { href: "/admin/reviews", label: "Reviews" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/subscribers", label: "Subscribers" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminShell({
  children,
  active,
}: {
  children: React.ReactNode;
  active: string;
}) {
  if (!(await isAdmin())) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-[#04101c] text-mist">
      {/* sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-line-soft bg-[#061626] p-6 md:flex">
        <p className="font-display text-sm font-extrabold tracking-[0.28em] text-foam">MKR ADMIN</p>
        <nav className="mt-10 flex flex-col gap-1" aria-label="Admin">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active === l.label ? "page" : undefined}
              className={`rounded-lg px-4 py-2.5 text-sm transition-colors ${
                active === l.label ? "bg-white/10 font-semibold text-foam" : "text-mist/80 hover:bg-white/5 hover:text-foam"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto flex flex-col gap-3 pt-8">
          <Link href="/" className="text-xs uppercase tracking-[0.2em] text-soft hover:text-ice">
            ← View store
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* main */}
      <div className="min-w-0 flex-1">
        {/* mobile nav */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto border-b border-line-soft bg-[#061626] px-4 py-3 md:hidden">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`whitespace-nowrap rounded-full px-3 py-1.5 text-xs ${
                active === l.label ? "bg-white/10 font-semibold text-foam" : "text-mist/80"
              }`}
            >
              {l.label}
            </Link>
          ))}
          <LogoutButton compact />
        </div>
        <main className="mx-auto max-w-6xl p-6 md:p-10">{children}</main>
      </div>
    </div>
  );
}
