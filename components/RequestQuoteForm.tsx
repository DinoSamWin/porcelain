"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo } from "react";
import { useCart } from "@/components/CartProvider";
import { createInquiryId } from "@/lib/inquiry";
import type { Product } from "@/types/domain";

export function RequestQuoteForm({ products }: { products: Product[] }) {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const selectedProducts = useMemo(
    () =>
      items
        .map((item) => {
          const product = products.find((candidate) => candidate.id === item.productId);
          return product ? { item, product } : null;
        })
        .filter((entry): entry is NonNullable<typeof entry> => Boolean(entry)),
    [items, products]
  );

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const inquiryId = createInquiryId();
    window.localStorage.setItem(
      "aurelia-last-inquiry",
      JSON.stringify({
        inquiryId,
        email: formData.get("email"),
        items,
        tradeInfo: {
          targetMarket: formData.get("targetMarket"),
          incoterms: formData.get("incoterms")
        },
        createdAt: new Date().toISOString()
      })
    );
    clearCart();
    router.push(`/success?inquiryId=${encodeURIComponent(inquiryId)}`);
  }

  return (
    <form className="quote-form" onSubmit={handleSubmit}>
      <section className="panel quote-summary">
        <span className="panel-label">Product Confirmation</span>
        <h2>Saved pieces</h2>
        {selectedProducts.length === 0 ? (
          <p>No saved piece yet. You can still contact sales.</p>
        ) : (
          <ul className="summary-list">
            {selectedProducts.map(({ item, product }) => (
              <li key={product.id}>
                <span>{product.name}</span>
                <strong>{item.quantity} interested</strong>
              </li>
            ))}
          </ul>
        )}
        <Link className="text-link" href="/products">
          Browse Pieces
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </section>

      <section className="panel">
        <span className="panel-label">Customer Information</span>
        <div className="form-grid">
          <label>
            Name
            <input name="name" required />
          </label>
          <label>
            Company Name
            <input name="companyName" required />
          </label>
          <label>
            Country / Region
            <input name="country" required />
          </label>
          <label>
            Email
            <input name="email" required type="email" />
          </label>
          <label>
            WhatsApp / Phone
            <input name="phone" />
          </label>
          <label>
            Shipping Destination
            <input name="destination" />
          </label>
          <label>
            Preferred Contact Method
            <select name="contactMethod" defaultValue="email">
              <option value="email">Email</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="phone">Phone</option>
            </select>
          </label>
        </div>
      </section>

      <section className="panel">
        <span className="panel-label">Trade Information</span>
        <div className="form-grid">
          <label>
            Target Market
            <select name="targetMarket" defaultValue="Europe">
              <option>Europe</option>
              <option>Middle East</option>
              <option>Hotel Procurement</option>
              <option>Retail Import</option>
            </select>
          </label>
          <label>
            Interest Level
            <input name="volume" placeholder="Buyer feedback, sample request, showroom discussion..." />
          </label>
          <label>
            Need Custom Logo?
            <select name="customLogo" defaultValue="Not sure">
              <option>Not sure</option>
              <option>Yes</option>
              <option>No</option>
            </select>
          </label>
          <label>
            Need Custom Packaging?
            <select name="customPackaging" defaultValue="Not sure">
              <option>Not sure</option>
              <option>Yes</option>
              <option>No</option>
            </select>
          </label>
          <label>
            Preferred Incoterms
            <select name="incoterms" defaultValue="FOB">
              <option>FOB</option>
              <option>CIF</option>
              <option>EXW</option>
              <option>DDP sample shipment</option>
            </select>
          </label>
          <label>
            Expected Delivery Time
            <input name="deliveryTime" placeholder="Before Ramadan, Q4 launch..." />
          </label>
        </div>
        <label>
          Follow-up Request
          <textarea name="requirements" placeholder="Ask for dimensions, closer photos, sample price, MOQ, packaging, or availability." />
        </label>
      </section>

      <div className="quote-submit">
        <button className="btn btn-primary" type="submit">
          Send Contact Details
          <ArrowRight size={16} aria-hidden="true" />
        </button>
        <Link className="btn btn-secondary" href="/cart">
          Review Interest List
        </Link>
      </div>
    </form>
  );
}
