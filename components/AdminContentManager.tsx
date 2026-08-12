"use client";

import { ImageUp, LogOut, Plus, Save, Trash2 } from "lucide-react";
import Image from "next/image";
import { useMemo, useState, type ChangeEvent } from "react";
import type { CatalogContent } from "@/data/catalog";
import { availabilityOptions } from "@/lib/catalog-options";
import type { Product } from "@/types/domain";

type PublishMode = "github" | "local";

const emptyContent: CatalogContent = {
  homeContent: {
    hero: {
      title: "Enamel Porcelain Objects",
      subtitle: "Selected enamel porcelain pieces.",
      primaryCta: "Explore",
      secondaryCta: "Contact",
      image: ""
    },
    sellingPoints: [],
    featuredCategoryIds: ["cat-products"],
    featuredProductIds: []
  },
  categories: [
    {
      id: "cat-products",
      name: "商品",
      slug: "products",
      description: "瓷器商品",
      coverImage: "",
      sortOrder: 1,
      status: "published"
    }
  ],
  collections: [
    {
      id: "col-main",
      name: "默认系列",
      slug: "main",
      description: "默认商品系列",
      coverImage: "",
      marketFit: ["Europe", "Retail", "Importer"]
    }
  ],
  products: []
};

const blankSpec = {
  size: "待确认",
  weight: "待确认",
  packaging: "待确认",
  cartonSize: "待确认",
  grossWeight: "待确认",
  netWeight: "待确认"
};

