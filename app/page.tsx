import { ArrowRight, HeartHandshake, ImageUp, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { HomeHeroCarousel } from "@/components/HomeHeroCarousel";
import { ProductCard } from "@/components/ProductCard";
import { homeContent, products } from "@/data/catalog";
import { getAvailabilityShortLabel } from "@/lib/catalog-options";

const featuredProducts = products
  .filter((product) => product.isFeatured)
  .sort((a, b) => (a.featuredOrder ?? a.sortOrder) - (b.featuredOrder ?? b.sortOrder));

const heroProducts = products
  .filter((product) => product.isHeroBanner && product.bannerImage?.src)
  .sort((a, b) => (a.heroOrder ?? a.sortOrder) - (b.heroOrder ?? b.sortOrder));

const displayProducts = [...products].sort((a, b) => a.sortOrder - b.sortOrder);

export default function HomePage() {
  const heroCarouselProducts =
    heroProducts.length > 0 ? heroProducts : featuredProducts[0] ? [featuredProducts[0]] : displayProducts[0] ? [displayProducts[0]] : [];

  return (
    <>
      <HomeHeroCarousel products={heroCarouselProducts} fallbackImage={homeContent.hero.image} />

      <section className="section-pad phase-featured" id="featured">
        <div className="section-heading section-heading--left">
          <span>The Edit</span>
          <h2>First pieces</h2>
        </div>
        {featuredProducts.length > 0 ? (
          <div className="product-grid product-grid--featured">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} featured />
            ))}
          </div>
        ) : (
          <div className="empty-catalog-state">
            <ImageUp size={28} aria-hidden="true" />
            <h3>No products yet</h3>
            <p>Upload products from the admin panel to publish this section.</p>
          </div>
        )}
      </section>

      <section className="phase-shelf section-pad" id="products">
        <div className="section-heading section-heading--left">
          <span>Objects</span>
          <h2>Product shelf</h2>
        </div>
        {displayProducts.length > 0 ? (
          <div className="product-shelf">
            {displayProducts.map((product, index) => (
              <Link className="shelf-item" href={`/products/${product.slug}`} key={product.id}>
                <div className="shelf-item__image">
                  <Image src={product.images[0].src} alt={product.images[0].alt} fill loading="eager" unoptimized sizes="92px" />
                </div>
                <div>
                  <span>{String(index + 1).padStart(2, "0")} / {getAvailabilityShortLabel(product.availability)}</span>
                  <h3>{product.name}</h3>
                </div>
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            ))}
          </div>
        ) : null}
        <div className="center-action">
          <Link className="btn btn-secondary" href="/products">
            Full Product List
          </Link>
        </div>
      </section>

      <section className="phase-contact" id="contact">
        <div>
          <Sparkles size={24} aria-hidden="true" />
          <span className="section-kicker">Follow-up</span>
          <h2>Register interest</h2>
          <p>Sales can confirm dimensions, samples and packing after a piece gets attention.</p>
        </div>
        <div className="phase-contact__actions">
          <Link className="btn btn-primary" href="/request-quote">
            <HeartHandshake size={16} aria-hidden="true" />
            Contact Sales
          </Link>
          <Link className="btn btn-secondary" href="/cart">
            View Interest List
          </Link>
        </div>
      </section>
    </>
  );
}
