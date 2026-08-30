import type { Metadata } from "next";
import { RequestQuoteForm } from "@/components/RequestQuoteForm";
import { products } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Contact Sales",
  description: "Leave buyer contact details and request follow-up on enamel porcelain pieces without creating an account."
};

export default async function RequestQuotePage({ searchParams }: { searchParams: Promise<{ product?: string }> }) {
  const { product } = await searchParams;

  return (
    <section className="section-pad page-shell">
      <div className="section-heading section-heading--left">
        <span>Contact</span>
        <h1>Send buyer interest</h1>
        <p>No account required.</p>
      </div>
      <RequestQuoteForm products={products} sourceProductSlug={product} />
    </section>
  );
}