export function AdminContentManager() {
  const [adminToken, setAdminToken] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [content, setContent] = useState<CatalogContent>(emptyContent);
  const [publishMode, setPublishMode] = useState<PublishMode>("local");
  const [selectedProductId, setSelectedProductId] = useState("");
  const [status, setStatus] = useState("请输入后台密码登录");
  const [busy, setBusy] = useState(false);

  const selectedProduct = useMemo(
    () => content.products.find((product) => product.id === selectedProductId) ?? content.products[0],
    [content.products, selectedProductId]
  );

  async function login() {
    setBusy(true);
    setStatus("正在登录...");
    try {
      const response = await fetch("/api/admin/content", {
        headers: { "x-admin-token": adminToken }
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "登录失败，请检查后台密码");
      }

      setContent(result.content ?? emptyContent);
      setPublishMode(result.publishMode ?? "local");
      setSelectedProductId(result.content?.products?.[0]?.id ?? "");
      setLoggedIn(true);
      setStatus("已登录，可以上传商品");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "登录失败");
    } finally {
      setBusy(false);
    }
  }

  function createProduct(src?: string, alt?: string) {
    const index = content.products.length + 1;
    const id = `prod-${Date.now()}`;
    const product: Product = {
      id,
      slug: `product-${index}`,
      name: `新商品 ${index}`,
      sku: `SKU-${String(index).padStart(3, "0")}`,
      categoryId: content.categories[0]?.id ?? "cat-products",
      collectionId: content.collections[0]?.id ?? "col-main",
      material: "待填写",
      color: "待填写",
      finish: "待填写",
      moq: 1,
      leadTime: "待确认",
      availability: "in-stock",
      customizable: false,
      marketFit: ["Europe", "Retail", "Importer"],
      usage: ["商品展示"],
      style: "珐琅瓷",
      tags: ["新品"],
      description: "待填写",
      images: src ? [{ src, alt: alt || "商品图片" }] : [],
      specification: blankSpec,
      attributes: [],
      packagingInfo: ["尺寸待确认", "包装待确认"],
      status: "published",
      sortOrder: index,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setContent((current) => ({
      ...current,
      homeContent: {
        ...current.homeContent,
        hero: {
          ...current.homeContent.hero,
          image: current.homeContent.hero.image || src || ""
        },
        featuredProductIds: current.homeContent.featuredProductIds.length < 3
          ? [...current.homeContent.featuredProductIds, id]
          : current.homeContent.featuredProductIds
      },
      products: [...current.products, product]
    }));
    setSelectedProductId(id);
  }

  function updateProduct(productId: string, patch: Partial<Product>) {
    setContent((current) => ({
      ...current,
      products: current.products.map((product) => (product.id === productId ? { ...product, ...patch } : product))
    }));
  }

  function removeProduct(productId: string) {
    setContent((current) => {
      const products = current.products.filter((product) => product.id !== productId);
      return {
        ...current,
        homeContent: {
          ...current.homeContent,
          featuredProductIds: current.homeContent.featuredProductIds.filter((id) => id !== productId)
        },
        products
      };
    });
    setSelectedProductId(content.products.find((product) => product.id !== productId)?.id ?? "");
  }

  function toggleFeatured(productId: string) {
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

  async function uploadImage(file: File, onUploaded: (src: string, alt: string) => void) {
    setBusy(true);
    setStatus("正在上传图片...");
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "x-admin-token": adminToken },
        body: formData
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "上传失败");
      }

      onUploaded(result.src, result.alt);
      setPublishMode(result.publishMode ?? publishMode);
      setStatus("图片已上传，记得点保存发布");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "上传失败");
    } finally {
      setBusy(false);
    }
  }

  async function saveContent() {
    setBusy(true);
    setStatus("正在保存...");
    try {
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken
        },
        body: JSON.stringify(content)
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "保存失败");
      }

      setPublishMode(result.publishMode ?? publishMode);
      setStatus(result.publishMode === "github" ? "已保存到 GitHub，Vercel 会自动发布" : "已保存到本地");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "保存失败");
    } finally {
      setBusy(false);
    }
  }

  if (!loggedIn) {
    return (
      <main className="admin-minimal-page">
        <section className="admin-login-card">
          <span>后台登录</span>
          <h1>商品上传后台</h1>
          <p>输入你在 Vercel 里配置的 ADMIN_TOKEN。</p>
          <label>
            后台密码
            <input
              autoFocus
              type="password"
              value={adminToken}
              onChange={(event) => setAdminToken(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  void login();
                }
              }}
            />
          </label>
          <button className="btn btn-primary" type="button" onClick={login} disabled={busy || !adminToken}>
            {busy ? "登录中..." : "进入后台"}
          </button>
          <p className="admin-login-card__status">{status}</p>
        </section>
      </main>
    );
  }

  return (
    <main className="admin-minimal-page admin-minimal-page--wide">
      <section className="admin-simple-shell">
        <header className="admin-simple-header">
          <div>
            <span>商品后台</span>
            <h1>上传商品</h1>
          </div>
          <div className="admin-simple-actions">
            <button className="btn btn-secondary" type="button" onClick={() => createProduct()}>
              <Plus size={16} aria-hidden="true" />
              新建空商品
            </button>
            <UploadButton
              disabled={busy}
              label="上传图片新建商品"
              onUpload={(files) => {
                const file = files[0];
                if (!file) return;
                void uploadImage(file, (src, alt) => createProduct(src, alt));
              }}
            />
            <button className="btn btn-primary" type="button" onClick={saveContent} disabled={busy}>
              <Save size={16} aria-hidden="true" />
              保存发布
            </button>
            <button className="icon-button" type="button" onClick={() => setLoggedIn(false)}>
              <LogOut size={16} aria-hidden="true" />
              <span className="sr-only">退出</span>
            </button>
          </div>
        </header>

        <div className="admin-simple-status">
          <span>{publishMode === "github" ? "线上发布模式" : "本地模式"}</span>
          <p>{status}</p>
        </div>

        {content.products.length === 0 ? (
          <div className="admin-empty-uploader">
            <ImageUp size={34} aria-hidden="true" />
            <h2>还没有商品</h2>
            <p>点击上传图片，新商品会自动创建，不需要复制图片路径。</p>
            <UploadButton
              disabled={busy}
              label="上传第一张商品图"
              onUpload={(files) => {
                const file = files[0];
                if (!file) return;
                void uploadImage(file, (src, alt) => createProduct(src, alt));
              }}
            />
          </div>
        ) : (
          <div className="admin-simple-grid">
            <aside className="admin-simple-list">
              {content.products.map((product) => (
                <button
                  className={selectedProduct?.id === product.id ? "is-active" : ""}
                  key={product.id}
                  type="button"
                  onClick={() => setSelectedProductId(product.id)}
                >
                  {product.images[0]?.src ? (
                    <span className="admin-simple-thumb">
                      <Image src={product.images[0].src} alt="" fill unoptimized sizes="68px" />
                    </span>
                  ) : (
                    <span className="admin-simple-thumb">无图</span>
                  )}
                  <span>
                    <strong>{product.name}</strong>
                    <small>{product.sku}</small>
                  </span>
                </button>
              ))}
            </aside>

            {selectedProduct ? (
              <ProductSimpleEditor
                product={selectedProduct}
                isFeatured={content.homeContent.featuredProductIds.includes(selectedProduct.id)}
                onChange={(patch) => updateProduct(selectedProduct.id, patch)}
                onRemove={() => removeProduct(selectedProduct.id)}
                onToggleFeatured={() => toggleFeatured(selectedProduct.id)}
                onUpload={uploadImage}
              />
            ) : null}
          </div>
        )}
      </section>
    </main>
  );
}

