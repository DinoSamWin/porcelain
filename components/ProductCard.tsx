"use client";

import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types/domain";
import { AddToInquiryButton } from "@/components/AddToInquiryButton";

interface ProductCardProps {
  product: Product;
  featured?: boolean;
}

export function ProductCard({ product, featured = false }: ProductCardProps) {
  const hero = product.images[0];

  return (
    <article className={featured ? "product-card product-card--featured" : "product-card"}>
      <Link className="product-card__media" href={`/products/${product.slug}`}>
        <Image src={hero.src} alt={hero.alt} fill loading="eager" unoptimized sizes="(max-width: 760px) 100vw, 33vw" />
      </Link>
      <div className="product-card__body">
        <div className="product-card__meta">
          <span>{product.tags[0]}</span>
        </div>
        <h3>
          <Link href={`/products/${product.slug}`}>{product.name}</Link>
        </h3>
        <div className="product-card__actions">
          <Link className="text-link" href={`/products/${product.slug}`}>
            View Piece
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
          <AddToInquiryButton productId={product.id} quantity={1} className="save-link" />
        </div>
      </div>
    </article>
  );
}
