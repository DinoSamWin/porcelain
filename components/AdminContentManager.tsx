"use client";

import { ExternalLink, ImageUp, LogOut, Maximize2, Plus, Save, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useMemo, useState, type ChangeEvent } from "react";
import type { CatalogContent } from "@/data/catalog";
import { availabilityOptions } from "@/lib/catalog-options";
import type { Product } from "@/types/domain";

type PublishMode = "github" | "local";

interface RuntimeStatus {
  publishMode: PublishMode;
  missing: string[];
  invalid?: string[];
  branch?: string;
  isOnlineRuntime?: boolean;
  canPublishOnline: boolean;
}

interface LocalPreview {
  remoteSrc: string;
  previewSrc: string;
}

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

const adminAvailabilityLabels: Record<Product["availability"], string> = {
  "in-stock": "现货",
  "made-to-order": "接受定制",
  "pre-order": "期货 / 预订",
  "waiting-list": "需等待"
};

export function AdminContentManager() {
  const [adminToken, setAdminToken] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [content, setContent] = useState<CatalogContent>(emptyContent);
  const [publishMode, setPublishMode] = useState<PublishMode>("local");
  const [runtime, setRuntime] = useState<RuntimeStatus | null>(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [status, setStatus] = useState("请输入后台密码登录");
  const [publishNotice, setPublishNotice] = useState("");
  const [localPreviews, setLocalPreviews] = useState<LocalPreview[]>([]);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  const [busy, setBusy] = useState(false);

  const selectedProduct = useMemo(
    () => content.products.find((product) => product.id === selectedProductId) ?? content.products[0],
    [content.products, selectedProductId]
  );
  const publishingBlocked = Boolean(runtime && !runtime.canPublishOnline);

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
      setRuntime(result.runtime ?? null);
      setSelectedProductId(result.content?.products?.[0]?.id ?? "");
      setLoggedIn(true);
      setStatus(getRuntimeStatusText(result.runtime) ?? "已登录，可以上传商品");
      setPublishNotice("");
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
      isFeatured: false,
      featuredOrder: index,
      isHeroBanner: false,
      heroOrder: index,
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
        }
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

  async function uploadImage(file: File, onUploaded: (src: string, alt: string) => void) {
    setBusy(true);
    setStatus("正在上传图片...");
    setPublishNotice("");
    try {
      const previewSrc = URL.createObjectURL(file);
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/admin/upload", {
        method: "POST",
        headers: { "x-admin-token": adminToken },
        body: formData
      });
      const result = await response.json();
      if (result.runtime) setRuntime(result.runtime);

      if (!response.ok) {
        throw new Error(result.error ?? "上传失败");
      }

      onUploaded(result.src, result.alt);
      setLocalPreviews((current) => [...current.filter((preview) => preview.remoteSrc !== result.src), { remoteSrc: result.src, previewSrc }]);
      setPublishMode(result.publishMode ?? publishMode);
      setStatus("图片已上传，预览先显示本地图片；点保存发布后会进入线上发布流程");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "上传失败");
    } finally {
      setBusy(false);
    }
  }

  async function saveContent() {
    setBusy(true);
    setStatus("正在保存...");
    setPublishNotice("");
    try {
      const contentToSave = normalizePublishContent(content);
      const response = await fetch("/api/admin/content", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-token": adminToken
        },
        body: JSON.stringify(contentToSave)
      });
      const result = await response.json();
      if (result.runtime) setRuntime(result.runtime);

      if (!response.ok) {
        throw new Error(result.error ?? "保存失败");
      }

      setPublishMode(result.publishMode ?? publishMode);
      setContent(contentToSave);
      setStatus(result.publishMode === "github" ? "已保存到 GitHub，Vercel 会自动发布" : "已保存到本地");
      setPublishNotice(
        result.publishMode === "github"
          ? "发布成功：内容已经写入 GitHub。Vercel 通常会在 1-3 分钟内完成部署，部署完成后前台会显示最新商品。"
          : "保存成功：本地预览已更新。"
      );
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
              disabled={busy || publishingBlocked}
              label="上传图片新建商品"
              onUpload={(files) => {
                const file = files[0];
                if (!file) return;
                void uploadImage(file, (src, alt) => createProduct(src, alt));
              }}
            />
            <button className="btn btn-primary" type="button" onClick={saveContent} disabled={busy || publishingBlocked}>
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
          <span>{getPublishModeLabel(publishMode, runtime)}</span>
          <p>{status}</p>
          {publishNotice ? (
            <div className="admin-publish-notice">
              <p>{publishNotice}</p>
              <div>
                <a href="/products" target="_blank" rel="noreferrer">
                  <ExternalLink size={14} aria-hidden="true" />
                  查看前台商品列表
                </a>
                {selectedProduct?.slug ? (
                  <a href={`/products/${selectedProduct.slug}`} target="_blank" rel="noreferrer">
                    <ExternalLink size={14} aria-hidden="true" />
                    查看当前商品详情
                  </a>
                ) : null}
                <a href="https://github.com/DinoSamWin/porcelain/commits/main/" target="_blank" rel="noreferrer">
                  <ExternalLink size={14} aria-hidden="true" />
                  查看 GitHub 提交记录
                </a>
              </div>
            </div>
          ) : null}
          {runtime?.canPublishOnline === false ? (
            <p className="admin-runtime-warning">
              {getRuntimeStatusText(runtime)}配置完成后需要在 Vercel 重新部署。
            </p>
          ) : null}
        </div>

        {content.products.length === 0 ? (
          <div className="admin-empty-uploader">
            <ImageUp size={34} aria-hidden="true" />
            <h2>还没有商品</h2>
            <p>点击上传图片，新商品会自动创建，不需要复制图片路径。</p>
            <UploadButton
              disabled={busy || publishingBlocked}
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
            <aside className="admin-simple-side">
              <div className="admin-simple-list">
                {content.products.map((product) => (
                  <button
                    className={selectedProduct?.id === product.id ? "is-active" : ""}
                    key={product.id}
                    type="button"
                    onClick={() => setSelectedProductId(product.id)}
                  >
                    {product.images[0]?.src ? (
                      <span className="admin-simple-thumb">
                        <AdminPreviewImage src={getPreviewSrc(product.images[0].src, localPreviews)} alt="" sizes="68px" />
                      </span>
                    ) : (
                      <span className="admin-simple-thumb">无图</span>
                    )}
                    <span>
                      <strong>{product.name}</strong>
                      <small>{getPublishSummary(product)}</small>
                    </span>
                  </button>
                ))}
              </div>

              <ProductImagePreview product={selectedProduct} localPreviews={localPreviews} onOpen={setLightboxImage} />
            </aside>

            {selectedProduct ? (
              <ProductSimpleEditor
                product={selectedProduct}
                localPreviews={localPreviews}
                disabled={busy || publishingBlocked}
                onChange={(patch) => updateProduct(selectedProduct.id, patch)}
                onRemove={() => removeProduct(selectedProduct.id)}
                onUpload={uploadImage}
              />
            ) : null}
          </div>
        )}
      </section>

      {lightboxImage ? <ImageLightbox image={lightboxImage} onClose={() => setLightboxImage(null)} /> : null}
    </main>
  );
}

