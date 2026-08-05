"use client";

import { useMemo, useState } from "react";
import { ProductCard } from "@/components/ProductCard";
import type { Category, Collection, Product } from "@/types/domain";

interface ProductCatalogProps {
  products: Product[];
  categories: Category[];
  collections: Collection[];
}

export function ProductCatalog({ products, categories }: ProductCatalogProps) {
  const [categoryId, setCategoryId] = useState("all");

  const visibleCategories = useMemo(
    () => categories.filter((category) => products.some((product) => product.categoryId === category.id)),
    [categories, products]
  );

  const filtered = useMemo(() => {
    return products
      .filter((product) => categoryId === "all" || product.categoryId === categoryId)
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [categoryId, products]);

  return (
    <section className="catalog-results" aria-label="Product results">
      <div className="catalog-toolbar">
        <div>
          <span className="section-kicker">Objects</span>
          <p>{filtered.length} pieces</p>
        </div>
        <div className="catalog-tabs" aria-label="Filter products by category">
          <button className={categoryId === "all" ? "is-active" : ""} type="button" onClick={() => setCategoryId("all")}>
            All
          </button>
          {visibleCategories.map((category) => (
            <button
              className={categoryId === category.id ? "is-active" : ""}
              key={category.id}
              type="button"
              onClick={() => setCategoryId(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <div className="product-grid">
        {filtered.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
