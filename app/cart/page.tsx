import type { Metadata } from "next";
import { CartExperience } from "@/components/CartExperience";
import { products } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Interest List",
  description: "Review selected enamel porcelain pieces and send buyer contact details for sales follow-up."
};

export default function CartPage() {
  return (
    <section className="section-pad page-shell">
      <CartExperience products={products} />
    </section>
  );
}
