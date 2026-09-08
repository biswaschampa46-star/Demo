"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, ShoppingBag, Menu, X } from "lucide-react";
import { useUI, useCartTotals } from "@/lib/store";

const LINKS = [
  { href: "/collections", label: "Collections" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const MENU_LINKS = [
  { href: "/shop", label: "Shop All" },
  { href: "/shop?view=new", label: "New Arrivals" },
  { href: "/collections", label: "Collections" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
  { href: "/faq", label: "FAQ" },
  { href: "/track", label: "Track Order" },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { count } = useCartTotals();
  const { menuOpen, setMenuOpen, setCartOpen, setSearchOpen } = useUI();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* lock body scroll while the overlay menu is open */
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  useEffect(() => setMenuOpen(false), [pathname, setMenuOpen]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setMenuOpen]);

  return (
    <>
      <header className={`nav-shell fixed inset-x-0 top-0 z-50 ${scrolled ? "nav-scrolled" : ""}`}>
        <nav
          aria-label="Primary"
          className="mx-auto flex h-[4.75rem] max-w-[1400px] items-center justify-between px-6 md:px-10"
        >
          <Link
            href="/"
            className="font-display text-lg font-extrabold tracking-[0.32em] text-foam"
            aria-label="EVERE — home"
          >
            EVERE
          </Link>

          {/* desktop links */}
          <div className="hidden items-center gap-9 md:flex">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                aria-current={pathname === l.href ? "page" : undefined}
                className="link-line label !text-mist transition-colors duration-300 hover:!text-ice"
              >
                {l.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1.5 md:gap-3">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search"
              className="grid h-10 w-10 place-items-center rounded-full text-mist transition-colors duration-300 hover:bg-white/5 hover:text-ice"
            >
              <Search className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.5} />
            </button>

            <button
              type="button"
              onClick={() => setCartOpen(true)}
              aria-label={`Open cart, ${count} item${count === 1 ? "" : "s"}`}
              className="relative grid h-10 w-10 place-items-center rounded-full text-mist transition-colors duration-300 hover:bg-white/5 hover:text-ice"
            >
              <ShoppingBag className="h-[1.1rem] w-[1.1rem]" strokeWidth={1.5} />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-[1.05rem] min-w-[1.05rem] place-items-center rounded-full bg-ice px-1 text-[0.6rem] font-bold text-abyss">
                  {count}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              className="grid h-10 w-10 place-items-center rounded-full text-mist transition-colors duration-300 hover:bg-white/5 hover:text-ice md:hidden"
            >
              <Menu className="h-[1.2rem] w-[1.2rem]" strokeWidth={1.5} />
            </button>
          </div>
        </nav>
      </header>

      {/* ——— mobile editorial overlay menu ——— */}
      <div
        className={`fixed inset-0 z-[60] md:hidden ${menuOpen ? "menu-open" : "pointer-events-none"}`}
        aria-hidden={!menuOpen}
      >
        <div
          className={`scrim absolute inset-0 bg-[rgba(5,16,27,0.6)] backdrop-blur-sm ${menuOpen ? "opacity-100" : "opacity-0"}`}
          onClick={() => setMenuOpen(false)}
        />
        <div
          className={`drawer absolute inset-0 flex flex-col bg-[rgba(7,26,43,0.92)] backdrop-blur-2xl ${
            menuOpen ? "translate-y-0" : "-translate-y-full"
          }`}
        >
          <div className="flex h-[4.75rem] items-center justify-between px-6">
            <span className="font-display text-lg font-extrabold tracking-[0.32em] text-foam">EVERE</span>
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
              className="grid h-10 w-10 place-items-center rounded-full text-mist hover:text-ice"
            >
              <X className="h-5 w-5" strokeWidth={1.5} />
            </button>
          </div>

          <nav aria-label="Mobile" className="flex flex-1 flex-col justify-center gap-2 px-8">
            {MENU_LINKS.map((l, i) => (
              <div key={l.href} className="menu-item" style={{ "--d": `${120 + i * 70}ms` } as CSSProperties}>
                <Link
                  href={l.href}
                  className="font-display block py-2 text-[2rem] font-bold uppercase leading-tight tracking-tight text-foam/90 transition-colors duration-300 hover:text-ice"
                >
                  {l.label}
                </Link>
              </div>
            ))}
          </nav>

          <div className="menu-item px-8 pb-10" style={{ "--d": "640ms" } as CSSProperties}>
            <div className="hairline-full mb-6" />
            <p className="label !text-mist/60">bKash · Nagad · Rocket</p>
            <p className="mt-3 text-sm text-mist/70">Everyday objects, elevated.</p>
          </div>
        </div>
      </div>
    </>
  );
}
