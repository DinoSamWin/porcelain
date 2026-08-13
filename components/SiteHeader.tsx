"use client";

import { Menu, ShoppingBag, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Products" },
  { href: "/#featured", label: "Featured" },
  { href: "/#contact", label: "Contact" }
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { itemCount } = useCart();
  const pathname = usePathname();

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <>
      <header className="site-header">
        <div className="site-header__inner">
          <Link className="brand" href="/" aria-label="Aurelia Ceramics home">
            <span className="brand__crest">
              AC
            </span>
            <span>
              <span className="brand__name">Aurelia Ceramics</span>
              <span className="brand__tagline">Fine porcelain for global wholesale</span>
            </span>
          </Link>

          <nav className="desktop-nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="header-actions">
            <Link className="cart-link" href="/cart" aria-label={`Inquiry cart with ${itemCount} items`}>
              <ShoppingBag size={17} aria-hidden="true" />
              <span>Interest List</span>
              {itemCount > 0 ? <strong>{itemCount}</strong> : null}
            </Link>
            <Link className="btn btn-primary header-quote" href="/request-quote">
              Contact Sales
            </Link>
            <button className="menu-button" type="button" onClick={() => setOpen((value) => !value)}>
              {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
              <span className="sr-only">Toggle menu</span>
            </button>
          </div>
        </div>

        {open ? (
          <nav className="mobile-nav" aria-label="Mobile navigation">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
            <Link href="/cart" onClick={() => setOpen(false)}>
              Interest List
            </Link>
          </nav>
        ) : null}
      </header>

      <div className="mobile-bottom-cta" aria-label="Quick actions">
        <Link className="btn btn-primary" href="/request-quote">
          Contact Sales
        </Link>
        <Link className="btn btn-secondary" href="/cart">
          Interest List
        </Link>
      </div>
    </>
  );
}