function getPublishSummary(product: Product) {
  const places = [];
  if (product.status === "published") places.push(`列表${product.sortOrder}`);
  if (product.isFeatured) places.push(`推荐${product.featuredOrder ?? product.sortOrder}`);
  if (product.isHeroBanner) places.push(`Banner${product.heroOrder ?? product.sortOrder}`);
  return places.length > 0 ? places.join(" / ") : "未发布";
}

function getPublishModeLabel(publishMode: PublishMode, runtime: RuntimeStatus | null) {
  if (runtime?.isOnlineRuntime && !runtime.canPublishOnline) {
    return "线上发布配置未完成";
  }
  return publishMode === "github" ? "线上发布模式" : "本地模式";
}

function getRuntimeStatusText(runtime?: RuntimeStatus | null) {
  if (!runtime || runtime.canPublishOnline) {
    return null;
  }

  const problems = [...(runtime.missing ?? []), ...(runtime.invalid ?? [])];
  if (problems.length === 0) {
    return "线上发布配置还没有完成。";
  }

  return `线上发布配置缺失或错误：${problems.join("、")}。`;
}

function normalizePublishContent(content: CatalogContent): CatalogContent {
  const publishedProducts = content.products
    .filter((product) => product.status === "published" && product.images[0]?.src)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const featuredProductIds = publishedProducts
    .filter((product) => product.isFeatured)
    .sort((a, b) => (a.featuredOrder ?? a.sortOrder) - (b.featuredOrder ?? b.sortOrder))
    .map((product) => product.id);
  const heroProduct = publishedProducts
    .filter((product) => product.isHeroBanner)
    .sort((a, b) => (a.heroOrder ?? a.sortOrder) - (b.heroOrder ?? b.sortOrder))[0];

  return {
    ...content,
    homeContent: {
      ...content.homeContent,
      hero: {
        ...content.homeContent.hero,
        image: heroProduct?.images[0]?.src ?? content.homeContent.hero.image
      },
      featuredProductIds
    }
  };
}

