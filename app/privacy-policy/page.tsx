import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Aurelia Ceramics handles buyer contact details and product inquiry information."
};

const collectionItems = [
  "Contact details you submit, including name, company name, country or region, email address, and shipping destination.",
  "Trade information you choose to provide, including target market, custom logo needs, custom packaging needs, expected delivery time, and free-text requirements.",
  "Inquiry context, including selected products, product quantities, source page, referrer, submitted page path, and submission time.",
  "Technical signals used for inquiry management, including a browser visitor ID stored on your device, masked IP information, and a shortened user-agent record."
];

const usageItems = [
  "Respond to buyer inquiries and arrange sales follow-up.",
  "Understand which enamel porcelain pieces attract buyer interest.",
  "Prepare product details, sample discussions, quotation follow-up, packaging confirmation, and export communication.",
  "Detect repeated inquiries from the same device, email, or network signal so the sales team can follow up consistently.",
  "Maintain the security and reliability of the website and admin inquiry records."
];

export default function PrivacyPolicyPage() {
  return (
    <section className="section-pad page-shell legal-page">
      <div className="section-heading section-heading--left">
        <span>Privacy</span>
        <h1>Privacy Policy</h1>
        <p>Last updated: August 30, 2026</p>
      </div>

      <div className="legal-layout">
        <aside className="legal-aside">
          <p>B2B preview catalog</p>
          <a href={`mailto:${siteConfig.salesEmail}`}>{siteConfig.salesEmail}</a>
        </aside>

        <article className="legal-copy">
          <section>
            <h2>1. Scope</h2>
            <p>
              This Privacy Policy explains how {siteConfig.legalName} handles information submitted through this B2B enamel
              porcelain preview website. The website is designed for importer meetings, buyer review, product interest lists,
              and sales follow-up. It does not provide consumer checkout or online payment.
            </p>
          </section>

          <section>
            <h2>2. Information We Collect</h2>
            <ul>
              {collectionItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2>3. How We Use Information</h2>
            <ul>
              {usageItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2>4. Legal Basis</h2>
            <p>
              Where applicable data protection law requires a legal basis, we process buyer inquiry information to respond to
              your request, take steps before entering into a B2B transaction, and pursue our legitimate interest in managing
              sales communication, product demand, export preparation, and website security.
            </p>
          </section>

          <section>
            <h2>5. Local Storage And Device Recognition</h2>
            <p>
              When you submit an inquiry, the website may create a visitor ID in your browser local storage. This helps us
              recognize repeated submissions from the same device without requiring an account. You can clear this identifier
              through your browser settings.
            </p>
          </section>

          <section>
            <h2>6. Sharing</h2>
            <p>
              We use submitted information for sales and export communication. We may share relevant inquiry details with
              internal sales, operations, production, packaging, or logistics staff where needed to respond to your request.
              We may also use website hosting, storage, security, analytics, or code repository service providers to operate
              the website. We do not sell buyer inquiry information.
            </p>
          </section>

          <section>
            <h2>7. Retention</h2>
            <p>
              We keep inquiry records for as long as needed to manage buyer communication, product follow-up, export
              documentation, dispute handling, and business records, unless a longer or shorter period is required by law.
            </p>
          </section>

          <section>
            <h2>8. Your Choices</h2>
            <p>
              You may contact us to request access, correction, deletion, or restriction of your submitted personal information.
              We may need to verify the request before taking action.
            </p>
          </section>

          <section>
            <h2>9. Contact</h2>
            <p>
              For privacy questions, contact us at <a href={`mailto:${siteConfig.salesEmail}`}>{siteConfig.salesEmail}</a>.
            </p>
          </section>

          <div className="legal-return">
            <Link className="btn btn-secondary" href="/">
              Back to Catalog
            </Link>
          </div>
        </article>
      </div>
    </section>
  );
}
