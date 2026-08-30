import { Mail } from "lucide-react";
import Link from "next/link";
import { AdminAwareFooter } from "@/components/AdminAwareFooter";
import { siteConfig } from "@/lib/site-config";

export function SiteFooter() {
  return (
    <AdminAwareFooter>
      <footer className="site-footer">
        <div className="footer-cta">
          <div>
            <h2>Save Interest, Then Let Sales Follow Up</h2>
            <p>Use this mobile preview to collect buyer feedback first. Formal product details can be confirmed after a piece gets interest.</p>
          </div>
          <Link className="btn btn-primary" href="/request-quote">
            Contact Sales
          </Link>
        </div>

        <div className="footer-grid">
          <div>
            <Link className="brand footer-brand" href="/">
              <span className="brand__crest">
                AC
              </span>
              <span>
                <span className="brand__name">{siteConfig.brandName}</span>
                <span className="brand__tagline">Enamel porcelain preview</span>
              </span>
            </Link>
          </div>

          <div>
            <h3>Preview</h3>
            <Link href="/#featured">Featured Pieces</Link>
            <Link href="/products">Product Shelf</Link>
            <Link href="/cart">Interest List</Link>
            <Link href="/request-quote">Contact Sales</Link>
          </div>

          <div>
            <h3>Sales Flow</h3>
            <Link href="/products">Browse Pieces</Link>
            <Link href="/cart">Saved Interest</Link>
            <Link href="/request-quote">Leave Contact</Link>
          </div>

          <div>
            <h3>Contact</h3>
            <a href={`mailto:${siteConfig.salesEmail}`}>
              <Mail size={15} aria-hidden="true" />
              {siteConfig.salesEmail}
            </a>
          </div>
        </div>

        <div className="footer-legal">
          <span>2026 {siteConfig.brandName}. Prototype for B2B export validation.</span>
          <Link href="/privacy-policy">Privacy Policy</Link>
          <Link href="/terms-and-conditions">Terms & Conditions</Link>
        </div>
      </footer>
    </AdminAwareFooter>
  );
}
