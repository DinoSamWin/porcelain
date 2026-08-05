"use client";

import { ArrowRight, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/CartProvider";
import { createInquiryId } from "@/lib/inquiry";
import type { Product } from "@/types/domain";

interface CartExperienceProps {
  products: Product[];
}

export function CartExperience({ products }: CartExperienceProps) {
  const router = useRouter();
  const { items, updateItem, removeItem, clearCart } = useCart();

  const cartProducts = useMemo(
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
    if (cartProducts.length === 0) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    const inquiryId = createInquiryId();
    window.localStorage.setItem(
      "aurelia-last-inquiry",
      JSON.stringify({
        inquiryId,
        email: formData.get("email"),
        items,
        createdAt: new Date().toISOString()
      })
    );
    clearCart();
    router.push(`/success?inquiryId=${encodeURIComponent(inquiryId)}`);
  }

  return (
    <div className="cart-layout">
      <section className="cart-items">
        <div className="section-heading section-heading--left">
          <span>Interest List</span>
          <h1>Saved pieces</h1>
          <p>Send to sales for follow-up.</p>
        </div>

        {cartProducts.length === 0 ? (
          <div className="empty-state">
            <h2>Your interest list is empty</h2>
            <p>Save pieces from the preview shelf.</p>
            <Link className="btn btn-primary" href="/products">
              Browse Products
            </Link>
          </div>
        ) : (
          <div className="cart-list">
            {cartProducts.map(({ item, product }) => (
              <article className="cart-line" key={product.id}>
                <div className="cart-line__image">
                  <Image src={product.images[0].src} alt={product.images[0].alt} fill sizes="140px" />
                </div>
                <div className="cart-line__main">
                  <span>{product.sku}</span>
                  <h2>{product.name}</h2>
                  <p>{product.material}</p>
                  <label>
                    Buyer note
                    <textarea
                      value={item.note ?? ""}
                      onChange={(event) => updateItem(product.id, { note: event.target.value })}
                      placeholder="Ask for dimensions, closer photos, sample price, market fit..."
                    />
                  </label>
                </div>
                <div className="cart-line__controls">
                  <label>
                    Interest quantity
                    <input
                      type="number"
                      min={product.moq}
                      step={1}
                      value={item.quantity}
                      onChange={(event) => updateItem(product.id, { quantity: Number(event.target.value) })}
                    />
                  </label>
                  <button className="icon-button" type="button" onClick={() => removeItem(product.id)}>
                    <Trash2 size={17} aria-hidden="true" />
                    <span className="sr-only">Remove product</span>
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <form className="inquiry-form panel" onSubmit={handleSubmit}>
        <h2>Buyer Information</h2>
        <label>
          Name
          <input name="name" required placeholder="Your name" />
        </label>
        <label>
          Company Name
          <input name="companyName" required placeholder="Company or buying office" />
        </label>
        <label>
          Country / Region
          <input name="country" required placeholder="Germany, UAE, Saudi Arabia..." />
        </label>
        <label>
          Email
          <input name="email" required type="email" placeholder="buyer@company.com" />
        </label>
        <label>
          WhatsApp / Phone
          <input name="phone" placeholder="+971..." />
        </label>
        <label>
          Shipping Destination
          <input name="destination" placeholder="Port, warehouse, or country" />
        </label>
        <label>
          Preferred Contact Method
          <select name="contactMethod" defaultValue="email">
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="phone">Phone</option>
          </select>
        </label>
        <label>
          Message
          <textarea name="message" placeholder="Which pieces are interesting? Need dimensions, closer photos, sample price, or packaging details?" />
        </label>
        <button className="btn btn-primary" disabled={cartProducts.length === 0} type="submit">
          Send Interest
          <ArrowRight size={16} aria-hidden="true" />
        </button>
        <Link className="text-link" href="/products">
          Continue Browsing
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </form>
    </div>
  );
}
