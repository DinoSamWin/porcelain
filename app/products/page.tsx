import type { Metadata } from "next";
import Image from "next/image";
import { ProductCatalog } from "@/components/ProductCatalog";
import { categories, collections, products } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Products",
  description: "Browse a mobile-first enamel porcelain preview catalog and save interested pieces for sales follow-up.",
  openGraph: {
    title: "Aurelia Ceramics Products",
    images: ["/images/phase1/plum-lidded-censer.png"]
  }
};

export default function ProductsPage() {
  return (
    <>
      <section className="page-hero page-hero--product">
        <div>
          <span className="section-kicker">Aurelia Objects</span>
          <h1>The product shelf</h1>
          <p>Selected enamel porcelain pieces.</p>
        </div>
        <div className="page-hero__image">
          <Image
            src="/images/phase1/blue-floral-censer.png"
            alt="Blue-and-white gilded enamel porcelain piece"
            fill
            loading="eager"
            unoptimized
            sizes="(max-width: 840px) 100vw, 38vw"
          />
        </div>
      </section>

      <section className="section-pad" id="collections">
        <ProductCatalog products={products} categories={categories} collections={collections} />
      </section>
    </>
  );
}