function ProductSimpleEditor({
  product,
  localPreviews,
  disabled = false,
  onChange,
  onRemove,
  onUpload
}: {
  product: Product;
  localPreviews: LocalPreview[];
  disabled?: boolean;
  onChange: (patch: Partial<Product>) => void;
  onRemove: () => void;
  onUpload: (file: File, onUploaded: (src: string, alt: string) => Promise<void> | void) => Promise<void>;
}) {
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
    <article className="admin-simple-form">
      <div className="admin-simple-row">
        <UploadButton
          disabled={disabled}
          label="替换主图"
          onUpload={(files) => {
            const file = files[0];
            if (!file) return;
            void onUpload(file, replaceMainImage);
          }}
        />
        <UploadButton disabled={disabled} label="追加详情图" multiple onUpload={appendGalleryImages} />
      </div>

      <section className="admin-publish-box">
        <div>
          <span>发布位置</span>
          <p>勾选要展示的位置，数字越小越靠前。</p>
        </div>
        <div className="admin-publish-grid">
          <label className="admin-simple-check">
            <input
              checked={product.status === "published"}
              type="checkbox"
              onChange={(event) => onChange({ status: event.target.checked ? "published" : "draft" })}
            />
            商品列表 / 商品详情
          </label>
          <label>
            列表顺序
            <input min={1} type="number" value={product.sortOrder} onChange={(event) => onChange({ sortOrder: Number(event.target.value) })} />
          </label>
          <label className="admin-simple-check">
            <input
              checked={Boolean(product.isFeatured)}
              type="checkbox"
              onChange={(event) => onChange({ isFeatured: event.target.checked })}
            />
            首页推荐
          </label>
          <label>
            推荐顺序
            <input
              min={1}
              type="number"
              value={product.featuredOrder ?? product.sortOrder}
              onChange={(event) => onChange({ featuredOrder: Number(event.target.value) })}
            />
          </label>
          <label className="admin-simple-check">
            <input
              checked={Boolean(product.isHeroBanner)}
              type="checkbox"
              onChange={(event) => onChange({ isHeroBanner: event.target.checked })}
            />
            首页 Banner
          </label>
          <label>
            Banner 顺序
            <input
              min={1}
              type="number"
              value={product.heroOrder ?? product.sortOrder}
              onChange={(event) => onChange({ heroOrder: Number(event.target.value) })}
            />
          </label>
        </div>
      </section>

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
                {adminAvailabilityLabels[option.value]}
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
              <AdminPreviewImage src={getPreviewSrc(image.src, localPreviews)} alt="" sizes="96px" />
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
    </article>
  );
}

function ProductImagePreview({
  product,
  localPreviews,
  onOpen
}: {
  product: Product | undefined;
  localPreviews: LocalPreview[];
  onOpen: (image: { src: string; alt: string }) => void;
}) {
  const image = product?.images[0];
  const previewSrc = image?.src ? getPreviewSrc(image.src, localPreviews) : "";

  return (
    <section className="admin-left-preview">
      <div>
        <span>主图预览</span>
        {previewSrc ? (
          <button type="button" onClick={() => onOpen({ src: previewSrc, alt: image?.alt || product?.name || "商品图片" })}>
            <Maximize2 size={15} aria-hidden="true" />
            放大
          </button>
        ) : null}
      </div>
      <div className="admin-left-preview__image">
        {previewSrc ? <AdminPreviewImage src={previewSrc} alt={image?.alt || product?.name || ""} sizes="290px" /> : <span>暂无图片</span>}
      </div>
    </section>
  );
}

function ImageLightbox({ image, onClose }: { image: { src: string; alt: string }; onClose: () => void }) {
  return (
    <div className="admin-lightbox" role="dialog" aria-modal="true" aria-label="图片预览">
      <button className="admin-lightbox__backdrop" type="button" aria-label="关闭图片预览" onClick={onClose} />
      <div className="admin-lightbox__panel">
        <button className="admin-lightbox__close" type="button" onClick={onClose}>
          <X size={18} aria-hidden="true" />
          <span className="sr-only">关闭</span>
        </button>
        <AdminPreviewImage src={image.src} alt={image.alt} sizes="90vw" />
      </div>
    </div>
  );
}

function getPreviewSrc(remoteSrc: string, localPreviews: LocalPreview[]) {
  return localPreviews.find((preview) => preview.remoteSrc === remoteSrc)?.previewSrc ?? remoteSrc;
}

function AdminPreviewImage({ src, alt, sizes }: { src: string; alt: string; sizes: string }) {
  if (src.startsWith("blob:")) {
    return <img src={src} alt={alt} />;
  }

  return <Image src={src} alt={alt} fill unoptimized sizes={sizes} />;
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
