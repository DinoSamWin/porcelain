"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useCart } from "@/components/CartProvider";
import { CountryRegionSelect } from "@/components/CountryRegionSelect";
import { createInquiryId, getCurrentSourceContext, getOrCreateVisitorId, submitInquiryRecord } from "@/lib/inquiry";
import type { Product } from "@/types/domain";

export function RequestQuoteForm({ products, sourceProductSlug = "" }: { products: Product[]; sourceProductSlug?: string }) {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const sourceProduct = useMemo(
    () => products.find((product) => product.slug === sourceProductSlug),
    [products, sourceProductSlug]
  );
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

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const inquiryId = createInquiryId();
    const submitItems =
      items.length > 0
        ? items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            note: item.note
          }))
        : sourceProduct
          ? [{ productId: sourceProduct.id, quantity: 1 }]
          : [];
    setSubmitting(true);
    setSubmitError("");

    try {
      await submitInquiryRecord({
        inquiryId,
        visitorId: getOrCreateVisitorId(),
        source: getCurrentSourceContext(sourceProduct ? { id: sourceProduct.id, slug: sourceProduct.slug } : undefined),
        customer: {
          name: getFormText(formData, "name"),
          companyName: getFormText(formData, "companyName"),
          countryRegion: getFormText(formData, "country"),
          email: getFormText(formData, "email"),
          shippingDestination: getFormText(formData, "destination"),
          preferredContactMethod: "email"
        },
        trade: {
          targetMarket: getFormText(formData, "targetMarket"),
          customLogo: getFormText(formData, "customLogo"),
          customPackaging: getFormText(formData, "customPackaging"),
          deliveryTime: getFormText(formData, "deliveryTime")
        },
        requirements: getFormText(formData, "requirements"),
        items: submitItems
      });

      window.localStorage.setItem(
        "aurelia-last-inquiry",
        JSON.stringify({
          inquiryId,
          email: formData.get("email"),
          items: submitItems,
          tradeInfo: {
            targetMarket: formData.get("targetMarket")
          },
          createdAt: new Date().toISOString()
        })
      );
      clearCart();
      router.push(`/success?inquiryId=${encodeURIComponent(inquiryId)}`);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "意向单提交失败，请稍后重试。");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="quote-form" onSubmit={handleSubmit}>
      <section className="panel quote-summary">
        <span className="panel-label">Product Confirmation</span>
        <h2>Saved pieces</h2>
        {selectedProducts.length === 0 ? (
          <p>{sourceProduct ? `This inquiry is linked to ${sourceProduct.name}.` : "No saved piece yet. You can still contact sales."}</p>
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
            <CountryRegionSelect required />
          </label>
          <label>
            Email
            <input name="email" required type="email" />
          </label>
          <label>
            Shipping Destination
            <input name="destination" />
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
        {submitError ? <p className="form-error">{submitError}</p> : null}
        <button className="btn btn-primary" disabled={submitting} type="submit">
          {submitting ? "Sending..." : "Send Contact Details"}
          <ArrowRight size={16} aria-hidden="true" />
        </button>
        <Link className="btn btn-secondary" href="/cart">
          Review Interest List
        </Link>
      </div>
    </form>
  );
}

function getFormText(formData: FormData, key: string) {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}
