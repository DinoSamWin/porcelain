"use client";

import { ImageUp, Plus, Save, Trash2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useState, type ChangeEvent } from "react";
import type { CatalogContent } from "@/data/catalog";
import { availabilityOptions, contentStorageNotes } from "@/lib/catalog-options";
import type { Category, Product } from "@/types/domain";

interface AdminContentManagerProps {
  initialContent: CatalogContent;
  initialPublishMode: "github" | "local";
}

type AdminTab = "home" | "products" | "categories" | "strategy";

const blankSpec = {
  size: "To be confirmed",
  weight: "To be confirmed",
  packaging: "Protective export packaging available after item confirmation",
  cartonSize: "To be confirmed",
  grossWeight: "To be confirmed",
  netWeight: "To be confirmed"
};

export function AdminContentManager({ initialContent, initialPublishMode }: AdminContentManagerProps) {
  const [content, setContent] = useState(initialContent);
  const [publishMode, setPublishMode] = useState(initialPublishMode);
  const [activeTab, setActiveTab] = useState<AdminTab>("home");
  const [selectedProductId, setSelectedProductId] = useState(initialContent.products[0]?.id ?? "");
  const [adminToken, setAdminToken] = useState("");
  const [status, setStatus] = useState("Ready");
  const [busy, setBusy] = useState(false);

  const selectedProduct = useMemo(
    () => content.products.find((product) => product.id === selectedProductId) ?? content.products[0],
    [content.products, selectedProductId]
  );

  function updateHome<K extends keyof CatalogContent["homeContent"]["hero"]>(key: K, value: CatalogContent["homeContent"]["hero"][K]) {
    setContent((current) => ({
      ...current,
      homeContent: {
        ...current.homeContent,
        hero: {
          ...current.homeContent.hero,
          [key]: value
        }
      }
    }));
  }

  function updateProduct(productId: string, patch: Partial<Product>) {
    setContent((current) => ({
      ...current,
      products: current.products.map((product) => (product.id === productId ? { ...product, ...patch } : product))
    }));
  }

  function updateCategory(categoryId: string, patch: Partial<Category>) {
    setContent((current) => ({
      ...current,
      categories: current.categories.map((category) => (category.id === categoryId ? { ...category, ...patch } : category))
    }));
  }

  function addProduct() {
    const index = content.products.length + 1;
    const id = `prod-new-${Date.now()}`;
    const firstCategory = content.categories[0]?.id ?? "";
    const firstCollection = content.collections[0]?.id ?? "";
    const product: Product = {
      id,
      slug: `new-product-${index}`,
      name: `New Product ${index}`,
      sku: `REF-NEW-${String(index).padStart(3, "0")}`,
      categoryId: firstCategory,
      collectionId: firstCollection,
      material: "Enamel porcelain",
      color: "To be confirmed",
      finish: "Gloss enamel",
      moq: 1,
      leadTime: "Sales team to confirm",
      availability: "waiting-list",
      customizable: true,
      marketFit: ["Europe", "Retail", "Importer"],
      usage: ["Buyer preview"],
      style: "Enamel porcelain",
      tags: ["New Piece"],
      description: "Product description to be confirmed.",
      images: [{ src: "/images/phase1/plum-lidded-censer.png", alt: "New enamel porcelain product" }],
      specification: blankSpec,
      attributes: [{ label: "Sales status", value: "Waiting list" }],
      packagingInfo: ["Dimensions on request.", "Packing photos available.", "MOQ and sample options by sales."],
      status: "draft",
      sortOrder: index,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setContent((current) => ({ ...current, products: [...current.products, product] }));
    setSelectedProductId(id);
    setActiveTab("products");
  }

  function removeProduct(productId: string) {
    setContent((current) => ({
      ...current,
      homeContent: {
        ...current.homeContent,
        featuredProductIds: current.homeContent.featuredProductIds.filter((id) => id !== productId)
      },
      products: current.products.filter((product) => product.id !== productId)
    }));
  }

  function addCategory() {
    const index = content.categories.length + 1;
    const category: Category = {
      id: `cat-new-${Date.now()}`,
      name: `New Category ${index}`,
      slug: `new-category-${index}`,
      description: "Category description.",
      coverImage: "/images/phase1/plum-lidded-censer.png",
      sortOrder: index,
      status: "published"
    };

    setContent((current) => ({ ...current, categories: [...current.categories, category] }));
  }

  function removeCategory(categoryId: string) {
    setContent((current) => ({
      ...current,
      categories: current.categories.filter((category) => category.id !== categoryId),
      products: current.products.map((product) =>
        product.categoryId === categoryId ? { ...product, categoryId: current.categories.find((category) => category.id !== categoryId)?.id ?? "" } : product
      )
    }));
  }

  function toggleFeaturedProduct(productId: string) {
    setContent((current) => {
      const exists = current.homeContent.featuredProductIds.includes(productId);
      return {
        ...current,
        homeContent: {
          ...current.homeContent,
          featuredProductIds: exists
            ? current.homeContent.featuredProductIds.filter((id) => id !== productId)
            : [...current.homeContent.featuredProductIds, productId]
        }
      };
    });
  }

  async function saveContent() {
    setBusy(true);
    setStatus("Saving content...");
    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(adminToken ? { "x-admin-token": adminToken } : {})
        },
        body: JSON.stringify(content)
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Save failed.");
      }

      setPublishMode(result.publishMode ?? publishMode);
      setStatus(result.publishMode === "github" ? "Saved to GitHub. Vercel should rebuild from main." : "Saved locally. Commit and push to publish.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadImage(file: File, onUploaded: (src: string, alt: string) => void) {
    setBusy(true);
    setStatus("Uploading image...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: adminToken ? { "x-admin-token": adminToken } : undefined,
        body: formData
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "Upload failed.");
      }

      onUploaded(result.src, result.alt);
      setPublishMode(result.publishMode ?? publishMode);
      setStatus(result.publishMode === "github" ? "Image uploaded to GitHub. Save content to use it." : "Image uploaded locally. Save content to use it.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="admin-console">
      <aside className="admin-sidebar">
        <div>
          <span className="section-kicker">Content Admin</span>
          <h1>Catalog control</h1>
          <p>Update the homepage, featured pieces, products, categories and sales status without changing code.</p>
        </div>

        <nav aria-label="Admin sections">
          {[
            ["home", "Homepage"],
            ["products", "Products"],
            ["categories", "Categories"],
            ["strategy", "Storage Plan"]
          ].map(([value, label]) => (
            <button className={activeTab === value ? "is-active" : ""} key={value} type="button" onClick={() => setActiveTab(value as AdminTab)}>
              {label}
            </button>
          ))}
        </nav>

        <label>
          Admin token
          <input type="password" value={adminToken} onChange={(event) => setAdminToken(event.target.value)} placeholder="Required after Vercel config" />
        </label>

        <div className="admin-sidebar__status">
          <span>{publishMode === "github" ? "GitHub publish mode" : "Local file mode"}</span>
          <p>{status}</p>
        </div>

        <button className="btn btn-primary" type="button" onClick={saveContent} disabled={busy}>
          <Save size={16} aria-hidden="true" />
          {busy ? "Working..." : "Save Changes"}
        </button>
      </aside>

      <div className="admin-workspace">
        {activeTab === "home" ? (
          <div className="admin-panel">
            <div className="admin-panel__heading">
              <div>
                <span className="section-kicker">Homepage</span>
                <h2>Banner and featured shelf</h2>
              </div>
            </div>

            <div className="admin-form-grid">
              <label>
                Banner title
                <input value={content.homeContent.hero.title} onChange={(event) => updateHome("title", event.target.value)} />
              </label>
              <label>
                Subtitle
                <input value={content.homeContent.hero.subtitle} onChange={(event) => updateHome("subtitle", event.target.value)} />
              </label>
              <label>
                Primary CTA
                <input value={content.homeContent.hero.primaryCta} onChange={(event) => updateHome("primaryCta", event.target.value)} />
              </label>
              <label>
                Secondary CTA
                <input value={content.homeContent.hero.secondaryCta} onChange={(event) => updateHome("secondaryCta", event.target.value)} />
              </label>
            </div>

      <ImageField
        label="Banner image"
        src={content.homeContent.hero.image}
        onChange={(src) => updateHome("image", src)}
        onUpload={uploadImage}
      />

            <div className="admin-product-picklist">
              <h3>Featured products</h3>
              {content.products.map((product) => (
                <label className="admin-check-row" key={product.id}>
                  <input
                    checked={content.homeContent.featuredProductIds.includes(product.id)}
                    type="checkbox"
                    onChange={() => toggleFeaturedProduct(product.id)}
                  />
                  <span>{product.name}</span>
                  <small>{product.availability}</small>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        {activeTab === "products" && selectedProduct ? (
          <div className="admin-panel">
            <div className="admin-panel__heading">
              <div>
                <span className="section-kicker">Products</span>
                <h2>Product content</h2>
              </div>
              <button className="btn btn-secondary" type="button" onClick={addProduct}>
                <Plus size={16} aria-hidden="true" />
                Add Product
              </button>
            </div>

            <div className="admin-product-layout">
              <div className="admin-list">
                {content.products.map((product) => (
                  <button
                    className={selectedProduct.id === product.id ? "is-active" : ""}
                    key={product.id}
                    type="button"
                    onClick={() => setSelectedProductId(product.id)}
                  >
                    <span>{product.name}</span>
                    <small>{product.status} / {product.availability}</small>
                  </button>
                ))}
              </div>

              <ProductEditor
                categories={content.categories}
                product={selectedProduct}
                onChange={(patch) => updateProduct(selectedProduct.id, patch)}
                onRemove={() => removeProduct(selectedProduct.id)}
                onUpload={uploadImage}
              />
            </div>
          </div>
        ) : null}

        {activeTab === "categories" ? (
          <div className="admin-panel">
            <div className="admin-panel__heading">
              <div>
                <span className="section-kicker">Categories</span>
                <h2>Product categories</h2>
              </div>
              <button className="btn btn-secondary" type="button" onClick={addCategory}>
                <Plus size={16} aria-hidden="true" />
                Add Category
              </button>
            </div>

            <div className="admin-category-list">
              {content.categories.map((category) => (
                <article key={category.id}>
                  <div className="admin-form-grid">
                    <label>
                      Name
                      <input value={category.name} onChange={(event) => updateCategory(category.id, { name: event.target.value })} />
                    </label>
                    <label>
                      Slug
                      <input value={category.slug} onChange={(event) => updateCategory(category.id, { slug: event.target.value })} />
                    </label>
                    <label>
                      Sort
                      <input
                        min={1}
                        type="number"
                        value={category.sortOrder}
                        onChange={(event) => updateCategory(category.id, { sortOrder: Number(event.target.value) })}
                      />
                    </label>
                    <label>
                      Status
                      <select value={category.status} onChange={(event) => updateCategory(category.id, { status: event.target.value as Category["status"] })}>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                        <option value="archived">Archived</option>
                      </select>
                    </label>
                  </div>
                  <label>
                    Description
                    <textarea value={category.description} onChange={(event) => updateCategory(category.id, { description: event.target.value })} />
                  </label>
                  <ImageField
                    label="Cover image"
                    src={category.coverImage}
                    onChange={(src) => updateCategory(category.id, { coverImage: src })}
                    onUpload={uploadImage}
                  />
                  <button className="icon-button" type="button" onClick={() => removeCategory(category.id)}>
                    <Trash2 size={16} aria-hidden="true" />
                    <span className="sr-only">Remove category</span>
                  </button>
                </article>
              ))}
            </div>
          </div>
        ) : null}

        {activeTab === "strategy" ? (
          <div className="admin-panel admin-strategy">
            <span className="section-kicker">Recommended architecture</span>
            <h2>Fast content updates now, object storage later</h2>
            <p>
              This version uses GitHub as the content source so every edit is versioned and can trigger Vercel deployment. It is the quickest path from
              prototype to a maintainable product catalog.
            </p>
            {contentStorageNotes.map((note) => (
              <article key={note}>
                <h3>{note.split(":")[0]}</h3>
                <p>{note}</p>
              </article>
            ))}
            <div className="admin-storage-grid">
              <article>
                <h3>GitHub content backend</h3>
                <p>Best for this phase. Free, versioned, simple. Avoid very large original images; keep product photos web-optimized.</p>
              </article>
              <article>
                <h3>Sanity / Payload CMS</h3>
                <p>Best once operators need editorial workflows, roles, drafts and structured media management.</p>
              </article>
              <article>
                <h3>Cloudflare R2 / Supabase Storage</h3>
                <p>Best when image volume grows. There is no truly unlimited free storage; these services give predictable object storage paths.</p>
              </article>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function ProductEditor({
  categories,
  product,
  onChange,
  onRemove,
  onUpload
}: {
  categories: Category[];
  product: Product;
  onChange: (patch: Partial<Product>) => void;
  onRemove: () => void;
  onUpload: (file: File, onUploaded: (src: string, alt: string) => void) => Promise<void>;
}) {
  function updateList(key: "usage" | "tags" | "packagingInfo", value: string) {
    onChange({ [key]: value.split("\n").map((item) => item.trim()).filter(Boolean) } as Partial<Product>);
  }

  return (
    <div className="admin-editor">
      <div className="admin-form-grid">
        <label>
          Product name
          <input value={product.name} onChange={(event) => onChange({ name: event.target.value })} />
        </label>
        <label>
          Slug
          <input value={product.slug} onChange={(event) => onChange({ slug: event.target.value })} />
        </label>
        <label>
          SKU
          <input value={product.sku} onChange={(event) => onChange({ sku: event.target.value })} />
        </label>
        <label>
          Category
          <select value={product.categoryId} onChange={(event) => onChange({ categoryId: event.target.value })}>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          Availability
          <select value={product.availability} onChange={(event) => onChange({ availability: event.target.value as Product["availability"] })}>
            {availabilityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
        <label>
          Status
          <select value={product.status} onChange={(event) => onChange({ status: event.target.value as Product["status"] })}>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </label>
        <label>
          Sort order
          <input min={1} type="number" value={product.sortOrder} onChange={(event) => onChange({ sortOrder: Number(event.target.value) })} />
        </label>
        <label>
          MOQ
          <input min={1} type="number" value={product.moq} onChange={(event) => onChange({ moq: Number(event.target.value) })} />
        </label>
      </div>

      <div className="admin-form-grid">
        <label>
          Material
          <input value={product.material} onChange={(event) => onChange({ material: event.target.value })} />
        </label>
        <label>
          Color
          <input value={product.color} onChange={(event) => onChange({ color: event.target.value })} />
        </label>
        <label>
          Finish
          <input value={product.finish} onChange={(event) => onChange({ finish: event.target.value })} />
        </label>
        <label>
          Lead time
          <input value={product.leadTime} onChange={(event) => onChange({ leadTime: event.target.value })} />
        </label>
      </div>

      <label>
        Description
        <textarea value={product.description} onChange={(event) => onChange({ description: event.target.value })} />
      </label>

      <ImageField
        label="Main image"
        src={product.images[0]?.src ?? ""}
        onChange={(src, alt) =>
          onChange({
            images: [{ src, alt: alt || product.images[0]?.alt || product.name }, ...product.images.slice(1)]
          })
        }
        onUpload={onUpload}
      />

      <div className="admin-image-list">
        <div className="admin-subhead">
          <h3>Gallery images</h3>
          <label className="admin-upload-button">
            <ImageUp size={16} aria-hidden="true" />
            Upload gallery
            <input
              accept="image/*"
              multiple
              type="file"
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                if (files.length === 0) {
                  return;
                }
                let nextImages = product.images;
                void (async () => {
                  for (const file of files) {
                    await onUpload(file, (src, alt) => {
                      nextImages = [...nextImages, { src, alt: alt || product.name }];
                    });
                  }
                  onChange({ images: nextImages });
                })();
                event.target.value = "";
              }}
            />
          </label>
        </div>
        {product.images.map((image, index) => (
          <div className="admin-image-row" key={`${image.src}-${index}`}>
            <input
              value={image.src}
              onChange={(event) =>
                onChange({
                  images: product.images.map((candidate, imageIndex) => (imageIndex === index ? { ...candidate, src: event.target.value } : candidate))
                })
              }
            />
            <input
              value={image.alt}
              onChange={(event) =>
                onChange({
                  images: product.images.map((candidate, imageIndex) => (imageIndex === index ? { ...candidate, alt: event.target.value } : candidate))
                })
              }
            />
            <button
              className="icon-button"
              type="button"
              onClick={() => onChange({ images: product.images.filter((_, imageIndex) => imageIndex !== index) })}
            >
              <Trash2 size={16} aria-hidden="true" />
              <span className="sr-only">Remove image</span>
            </button>
          </div>
        ))}
        <button className="btn btn-secondary" type="button" onClick={() => onChange({ images: [...product.images, { src: "", alt: product.name }] })}>
          <Plus size={16} aria-hidden="true" />
          Add Gallery Image
        </button>
      </div>

      <div className="admin-form-grid">
        <label>
          Usage, one per line
          <textarea value={product.usage.join("\n")} onChange={(event) => updateList("usage", event.target.value)} />
        </label>
        <label>
          Tags, one per line
          <textarea value={product.tags.join("\n")} onChange={(event) => updateList("tags", event.target.value)} />
        </label>
        <label>
          Packaging notes, one per line
          <textarea value={product.packagingInfo.join("\n")} onChange={(event) => updateList("packagingInfo", event.target.value)} />
        </label>
      </div>

      <div className="admin-image-list">
        <h3>Custom attributes</h3>
        {product.attributes.map((attribute, index) => (
          <div className="admin-image-row" key={`${attribute.label}-${index}`}>
            <input
              value={attribute.label}
              placeholder="Label"
              onChange={(event) =>
                onChange({
                  attributes: product.attributes.map((candidate, attributeIndex) =>
                    attributeIndex === index ? { ...candidate, label: event.target.value } : candidate
                  )
                })
              }
            />
            <input
              value={attribute.value}
              placeholder="Value"
              onChange={(event) =>
                onChange({
                  attributes: product.attributes.map((candidate, attributeIndex) =>
                    attributeIndex === index ? { ...candidate, value: event.target.value } : candidate
                  )
                })
              }
            />
            <button
              className="icon-button"
              type="button"
              onClick={() => onChange({ attributes: product.attributes.filter((_, attributeIndex) => attributeIndex !== index) })}
            >
              <Trash2 size={16} aria-hidden="true" />
              <span className="sr-only">Remove attribute</span>
            </button>
          </div>
        ))}
        <button className="btn btn-secondary" type="button" onClick={() => onChange({ attributes: [...product.attributes, { label: "", value: "" }] })}>
          <Plus size={16} aria-hidden="true" />
          Add Attribute
        </button>
      </div>

      <button className="btn btn-secondary danger-button" type="button" onClick={onRemove}>
        <Trash2 size={16} aria-hidden="true" />
        Remove Product
      </button>
    </div>
  );
}

function ImageField({
  label,
  src,
  onChange,
  onUpload
}: {
  label: string;
  src: string;
  onChange: (src: string, alt?: string) => void;
  onUpload: (file: File, onUploaded: (src: string, alt: string) => void) => Promise<void>;
}) {
  function handleUpload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    void onUpload(file, (nextSrc, alt) => onChange(nextSrc, alt));
    event.target.value = "";
  }

  return (
    <div className="admin-image-field">
      {src ? (
        <div className="admin-image-preview">
          <Image src={src} alt="" fill unoptimized sizes="180px" />
        </div>
      ) : (
        <div className="admin-image-preview admin-image-preview--empty">No image</div>
      )}
      <label>
        {label} path
        <input value={src} onChange={(event) => onChange(event.target.value)} placeholder="/images/example.png" />
      </label>
      <label className="admin-upload-button">
        <ImageUp size={16} aria-hidden="true" />
        Upload / Replace
        <input accept="image/*" type="file" onChange={handleUpload} />
      </label>
    </div>
  );
}
