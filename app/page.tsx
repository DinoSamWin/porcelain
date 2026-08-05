import { ArrowRight, HeartHandshake, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { ProductCard } from "@/components/ProductCard";
import { getProductById, homeContent, products } from "@/data/catalog";

const featuredProducts = homeContent.featuredProductIds
  .map((id) => getProductById(id))
  .filter((product): product is NonNullable<typeof product> => Boolean(product));

const displayProducts = [...products].sort((a, b) => a.sortOrder - b.sortOrder);

export default function HomePage() {
  const heroProduct = featuredProducts[0];

  return (
    <>
      <section className="phase-hero" aria-label="Enamel porcelain showcase">
        <div className="phase-hero__media">
          <Image
            src={homeContent.hero.image}
            alt="Featured enamel porcelain lidded censer"
            fill
            loading="eager"
            unoptimized
            sizes="(max-width: 860px) 100vw, 54vw"
          />
          <div className="phase-hero__caption">
            <span>Featured Piece</span>
            <strong>{heroProduct?.name ?? "Enamel Porcelain"}</strong>
          </div>
        </div>

        <div className="phase-hero__copy">
          <span className="section-kicker">Aurelia Objects</span>
          <h1>Enamel Porcelain Objects</h1>
          <p>A compact visual edit for European buyer meetings.</p>
          <div className="phase-hero__actions">
            <Link className="btn btn-primary" href="#featured">
              Explore
            </Link>
            <Link className="btn btn-secondary" href="/request-quote">
              Contact
            </Link>
          </div>
        </div>
      </section>

      <section className="section-pad phase-featured" id="featured">
        <div className="section-heading section-heading--left">
          <span>The Edit</span>
          <h2>First pieces</h2>
        </div>
        <div className="product-grid product-grid--featured">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} featured />
          ))}
        </div>
      </section>

      <section className="phase-shelf section-pad" id="products">
        <div className="section-heading section-heading--left">
          <span>Objects</span>
          <h2>Product shelf</h2>
        </div>
        <div className="product-shelf">
          {displayProducts.map((product, index) => (
            <Link className="shelf-item" href={`/products/${product.slug}`} key={product.id}>
              <div className="shelf-item__image">
                <Image src={product.images[0].src} alt={product.images[0].alt} fill loading="eager" unoptimized sizes="92px" />
              </div>
              <div>
                <span>{String(index + 1).padStart(2, "0")} / {product.tags[0]}</span>
                <h3>{product.name}</h3>
              </div>
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          ))}
        </div>
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
