import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { STORE } from "@/lib/config";
import Reveal from "./Reveal";

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "Facebook", href: "https://facebook.com" },
  { label: "Pinterest", href: "https://pinterest.com" },
];

export default function Footer() {
  return (
    <footer className="relative z-10 border-t border-line-soft">
      <div className="mx-auto max-w-[1400px] px-6 pb-10 pt-20 md:px-10 md:pt-28">
        {/* top row */}
        <div className="grid gap-14 md:grid-cols-12">
          <Reveal className="md:col-span-5">
            <Link href="/" className="font-display text-2xl font-extrabold tracking-[0.3em] text-foam">
              {STORE.name}
            </Link>
            <p className="body-lead mt-6 max-w-sm">
              {STORE.tagline} A small, considered catalogue â€” designed for everyday
              life, delivered across Bangladesh.
            </p>
            <div className="mt-8 flex gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  className="label link-line !text-mist hover:!text-ice"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </Reveal>

          <Reveal delay={90} className="md:col-span-3">
            <p className="label label--bright mb-6">Shop</p>
            <ul className="space-y-3.5 text-sm">
              <li><Link className="link-line text-mist hover:text-foam" href="/shop">All Products</Link></li>
              <li><Link className="link-line text-mist hover:text-foam" href="/shop?view=new">New Arrivals</Link></li>
            </ul>
          </Reveal>

          <Reveal delay={160} className="md:col-span-2">
            <p className="label label--bright mb-6">Company</p>
            <ul className="space-y-3.5 text-sm">
              <li><Link className="link-line text-mist hover:text-foam" href="/about">About</Link></li>
              <li><Link className="link-line text-mist hover:text-foam" href="/contact">Contact</Link></li>
              <li><Link className="link-line text-mist hover:text-foam" href="/faq">FAQ</Link></li>
              <li><Link className="link-line text-mist hover:text-foam" href="/track">Track Order</Link></li>
            </ul>
          </Reveal>

          <Reveal delay={230} className="md:col-span-2">
            <p className="label label--bright mb-6">Payment</p>
            <ul className="flex flex-wrap gap-2.5">
              {[
                { n: "bKash", logo: "/images/payments/bkash.png" },
                { n: "Nagad", logo: "/images/payments/nagad.png" },
                { n: "Rocket", logo: "/images/payments/rocket.png" },
              ].map((p) => (
                <li key={p.n} className="flex items-center gap-2.5 rounded-lg border border-line-soft bg-white/[0.04] px-3 py-2">
                  <span className="grid h-6 w-11 place-items-center rounded-md bg-white px-1.5">
                    <Image src={p.logo} alt={p.n} width={32} height={14} className="h-3.5 w-auto object-contain" />
                  </span>
                  <span className="text-xs text-mist">{p.n}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs leading-relaxed text-mist/60">
              Advance payment only. We do not offer cash on delivery.
            </p>
          </Reveal>
        </div>

        <div className="hairline-full mt-16 md:mt-24" />

        {/* bottom row */}
        <div className="mt-8 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <p className="text-xs tracking-wide text-mist/60">
            Â© {new Date().getFullYear()} {STORE.name} Â· {STORE.city}
          </p>
          <p className="label !text-mist/50">Less clutter. More space.</p>
          <Link
            href="/shop"
            className="group inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-soft hover:text-ice"
          >
            Explore the shop
            <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
