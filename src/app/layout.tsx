import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import Background from "@/components/Background";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import CartDrawer from "@/components/CartDrawer";
import SearchOverlay from "@/components/SearchOverlay";

export const metadata: Metadata = {
  title: {
    default: "Mkr Casual — Everyday objects, elevated.",
    template: "%s — Mkr Casual",
  },
  description:
    "A small, considered catalogue of everyday objects. Premium essentials, delivered across Bangladesh with advance payment via bKash, Nagad or Rocket.",
};

export const viewport: Viewport = {
  themeColor: "#071a2b",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@400..900&family=Manrope:wght@300..800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-abyss font-body text-foam antialiased">
        <Background />
        <Nav />
        <div className="relative z-10">
          <main id="main">{children}</main>
          <Footer />
        </div>
        <CartDrawer />
        <SearchOverlay />
      </body>
    </html>
  );
}
