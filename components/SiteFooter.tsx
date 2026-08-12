import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import Link from "next/link";

export function SiteFooter() {
  return (
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
            <span className="brand__name">Aurelia Ceramics</span>
              <span className="brand__tagline">Enamel porcelain preview</span>
            </span>
          </Link>
          <p className="footer-note">A mobile-first preview catalog for importer meetings, interior buyers, and decorative retail conversations.</p>
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
          <Link href="/admin">Catalog Admin</Link>
        </div>

        <div>
          <h3>Contact</h3>
          <p>
            <Mail size={15} aria-hidden="true" />
            sales@aureliaceramics.example
          </p>
          <p>
            <Phone size={15} aria-hidden="true" />
            +86 400 820 2026
          </p>
          <p>
            <MessageCircle size={15} aria-hidden="true" />
            WhatsApp sales support
          </p>
          <p>
            <MapPin size={15} aria-hidden="true" />
            China export office
          </p>
        </div>
      </div>
      <div className="footer-legal">
        <span>2026 Aurelia Ceramics. Prototype for B2B export validation.</span>
        <span>Privacy Policy</span>
        <span>Terms & Conditions</span>
      </div>
    </footer>
  );
}
