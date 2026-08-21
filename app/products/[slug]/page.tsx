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
  const collectionLabel = getPublicText(collection?.name) ?? "Enamel Porcelain";
  const categoryLabel = getPublicText(product.tags[0]) ?? getPublicText(category?.name);
  const productDescription = getPublicText(product.description) ?? "Visual reference for buyer review.";
  const packagingInfo = getPublicPackagingInfo(product.packagingInfo);
  const detailRows = compactRows([
    { label: "Material", value: getPublicText(product.material) },
    { label: "Color", value: getPublicText(product.color) },
    { label: "Craft", value: getPublicText(product.finish) },
    { label: "Use", value: getPublicText(product.usage[0]) },
    ...product.attributes.slice(0, 2).map((attribute) => ({
      label: getPublicText(attribute.label),
      value: getPublicText(attribute.value)
    }))
  ]);
  const metaItems = compactStrings([product.sku, categoryLabel, getAvailabilityLabel(product.availability)]);

  return (
    <>
      <section className="product-detail product-detail--phase">
        <ProductImageViewer images={product.images} productName={product.name} />

        <div className="product-info">
          <span className="section-kicker">{collectionLabel}</span>
          <h1>{product.name}</h1>
          <p>{productDescription}</p>
          <div className="detail-meta">
            {metaItems.map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
          {detailRows.length > 0 ? (
            <div className="detail-table detail-table--phase">
              {detailRows.map((row) => (
                <div key={`${row.label}-${row.value}`}>
                  <span>{row.label}</span>
                  <strong>{row.value}</strong>
                </div>
              ))}
            </div>
          ) : null}
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

function getPublicText(value: string | undefined) {
  const text = value?.trim();
  const placeholders = new Set(["待填写", "待确认", "商品展示", "尺寸待确认", "包装待确认", "默认系列", "商品", "新品", "Object"]);

  if (!text || placeholders.has(text)) {
    return null;
  }

  return text;
}

function compactRows(rows: Array<{ label: string | null; value: string | null }>) {
  return rows.filter((row): row is { label: string; value: string } => Boolean(row.label && row.value));
}

function compactStrings(values: Array<string | null | undefined>) {
  return values.filter((value): value is string => Boolean(value));
}

function getPublicPackagingInfo(items: string[]) {
  const cleaned = items
    .map((item) => getPublicText(item))
    .filter((item): item is string => Boolean(item));

  return cleaned.length > 0 ? cleaned : ["Dimensions to be confirmed", "Packing to be confirmed"];
}
