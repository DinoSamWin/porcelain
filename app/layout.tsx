import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/components/CartProvider";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.aureliaceramics.example"),
  title: {
    default: "Aurelia Ceramics | Enamel Porcelain Preview",
    template: "%s | Aurelia Ceramics"
  },
  description:
    "A mobile-first enamel porcelain preview catalog for sales teams, importers, interior buyers, and decorative retail partners.",
  openGraph: {
    title: "Aurelia Ceramics Enamel Porcelain Preview",
    description: "Visual-first enamel porcelain catalog with product interest list and sales contact flow.",
    images: ["/images/phase1/plum-lidded-censer.png"]
  }
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>
        <CartProvider>
          <SiteHeader />
          <main>{children}</main>
          <SiteFooter />
        </CartProvider>
      </body>
    </html>
  );
}
