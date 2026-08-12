import type { Metadata } from "next";
import { ImageUp } from "lucide-react";
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
  const heroImage = products[0]?.images[0];

  return (
    <>
      <section className="page-hero page-hero--product">
        <div>
          <span className="section-kicker">Aurelia Objects</span>
          <h1>The product shelf</h1>
          <p>Selected enamel porcelain pieces.</p>
        </div>
        {heroImage ? (
          <div className="page-hero__image">
            <Image
              src={heroImage.src}
              alt={heroImage.alt}
              fill
              loading="eager"
              unoptimized
              sizes="(max-width: 840px) 100vw, 38vw"
            />
          </div>
        ) : (
          <div className="page-hero__empty">
            <ImageUp size={32} aria-hidden="true" />
            <span>No products uploaded yet</span>
          </div>
        )}
      </section>

      <section className="section-pad" id="collections">
        <ProductCatalog products={products} categories={categories} collections={collections} />
      </section>
    </>
  );
}
