import type { Metadata } from "next";
import { ArrowRight, MessageCircle, PackageCheck, Sparkles } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToInquiryButton } from "@/components/AddToInquiryButton";
import { ProductImageViewer } from "@/components/ProductImageViewer";
import { ProductCard } from "@/components/ProductCard";
import { getCategoryById, getCollectionById, getProductBySlug, getRelatedProducts, products } from "@/data/catalog";
import { getAvailabilityLabel } from "@/lib/catalog-options";

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
  const collectionLabel = getDisplayText(collection?.name, "Enamel Porcelain");
  const categoryLabel = getDisplayText(category?.name, "Object");
  const usageLabel = getDisplayText(product.usage[0], "Decorative object");
  const packagingInfo = getPublicPackagingInfo(product.packagingInfo);
  const detailRows = [
    { label: "Material", value: getDisplayText(product.material, "To be confirmed") },
    { label: "Color", value: getDisplayText(product.color, "To be confirmed") },
    { label: "Finish", value: getDisplayText(product.finish, "To be confirmed") },
    { label: "Use", value: usageLabel },
    ...product.attributes.slice(0, 2).map((attribute) => ({
      label: getDisplayText(attribute.label, "Detail"),
      value: getDisplayText(attribute.value, "To be confirmed")
    }))
  ];

  return (
    <>
      <section className="product-detail product-detail--phase">
        <ProductImageViewer images={product.images} productName={product.name} />

        <div className="product-info">
          <span className="section-kicker">{collectionLabel}</span>
          <h1>{product.name}</h1>
          <p>Visual reference for buyer review.</p>
          <div className="detail-meta">
            <span>{product.sku}</span>
            <span>{categoryLabel}</span>
            <span>{getAvailabilityLabel(product.availability)}</span>
          </div>
          <div className="detail-table detail-table--phase">
            {detailRows.map((row) => (
              <div key={`${row.label}-${row.value}`}>
                <span>{row.label}</span>
                <strong>{row.value}</strong>
              </div>
            ))}
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
            {packagingInfo.map((item) => (
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

function getDisplayText(value: string | undefined, fallback: string) {
  const text = value?.trim();
  const placeholders = new Set(["待填写", "待确认", "商品展示", "尺寸待确认", "包装待确认", "默认系列", "商品", "新品"]);

  if (!text || placeholders.has(text)) {
    return fallback;
  }

  return text;
}

function getPublicPackagingInfo(items: string[]) {
  const cleaned = items
    .map((item) => getDisplayText(item, ""))
    .filter(Boolean);

  return cleaned.length > 0 ? cleaned : ["Dimensions to be confirmed", "Packing to be confirmed"];
}
