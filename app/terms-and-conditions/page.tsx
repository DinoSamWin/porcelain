import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms for using the Aurelia Ceramics B2B enamel porcelain preview catalog."
};

const buyerResponsibilities = [
  "Use the website for legitimate B2B sourcing, purchasing, product review, or sales discussion.",
  "Provide accurate inquiry information, including company name, country or region, email address, and relevant product needs.",
  "Confirm final specifications, compliance needs, labeling, packaging, logistics, delivery timing, and prices before placing an order."
];

const productTerms = [
  "Product names, materials, colors, finishes, sizes, packaging details, availability, MOQ, and lead times are preview information and may change.",
  "Images are provided for product review and may differ from final production because enamel porcelain and metal accessories can vary by batch, lighting, glaze, and finishing process.",
  "A binding order exists only when both parties confirm the commercial terms in a written quotation, proforma invoice, purchase order, or other signed or accepted sales document."
];

export default function TermsAndConditionsPage() {
  return (
    <section className="section-pad page-shell legal-page">
      <div className="section-heading section-heading--left">
        <span>Terms</span>
        <h1>Terms & Conditions</h1>
        <p>Last updated: August 30, 2026</p>
      </div>

      <div className="legal-layout">
        <aside className="legal-aside">
          <p>B2B preview catalog</p>
          <a href={`mailto:${siteConfig.salesEmail}`}>{siteConfig.salesEmail}</a>
        </aside>

        <article className="legal-copy">
          <section>
            <h2>1. Website Purpose</h2>
            <p>
              This website is operated by {siteConfig.legalName} as a B2B preview catalog for enamel porcelain products,
              importer meetings, decorative retail review, interior buyer conversations, and sales follow-up. It is not a
              consumer retail checkout website.
            </p>
          </section>

          <section>
            <h2>2. Buyer Responsibilities</h2>
            <ul>
              {buyerResponsibilities.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2>3. Product And Quotation Information</h2>
            <ul>
              {productTerms.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>

          <section>
            <h2>4. Samples, Customization, And Packaging</h2>
            <p>
              Custom logo, custom packaging, color matching, finish selection, sample preparation, and delivery timing are
              subject to confirmation by sales and production teams. Additional fees, minimum quantities, tooling costs, or
              longer lead times may apply.
            </p>
          </section>

          <section>
            <h2>5. Intellectual Property</h2>
            <p>
              Website design, product photos, catalog structure, copy, and brand assets may not be copied, reproduced,
              scraped, republished, or used for competing catalogs without written permission. Buyers may use shared product
              information only for sourcing evaluation and related commercial discussion.
            </p>
          </section>

          <section>
            <h2>6. Availability And Website Changes</h2>
            <p>
              We may update products, images, categories, availability, or website functions at any time. We try to keep
              information useful and current, but we do not guarantee uninterrupted access or error-free content.
            </p>
          </section>

          <section>
            <h2>7. Limitation Of Liability</h2>
            <p>
              To the extent permitted by applicable law, the website is provided for preliminary business review. We are not
              responsible for indirect losses arising from reliance on preview catalog information before final written
              commercial confirmation.
            </p>
          </section>

          <section>
            <h2>8. Contact</h2>
            <p>
              For questions about these terms, contact us at <a href={`mailto:${siteConfig.salesEmail}`}>{siteConfig.salesEmail}</a>.
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
