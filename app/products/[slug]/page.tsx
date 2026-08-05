import type { Metadata } from "next";
import { ArrowRight, MessageCircle, PackageCheck, Sparkles } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToInquiryButton } from "@/components/AddToInquiryButton";
import { ProductCard } from "@/components/ProductCard";
import { getCategoryById, getCollectionById, getProductBySlug, getRelatedProducts, products } from "@/data/catalog";

interface ProductDetailPageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = getProductBySlug(slug);
  if (!product) {
    return {};
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [product.images[0].src]
    }
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const category = getCategoryById(product.categoryId);
  const collection = getCollectionById(product.collectionId);
  const related = getRelatedProducts(product);
  const hasGallery = product.images.length > 1;

  return (
    <>
      <section className="product-detail product-detail--phase">
        <div className="product-gallery">
          <div className="product-gallery__main">
            <Image src={product.images[0].src} alt={product.images[0].alt} fill loading="eager" unoptimized sizes="(max-width: 900px) 100vw, 54vw" />
          </div>
          {hasGallery ? (
            <div className="product-gallery__thumbs">
              {product.images.map((image) => (
                <div key={image.src}>
                  <Image src={image.src} alt={image.alt} fill unoptimized sizes="120px" />
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <div className="product-info">
          <span className="section-kicker">{collection?.name ?? "Enamel Porcelain"}</span>
          <h1>{product.name}</h1>
          <p>Visual reference for buyer review.</p>
          <div className="detail-meta">
            <span>{product.sku}</span>
            <span>{category?.name}</span>
          </div>
          <div className="detail-table detail-table--phase">
            <div>
              <span>Material</span>
              <strong>{product.material}</strong>
            </div>
            <div>
              <span>Color</span>
              <strong>{product.color}</strong>
            </div>
            <div>
              <span>Finish</span>
              <strong>{product.finish}</strong>
            </div>
            <div>
              <span>Use</span>
              <strong>{product.usage[0]}</strong>
            </div>
          </div>
          <div className="product-info__actions">
            <AddToInquiryButton productId={product.id} quantity={1} className="btn btn-primary" />
            <Link className="btn btn-secondary" href="/request-quote">
              Contact Sales
            </Link>
          </div>
        </div>
      </section>

      <section className="section-pad detail-interest">
        <div className="panel detail-interest__panel">
          <div>
            <Sparkles size={24} aria-hidden="true" />
            <span className="panel-label">Interest List</span>
            <h2>Add to interest list</h2>
            <p>Sales can confirm dimensions, samples and packing.</p>
          </div>
          <ul className="packaging-list">
            {product.packagingInfo.map((item) => (
              <li key={item}>
                <PackageCheck size={18} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
          <Link className="btn btn-primary" href="/request-quote">
            <MessageCircle size={16} aria-hidden="true" />
            Send Contact Details
          </Link>
        </div>
      </section>

      {related.length > 0 ? (
        <section className="section-pad">
          <div className="section-heading section-heading--left">
            <span>More</span>
            <h2>More objects</h2>
          </div>
          <div className="product-grid product-grid--featured">
            {related.map((candidate) => (
              <ProductCard key={candidate.id} product={candidate} />
            ))}
          </div>
          <div className="center-action">
            <Link className="text-link" href="/products">
              View All Products
              <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </section>
      ) : null}
    </>
  );
}