function ProductSimpleEditor({
  product,
  isFeatured,
  onChange,
  onRemove,
  onToggleFeatured,
  onUpload
}: {
  product: Product;
  isFeatured: boolean;
  onChange: (patch: Partial<Product>) => void;
  onRemove: () => void;
  onToggleFeatured: () => void;
  onUpload: (file: File, onUploaded: (src: string, alt: string) => Promise<void> | void) => Promise<void>;
}) {
  const mainImage = product.images[0];

  function replaceMainImage(src: string, alt: string) {
    onChange({
      images: [{ src, alt: alt || product.name }, ...product.images.slice(1)]
    });
  }

  function appendGalleryImages(files: File[]) {
    let nextImages = product.images;
    void (async () => {
      for (const file of files) {
        await onUpload(file, (src, alt) => {
          nextImages = [...nextImages, { src, alt: alt || product.name }];
        });
      }
      onChange({ images: nextImages });
    })();
  }

  return (
    <article className="admin-simple-editor">
      <div className="admin-simple-preview">
        {mainImage?.src ? <Image src={mainImage.src} alt="" fill unoptimized sizes="420px" /> : <span>暂无图片</span>}
      </div>

      <div className="admin-simple-form">
        <div className="admin-simple-row">
          <UploadButton
            label="替换主图"
            onUpload={(files) => {
              const file = files[0];
              if (!file) return;
              void onUpload(file, replaceMainImage);
            }}
          />
          <UploadButton label="追加详情图" multiple onUpload={appendGalleryImages} />
          <label className="admin-simple-check">
            <input checked={isFeatured} type="checkbox" onChange={onToggleFeatured} />
            首页推荐
          </label>
        </div>

        <label>
          商品名称
          <input value={product.name} onChange={(event) => onChange({ name: event.target.value })} />
        </label>

        <div className="admin-simple-two">
          <label>
            商品编号
            <input value={product.sku} onChange={(event) => onChange({ sku: event.target.value })} />
          </label>
          <label>
            商品状态
            <select value={product.availability} onChange={(event) => onChange({ availability: event.target.value as Product["availability"] })}>
              {availabilityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        <label>
          商品材质
          <input value={product.material} onChange={(event) => onChange({ material: event.target.value })} />
        </label>

        <label>
          商品分类
          <input value={product.tags[0] ?? ""} onChange={(event) => onChange({ tags: [event.target.value] })} placeholder="例如：香炉 / 花器 / 摆件" />
        </label>

        <label>
          简短说明
          <textarea value={product.description} onChange={(event) => onChange({ description: event.target.value })} />
        </label>

        {product.images.length > 1 ? (
          <div className="admin-simple-gallery">
            {product.images.slice(1).map((image, index) => (
              <div key={`${image.src}-${index}`}>
                <Image src={image.src} alt="" fill unoptimized sizes="96px" />
                <button
                  type="button"
                  onClick={() => onChange({ images: product.images.filter((_, imageIndex) => imageIndex !== index + 1) })}
                >
                  删除
                </button>
              </div>
            ))}
          </div>
        ) : null}

        <button className="btn btn-secondary danger-button" type="button" onClick={onRemove}>
          <Trash2 size={16} aria-hidden="true" />
          删除商品
        </button>
      </div>
    </article>
  );
}

function UploadButton({
  label,
  multiple = false,
  disabled = false,
  onUpload
}: {
  label: string;
  multiple?: boolean;
  disabled?: boolean;
  onUpload: (files: File[]) => void;
}) {
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    if (files.length > 0) {
      onUpload(files);
    }
    event.target.value = "";
  }

  return (
    <label className={disabled ? "admin-simple-upload is-disabled" : "admin-simple-upload"}>
      <ImageUp size={16} aria-hidden="true" />
      {label}
      <input accept="image/*" disabled={disabled} multiple={multiple} type="file" onChange={handleChange} />
    </label>
  );
}
