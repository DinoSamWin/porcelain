"use client";

import { ArrowLeft, ExternalLink, ImageUp, Inbox, LogOut, Maximize2, Plus, RefreshCw, Save, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import type { CatalogContent } from "@/data/catalog";
import { availabilityOptions } from "@/lib/catalog-options";
import type { InquiryRecord, Product } from "@/types/domain";

type PublishMode = "github" | "local";
type AdminView = "list" | "editor" | "inquiries";
type ProductPatch = Partial<Product> | ((product: Product) => Partial<Product>);
type ProductChangeHandler = (patch: ProductPatch) => void;
type UploadTaskStatus = "uploading" | "processing" | "done" | "error";

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

interface DeployHookResult {
  configured: boolean;
  ok?: boolean;
  error?: string;
}

interface UploadTask {
  id: string;
  label: string;
  fileName: string;
  progress: number;
  status: UploadTaskStatus;
  error?: string;
}

interface UploadOptions {
  label?: string;
}

interface AdminUploadResponse {
  ok?: boolean;
  src?: string;
  alt?: string;
  publishMode?: PublishMode;
  runtime?: RuntimeStatus;
  error?: string;
}

interface AdminInquiriesResponse {
  ok?: boolean;
  inquiries?: InquiryRecord[];
  publishMode?: PublishMode;
  runtime?: RuntimeStatus;
  error?: string;
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

const adminTokenStorageKey = "aurelia-admin-token";

const imageSizeGuides = [
  {
    title: "商品主图 / 首页推荐 / 商品列表",
    size: "1600 x 2000 px",
    note: "4:5 竖图，主体完整居中，四周留 8%-12% 呼吸空间。"
  },
  {
    title: "商品详情图",
    size: "2000 x 2500 px",
    note: "4:5 竖图或 2000 x 2000 px 方图，用于细节、侧面、局部特写。"
  },
  {
    title: "首页 Banner 桌面图",
    size: "2880 x 1400 px",
    note: "约 2:1 横图，主体放在右侧或中间偏右，左侧保留文字安全区。"
  },
  {
    title: "首页 Banner 移动图",
    size: "1600 x 2200 px",
    note: "竖图，主体居中偏上，底部避免重要信息被按钮遮挡。"
  }
];

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function createBlankProduct({
  id,
  index,
  categoryId,
  collectionId,
  src,
  alt
}: {
  id: string;
  index: number;
  categoryId: string;
  collectionId: string;
  src?: string;
  alt?: string;
}): Product {
  const now = new Date().toISOString();

  return {
    id,
    slug: `product-${index}`,
    name: `新商品 ${index}`,
    sku: `SKU-${String(index).padStart(3, "0")}`,
    categoryId,
    collectionId,
    material: "",
    color: "",
    finish: "",
    moq: 1,
    leadTime: "待确认",
    availability: "in-stock",
    customizable: false,
    marketFit: ["Europe", "Retail", "Importer"],
    usage: [],
    style: "珐琅瓷",
    tags: [],
    description: "",
    images: src ? [{ src, alt: alt || "商品图片" }] : [],
    specification: { ...blankSpec },
    attributes: [],
    packagingInfo: ["尺寸待确认", "包装待确认"],
    status: "draft",
    sortOrder: index,
    isFeatured: false,
    featuredOrder: index,
    isHeroBanner: false,
    heroOrder: index,
    createdAt: now,
    updatedAt: now
  };
}

function uploadFileWithProgress(
  file: File,
  adminToken: string,
  onProgress: (payload: { progress: number; status?: UploadTaskStatus }) => void
) {
  return new Promise<AdminUploadResponse>((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);

    const request = new XMLHttpRequest();
    request.open("POST", "/api/admin/upload");
    request.setRequestHeader("x-admin-token", adminToken);

    request.upload.onprogress = (event) => {
      if (!event.lengthComputable) {
        onProgress({ progress: 35, status: "uploading" });
        return;
      }

      const progress = Math.min(92, Math.max(1, Math.round((event.loaded / event.total) * 92)));
      onProgress({ progress, status: "uploading" });
    };

    request.upload.onload = () => {
      onProgress({ progress: 95, status: "processing" });
    };

    request.onload = () => {
      const result = parseUploadResponse(request.responseText);
      if (request.status >= 200 && request.status < 300) {
        resolve(result);
        return;
      }

      reject(createUploadError(result.error ?? `上传失败：服务器返回 ${request.status}`, result.runtime));
    };

    request.onerror = () => {
      reject(createUploadError("上传失败：网络连接中断，请稍后重试。"));
    };

    request.onabort = () => {
      reject(createUploadError("上传已取消。"));
    };

    request.send(formData);
  });
}

function parseUploadResponse(responseText: string): AdminUploadResponse {
  try {
    return JSON.parse(responseText || "{}") as AdminUploadResponse;
  } catch {
    return { ok: false, error: "上传失败：服务器返回内容无法解析。" };
  }
}

function createUploadError(message: string, runtime?: RuntimeStatus) {
  return Object.assign(new Error(message), { runtime });
}

function getUploadError(error: unknown): { message: string; runtime?: RuntimeStatus } {
  if (error instanceof Error) {
    return {
      message: error.message,
      runtime: (error as Error & { runtime?: RuntimeStatus }).runtime
    };
  }

  return { message: "上传失败" };
}

export function AdminContentManager() {
  const [adminToken, setAdminToken] = useState("");
  const [loggedIn, setLoggedIn] = useState(false);
  const [content, setContent] = useState<CatalogContent>(emptyContent);
  const [publishMode, setPublishMode] = useState<PublishMode>("local");
  const [runtime, setRuntime] = useState<RuntimeStatus | null>(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [adminView, setAdminView] = useState<AdminView>("list");
  const [status, setStatus] = useState("请输入后台密码登录");
  const [publishNotice, setPublishNotice] = useState("");
  const [localPreviews, setLocalPreviews] = useState<LocalPreview[]>([]);
  const [uploadTasks, setUploadTasks] = useState<UploadTask[]>([]);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [lightboxImage, setLightboxImage] = useState<{ src: string; alt: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const clearUploadTimers = useRef<number[]>([]);

  const selectedProduct = useMemo(
    () => content.products.find((product) => product.id === selectedProductId),
    [content.products, selectedProductId]
  );
  const publishingBlocked = Boolean(runtime && !runtime.canPublishOnline);
  const hasActiveUploads = uploadTasks.some((task) => task.status === "uploading" || task.status === "processing");

  useEffect(() => {
    const savedToken = window.localStorage.getItem(adminTokenStorageKey);
    if (!savedToken) return;

    setAdminToken(savedToken);
    void loginWithToken(savedToken, { remember: false, restoring: true });
  }, []);

  useEffect(() => {
    return () => {
      clearUploadTimers.current.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  async function login() {
    await loginWithToken(adminToken, { remember: true });
  }

  async function loginWithToken(token: string, { remember, restoring = false }: { remember: boolean; restoring?: boolean }) {
    setBusy(true);
    setStatus(restoring ? "正在恢复登录..." : "正在登录...");
    try {
      const response = await fetch("/api/admin/content", {
        headers: { "x-admin-token": token }
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error ?? "登录失败，请检查后台密码");
      }

      setContent(result.content ?? emptyContent);
      setPublishMode(result.publishMode ?? "local");
      setRuntime(result.runtime ?? null);
      setSelectedProductId("");
      setAdminView("list");
      setLoggedIn(true);
      setStatus(getRuntimeStatusText(result.runtime) ?? "已登录，可以上传商品");
      setPublishNotice("");
      void refreshInquiries(token, { silent: true });
      if (remember) {
        window.localStorage.setItem(adminTokenStorageKey, token);
      }
    } catch (error) {
      if (restoring) {
        window.localStorage.removeItem(adminTokenStorageKey);
      }
      setStatus(error instanceof Error ? error.message : "登录失败");
    } finally {
      setBusy(false);
    }
  }

  function createProduct(src?: string, alt?: string) {
    const id = createId("prod");

    setContent((current) => ({
      ...current,
      products: [
        ...current.products,
        createBlankProduct({
          id,
          index: current.products.length + 1,
          categoryId: current.categories[0]?.id ?? "cat-products",
          collectionId: current.collections[0]?.id ?? "col-main",
          src,
          alt
        })
      ]
    }));
    setSelectedProductId(id);
    setAdminView("editor");
  }

  function updateProduct(productId: string, patch: ProductPatch) {
    setContent((current) => ({
      ...current,
      products: current.products.map((product) => {
        if (product.id !== productId) return product;
        const resolvedPatch = typeof patch === "function" ? patch(product) : patch;
        return { ...product, ...resolvedPatch, updatedAt: new Date().toISOString() };
      })
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
    setSelectedProductId("");
    setAdminView("list");
  }

  function openProductEditor(productId: string) {
    setSelectedProductId(productId);
    setAdminView("editor");
  }

  async function uploadImage(file: File, onUploaded: (src: string, alt: string) => Promise<void> | void, options: UploadOptions = {}) {
    const taskId = createId("upload");
    const label = options.label ?? "图片";
    const previewSrc = URL.createObjectURL(file);

    setUploadTasks((current) => [
      {
        id: taskId,
        label,
        fileName: file.name,
        progress: 1,
        status: "uploading"
      },
      ...current
    ]);
    setStatus(`${label} 已加入上传队列，可以继续选择其它图片。`);
    setPublishNotice("");

    try {
      const result = await uploadFileWithProgress(file, adminToken, ({ progress, status: taskStatus }) => {
        setUploadTasks((current) =>
          current.map((task) => (task.id === taskId ? { ...task, progress, status: taskStatus ?? task.status } : task))
        );
      });
      if (result.runtime) setRuntime(result.runtime);

      const uploadedSrc = result.src;
      if (!uploadedSrc) {
        throw new Error(result.error ?? "上传失败");
      }

      await onUploaded(uploadedSrc, result.alt ?? "");
      setLocalPreviews((current) => [...current.filter((preview) => preview.remoteSrc !== uploadedSrc), { remoteSrc: uploadedSrc, previewSrc }]);
      setPublishMode(result.publishMode ?? publishMode);
      setUploadTasks((current) =>
        current.map((task) => (task.id === taskId ? { ...task, progress: 100, status: "done" } : task))
      );
      setStatus(`${label} 上传完成；点保存发布后会进入线上发布流程。`);
      clearFinishedUploadTask(taskId);
    } catch (error) {
      URL.revokeObjectURL(previewSrc);
      const uploadError = getUploadError(error);
      if (uploadError.runtime) setRuntime(uploadError.runtime);
      setUploadTasks((current) =>
        current.map((task) => (task.id === taskId ? { ...task, progress: 100, status: "error", error: uploadError.message } : task))
      );
      setStatus(uploadError.message);
    }
  }

  function clearFinishedUploadTask(taskId: string) {
    const timer = window.setTimeout(() => {
      setUploadTasks((current) => current.filter((task) => task.id !== taskId || task.status === "error"));
    }, 8000);
    clearUploadTimers.current = [...clearUploadTimers.current, timer];
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
      const deployHook = result.deployHook as DeployHookResult | undefined;
      setStatus(getSaveStatusText(result.publishMode, deployHook));
      setPublishNotice(getSaveNoticeText(result.publishMode, deployHook));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "保存失败");
    } finally {
      setBusy(false);
    }
  }

  async function refreshInquiries(token = adminToken, options: { silent?: boolean } = {}) {
    if (!options.silent) {
      setBusy(true);
      setStatus("正在读取意向单记录...");
    }

    try {
      const response = await fetch("/api/admin/inquiries", {
        headers: { "x-admin-token": token }
      });
      const result = (await response.json()) as AdminInquiriesResponse;
      if (result.runtime) setRuntime(result.runtime);
      if (!response.ok) {
        throw new Error(result.error ?? "读取意向单失败");
      }

      setInquiries(result.inquiries ?? []);
      if (!options.silent) {
        setStatus(`已读取 ${result.inquiries?.length ?? 0} 条意向单记录`);
      }
    } catch (error) {
      if (!options.silent) {
        setStatus(error instanceof Error ? error.message : "读取意向单失败");
      }
    } finally {
      if (!options.silent) {
        setBusy(false);
      }
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
    <main className="admin-dashboard-page">
      <aside className="admin-dashboard-sidebar">
        <div className="admin-dashboard-brand">
          <span>AC</span>
          <div>
            <strong>Aurelia CMS</strong>
            <small>Catalog Admin</small>
          </div>
        </div>
        <nav aria-label="后台导航">
          <button className={adminView === "list" || adminView === "editor" ? "is-active" : ""} type="button" onClick={() => setAdminView("list")}>
            商品管理
          </button>
          <button
            className={adminView === "inquiries" ? "is-active" : ""}
            type="button"
            onClick={() => {
              setAdminView("inquiries");
              void refreshInquiries();
            }}
          >
            意向单记录
          </button>
        </nav>
        <div className="admin-dashboard-help">
          <span>当前模式</span>
          <strong>{getPublishModeLabel(publishMode, runtime)}</strong>
          <p>商品可以先保存为草稿，确认后再发布到前台。</p>
        </div>
      </aside>

      <section className="admin-dashboard-main">
        <header className="admin-simple-header">
          <div>
            <span>{getAdminViewKicker(adminView)}</span>
            <h1>{getAdminViewTitle(adminView)}</h1>
          </div>
          <div className="admin-simple-actions">
            {adminView === "editor" ? (
              <button className="btn btn-secondary" type="button" onClick={() => setAdminView("list")}>
                <ArrowLeft size={16} aria-hidden="true" />
                返回商品管理
              </button>
            ) : null}
            {adminView === "inquiries" ? (
              <button className="btn btn-secondary" type="button" onClick={() => void refreshInquiries()} disabled={busy}>
                <RefreshCw size={16} aria-hidden="true" />
                刷新记录
              </button>
            ) : (
              <>
                <button className="btn btn-secondary" type="button" onClick={() => createProduct()}>
                  <Plus size={16} aria-hidden="true" />
                  新建商品
                </button>
                <button className="btn btn-primary" type="button" onClick={saveContent} disabled={busy || publishingBlocked || hasActiveUploads}>
                  <Save size={16} aria-hidden="true" />
                  {busy ? "保存中..." : hasActiveUploads ? "等待上传完成" : "保存发布"}
                </button>
              </>
            )}
            <button
              className="icon-button"
              type="button"
              onClick={() => {
                window.localStorage.removeItem(adminTokenStorageKey);
                setLoggedIn(false);
                setAdminToken("");
                setStatus("请输入后台密码登录");
              }}
            >
              <LogOut size={16} aria-hidden="true" />
              <span className="sr-only">退出</span>
            </button>
          </div>
        </header>

        <div className="admin-simple-status">
          <span>{getPublishModeLabel(publishMode, runtime)}</span>
          <p>{status}</p>
          {uploadTasks.length > 0 ? <UploadQueue tasks={uploadTasks} /> : null}
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

        <div className="admin-workspace">
          {adminView === "inquiries" ? (
            <InquiryRecordsPanel inquiries={inquiries} disabled={busy} onRefresh={() => void refreshInquiries()} />
          ) : adminView === "list" ? (
            <ProductManagementList
              products={content.products}
              localPreviews={localPreviews}
              disabled={busy || publishingBlocked}
              onCreate={() => createProduct()}
              onCreateFromImage={(file) => {
                void uploadImage(file, (src, alt) => createProduct(src, alt), { label: "新商品图片" });
              }}
              onOpen={openProductEditor}
            />
          ) : selectedProduct ? (
            <div className="admin-editor-layout">
              <aside className="admin-editor-side">
                <ProductImagePreview product={selectedProduct} localPreviews={localPreviews} onOpen={setLightboxImage} />
                <div className="admin-editor-side__meta">
                  <span>{selectedProduct.status === "published" ? "已发布" : "草稿"}</span>
                  <strong>{selectedProduct.name}</strong>
                  <p>{getPublishSummary(selectedProduct)}</p>
                </div>
              </aside>
              <div className="admin-editor-scroll">
                <ProductSimpleEditor
                  product={selectedProduct}
                  localPreviews={localPreviews}
                  disabled={busy || publishingBlocked}
                  onChange={(patch) => updateProduct(selectedProduct.id, patch)}
                  onRemove={() => removeProduct(selectedProduct.id)}
                  onUpload={uploadImage}
                />
              </div>
            </div>
          ) : (
            <div className="admin-empty-uploader">
              <ImageUp size={34} aria-hidden="true" />
              <h2>请选择一个商品</h2>
              <p>从商品管理列表进入编辑，或新建一个商品。</p>
              <button className="btn btn-primary" type="button" onClick={() => createProduct()}>
                <Plus size={16} aria-hidden="true" />
                新建商品
              </button>
            </div>
          )}
        </div>
      </section>

      {lightboxImage ? <ImageLightbox image={lightboxImage} onClose={() => setLightboxImage(null)} /> : null}
    </main>
  );
}

function getAdminViewKicker(adminView: AdminView) {
  if (adminView === "inquiries") return "客户线索";
  if (adminView === "editor") return "商品编辑";
  return "商品后台";
}

function getAdminViewTitle(adminView: AdminView) {
  if (adminView === "inquiries") return "意向单记录";
  if (adminView === "editor") return "商品编辑详情页";
  return "商品管理";
}

function InquiryRecordsPanel({
  inquiries,
  disabled,
  onRefresh
}: {
  inquiries: InquiryRecord[];
  disabled: boolean;
  onRefresh: () => void;
}) {
  const sortedInquiries = [...inquiries].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const repeatPeopleCount = sortedInquiries.filter((inquiry) => inquiry.repeat.samePersonTotal > 1 || inquiry.repeat.sameIpTotal > 1).length;

  return (
    <section className="admin-inquiries-panel">
      <div className="admin-inquiries-panel__head">
        <div>
          <span>意向单记录</span>
          <h2>客户提交记录</h2>
          <p>
            共 {sortedInquiries.length} 条记录，{repeatPeopleCount} 条命中同人或同 IP 判断。
          </p>
        </div>
        <button className="btn btn-secondary" type="button" onClick={onRefresh} disabled={disabled}>
          <RefreshCw size={16} aria-hidden="true" />
          刷新记录
        </button>
      </div>

      {sortedInquiries.length === 0 ? (
        <div className="admin-empty-uploader">
          <Inbox size={34} aria-hidden="true" />
          <h2>还没有意向单</h2>
          <p>前台客户提交联系表单或意向清单后，会出现在这里。</p>
        </div>
      ) : (
        <div className="admin-inquiry-list">
          {sortedInquiries.map((inquiry) => (
            <InquiryRecordCard inquiry={inquiry} key={inquiry.id} />
          ))}
        </div>
      )}
    </section>
  );
}

function InquiryRecordCard({ inquiry }: { inquiry: InquiryRecord }) {
  const customerRows: Array<[string, string | undefined]> = [
    ["姓名", inquiry.customer.name],
    ["公司", inquiry.customer.companyName],
    ["国家/地区", inquiry.customer.countryRegion],
    ["邮箱", inquiry.customer.email],
    ["收货目的地", inquiry.customer.shippingDestination]
  ];
  const tradeRows: Array<[string, string | undefined]> = [
    ["目标市场", inquiry.trade.targetMarket],
    ["定制 Logo", inquiry.trade.customLogo],
    ["定制包装", inquiry.trade.customPackaging],
    ["期望交付", inquiry.trade.deliveryTime],
    ["留言", inquiry.message],
    ["跟进要求", inquiry.requirements]
  ];
  const sourceProduct = inquiry.source.sourceProduct;

  return (
    <article className="admin-inquiry-card">
      <header className="admin-inquiry-card__head">
        <div>
          <span>{formatDateTime(inquiry.createdAt)}</span>
          <h3>{inquiry.inquiryId}</h3>
        </div>
        <div className="admin-inquiry-card__badges">
          <span>{getInquiryStatusLabel(inquiry.status)}</span>
          <span>人物ID {inquiry.personId}</span>
          <span>同人 {inquiry.repeat.samePersonTotal} 次</span>
          <span>同IP {inquiry.repeat.sameIpTotal} 次</span>
        </div>
      </header>

      <div className="admin-inquiry-grid">
        <section>
          <h4>重复判断</h4>
          <FieldLine label="访客ID" value={inquiry.visitorId} mono />
          <FieldLine label="IP标识" value={`${inquiry.ipPreview} / ${inquiry.ipFingerprint}`} mono />
          <FieldLine label="设备指纹" value={inquiry.userAgentFingerprint} mono />
          <FieldLine label="设备信息" value={inquiry.userAgentPreview} />
          <FieldLine label="同设备提交" value={`${inquiry.repeat.sameDeviceTotal} 次`} />
          <FieldLine label="同邮箱提交" value={`${inquiry.repeat.sameEmailTotal} 次`} />
        </section>

        <section>
          <h4>来源页面</h4>
          <FieldLine label="来源类型" value={inquiry.source.pageLabel} />
          <FieldLine label="提交页面" value={inquiry.source.submittedFromPath || inquiry.source.submittedFromUrl} />
          <FieldLine label="浏览器上一页" value={inquiry.source.referrer || "无"} />
          {sourceProduct ? (
            <div className="admin-inquiry-source-product">
              <div>
                {sourceProduct.imageSrc ? <AdminPreviewImage src={sourceProduct.imageSrc} alt={sourceProduct.name} sizes="72px" /> : <span>无图</span>}
              </div>
              <div>
                <strong>{sourceProduct.name}</strong>
                <small>{sourceProduct.sku}</small>
                <a href={sourceProduct.productUrl} target="_blank" rel="noreferrer">
                  查看商品详情
                </a>
              </div>
            </div>
          ) : null}
        </section>

        <section>
          <h4>客户字段</h4>
          {customerRows.map(([label, value]) => (
            <FieldLine label={label} value={value} key={label} />
          ))}
        </section>

        <section>
          <h4>贸易 / 留言字段</h4>
          {tradeRows.map(([label, value]) => (
            <FieldLine label={label} value={value} key={label} />
          ))}
        </section>
      </div>

      <section className="admin-inquiry-products">
        <h4>意向商品</h4>
        {inquiry.items.length === 0 ? (
          <p>这条记录没有关联具体商品，只记录提交页面。</p>
        ) : (
          <div>
            {inquiry.items.map((item) => (
              <article key={`${inquiry.id}-${item.productId}`}>
                <div>
                  {item.imageSrc ? <AdminPreviewImage src={item.imageSrc} alt={item.name} sizes="84px" /> : <span>无图</span>}
                </div>
                <div>
                  <strong>{item.name}</strong>
                  <small>{item.sku}</small>
                  <p>数量：{item.quantity}</p>
                  {item.note ? <p>备注：{item.note}</p> : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </article>
  );
}

function FieldLine({ label, value, mono = false }: { label: string; value: string | number | undefined; mono?: boolean }) {
  return (
    <p className="admin-inquiry-field">
      <span>{label}</span>
      <strong className={mono ? "is-mono" : ""}>{value ? value : "未填写"}</strong>
    </p>
  );
}

function getInquiryStatusLabel(status: InquiryRecord["status"]) {
  const labels: Record<InquiryRecord["status"], string> = {
    new: "新线索",
    contacted: "已联系",
    "quotation-sent": "已报价",
    negotiating: "沟通中",
    "converted-to-order": "已转订单",
    closed: "已关闭"
  };
  return labels[status] ?? status;
}

function formatDateTime(value: string) {
  if (!value) return "未知时间";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "未知时间";

  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function UploadQueue({ tasks }: { tasks: UploadTask[] }) {
  const activeCount = tasks.filter((task) => task.status === "uploading" || task.status === "processing").length;

  return (
    <section className="admin-upload-queue" aria-live="polite">
      <div className="admin-upload-queue__head">
        <span>上传队列</span>
        <strong>{activeCount > 0 ? `${activeCount} 个进行中` : "最近上传"}</strong>
      </div>
      <div className="admin-upload-queue__list">
        {tasks.slice(0, 6).map((task) => {
          const progress = Math.min(100, Math.max(0, task.progress));

          return (
            <article className={`admin-upload-task admin-upload-task--${task.status}`} key={task.id}>
              <div className="admin-upload-task__meta">
                <div>
                  <strong>{task.label}</strong>
                  <small>{task.fileName}</small>
                </div>
                <span>{getUploadTaskStatusLabel(task)}</span>
              </div>
              <div
                className="admin-upload-task__bar"
                role="progressbar"
                aria-label={`${task.label} 上传进度`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={progress}
              >
                <span style={{ width: `${progress}%` }} />
              </div>
              {task.error ? <p>{task.error}</p> : null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function getUploadTaskStatusLabel(task: UploadTask) {
  if (task.status === "done") return "完成";
  if (task.status === "error") return "失败";
  if (task.status === "processing") return "处理中";
  return `${task.progress}%`;
}

function ProductManagementList({
  products,
  localPreviews,
  disabled,
  onCreate,
  onCreateFromImage,
  onOpen
}: {
  products: Product[];
  localPreviews: LocalPreview[];
  disabled: boolean;
  onCreate: () => void;
  onCreateFromImage: (file: File) => void;
  onOpen: (productId: string) => void;
}) {
  const publishedCount = products.filter((product) => product.status === "published").length;
  const draftCount = products.filter((product) => product.status === "draft").length;

  return (
    <section className="admin-products-panel">
      <div className="admin-products-panel__head">
        <div>
          <span>商品管理</span>
          <h2>全部商品</h2>
          <p>
            共 {products.length} 个商品，已发布 {publishedCount} 个，草稿 {draftCount} 个。
          </p>
        </div>
        <div className="admin-simple-actions">
          <button className="btn btn-secondary" type="button" onClick={onCreate}>
            <Plus size={16} aria-hidden="true" />
            新建商品
          </button>
          <UploadButton
            disabled={disabled}
            label="上传图片新建商品"
            multiple
            onUpload={(files) => {
              files.forEach((file) => onCreateFromImage(file));
            }}
          />
        </div>
      </div>

      {products.length === 0 ? (
        <div className="admin-empty-uploader">
          <ImageUp size={34} aria-hidden="true" />
          <h2>还没有商品</h2>
          <p>点击新建商品，进入编辑页后上传主图和详情图。</p>
          <button className="btn btn-primary" type="button" onClick={onCreate}>
            <Plus size={16} aria-hidden="true" />
            新建商品
          </button>
        </div>
      ) : (
        <div className="admin-product-table">
          <div className="admin-product-table__row admin-product-table__row--head">
            <span>商品</span>
            <span>状态</span>
            <span>展示位置</span>
            <span>操作</span>
          </div>
          {products.map((product) => (
            <div className="admin-product-table__row" key={product.id}>
              <button className="admin-product-table__product" type="button" onClick={() => onOpen(product.id)}>
                {product.images[0]?.src ? (
                  <span className="admin-simple-thumb">
                    <AdminPreviewImage src={getPreviewSrc(product.images[0].src, localPreviews)} alt="" sizes="68px" />
                  </span>
                ) : (
                  <span className="admin-simple-thumb">无图</span>
                )}
                <span>
                  <strong>{product.name}</strong>
                  <small>{product.sku}</small>
                </span>
              </button>
              <span className={`admin-status-pill admin-status-pill--${product.status}`}>{getProductStatusLabel(product.status)}</span>
              <span className="admin-product-table__summary">{getPublishSummary(product)}</span>
              <button className="btn btn-secondary" type="button" onClick={() => onOpen(product.id)}>
                编辑
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function getPublishSummary(product: Product) {
  const places = [];
  if (product.status === "published") places.push(`列表${product.sortOrder}`);
  if (product.isFeatured) places.push(`推荐${product.featuredOrder ?? product.sortOrder}`);
  if (product.isHeroBanner) places.push(product.bannerImage?.src ? `Banner${product.heroOrder ?? product.sortOrder}` : "Banner待补图");
  return places.length > 0 ? places.join(" / ") : "未发布";
}

function getProductStatusLabel(status: Product["status"]) {
  const labels: Record<Product["status"], string> = {
    draft: "草稿",
    published: "已发布",
    archived: "已归档"
  };
  return labels[status] ?? status;
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

function getSaveStatusText(publishMode: PublishMode, deployHook?: DeployHookResult) {
  if (publishMode !== "github") {
    return "已保存到本地";
  }

  if (deployHook?.ok) {
    return "已保存到 GitHub，并已通知 Vercel 部署";
  }

  if (deployHook?.configured && deployHook.ok === false) {
    return "已保存到 GitHub，但 Vercel 部署触发失败";
  }

  return "已保存到 GitHub，等待 Vercel 部署";
}

function getSaveNoticeText(publishMode: PublishMode, deployHook?: DeployHookResult) {
  if (publishMode !== "github") {
    return "保存成功：本地预览已更新。";
  }

  if (deployHook?.ok) {
    return "发布成功：内容已经写入 GitHub，并已通知 Vercel 开始生产部署。通常 1-3 分钟后前台会显示最新内容。";
  }

  if (deployHook?.configured && deployHook.ok === false) {
    return `内容已经写入 GitHub，但 Vercel Deploy Hook 触发失败：${deployHook.error ?? "请检查 Hook URL 是否正确。"}`;
  }

  return "内容已经写入 GitHub。当前还没有配置 VERCEL_DEPLOY_HOOK_URL，需要 Vercel 自动部署正常工作，或者在 Vercel 里创建 Deploy Hook 后配置到环境变量。";
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
    .filter((product) => product.bannerImage?.src)
    .sort((a, b) => (a.heroOrder ?? a.sortOrder) - (b.heroOrder ?? b.sortOrder))[0];

  return {
    ...content,
    homeContent: {
      ...content.homeContent,
      hero: {
        ...content.homeContent.hero,
        image: heroProduct?.bannerImage?.src ?? ""
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
  onChange: ProductChangeHandler;
  onRemove: () => void;
  onUpload: (file: File, onUploaded: (src: string, alt: string) => Promise<void> | void, options?: UploadOptions) => Promise<void>;
}) {
  function replaceMainImage(src: string, alt: string) {
    onChange((currentProduct) => {
      return {
        images: [{ src, alt: alt || currentProduct.name }, ...currentProduct.images.slice(1)]
      };
    });
  }

  function appendGalleryImages(files: File[]) {
    files.forEach((file, index) => {
      void onUpload(
        file,
        (src, alt) => {
          onChange((currentProduct) => ({
            images: [...currentProduct.images, { src, alt: alt || currentProduct.name }]
          }));
        },
        { label: `详情图 ${index + 1}` }
      );
    });
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
            void onUpload(file, replaceMainImage, { label: "商品主图" });
          }}
        />
        <UploadButton disabled={disabled} label="追加详情图" multiple onUpload={appendGalleryImages} />
      </div>

      <ImageSizeGuide />

      <section className="admin-publish-box">
        <div>
          <span>发布位置</span>
          <p>商品主图只用于商品本身。勾选首页 Banner 后，请继续补充 Banner 专用尺寸素材。</p>
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

      {product.isHeroBanner ? (
        <BannerAssetPanel
          product={product}
          localPreviews={localPreviews}
          disabled={disabled}
          onChange={onChange}
          onUpload={onUpload}
        />
      ) : null}

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
        <input
          value={product.material}
          onChange={(event) => onChange({ material: event.target.value })}
          placeholder="例如：High-Temperature Porcelain with Pure Copper"
        />
      </label>

      <div className="admin-simple-two">
        <label>
          商品颜色
          <input value={product.color} onChange={(event) => onChange({ color: event.target.value })} placeholder="例如：Coral red / Antique gold" />
        </label>
        <label>
          工艺 / 表面效果
          <input value={product.finish} onChange={(event) => onChange({ finish: event.target.value })} placeholder="例如：Gloss enamel with copper trim" />
        </label>
      </div>

      <div className="admin-simple-two">
        <label>
          商品分类
          <input value={product.tags[0] ?? ""} onChange={(event) => onChange({ tags: [event.target.value] })} placeholder="例如：Pen Holder / Vase / Decorative Object" />
        </label>
        <label>
          用途 / 使用场景
          <input
            value={product.usage[0] ?? ""}
            onChange={(event) => onChange({ usage: event.target.value ? [event.target.value] : [] })}
            placeholder="例如：Desk pen holder / Office decor"
          />
        </label>
      </div>

      <label>
        简短说明
        <textarea
          value={product.description}
          onChange={(event) => onChange({ description: event.target.value })}
          placeholder="例如：A handcrafted enamel porcelain pen holder for refined desk and hospitality interiors."
        />
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

function ImageSizeGuide() {
  return (
    <section className="admin-size-guide">
      <div>
        <span>素材尺寸规范</span>
        <p>上传商品时先用商品主图；只有发布到首页 Banner 时，再额外补 Banner 专用图。</p>
      </div>
      <div className="admin-size-guide__grid">
        {imageSizeGuides.map((item) => (
          <article key={item.title}>
            <strong>{item.title}</strong>
            <span>{item.size}</span>
            <p>{item.note}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

function BannerAssetPanel({
  product,
  localPreviews,
  disabled,
  onChange,
  onUpload
}: {
  product: Product;
  localPreviews: LocalPreview[];
  disabled: boolean;
  onChange: ProductChangeHandler;
  onUpload: (file: File, onUploaded: (src: string, alt: string) => Promise<void> | void, options?: UploadOptions) => Promise<void>;
}) {
  const desktopSrc = product.bannerImage?.src ? getPreviewSrc(product.bannerImage.src, localPreviews) : "";
  const mobileSrc = product.mobileBannerImage?.src ? getPreviewSrc(product.mobileBannerImage.src, localPreviews) : "";

  return (
    <section className="admin-banner-assets">
      <div className="admin-banner-assets__heading">
        <div>
          <span>Banner 专用素材</span>
          <p>这里上传的是首页 Banner 图片，不会替换商品主图。</p>
        </div>
      </div>
      <div className="admin-banner-assets__grid">
        <BannerAssetSlot
          title="桌面 Banner"
          size="2880 x 1400 px"
          imageSrc={desktopSrc}
          disabled={disabled}
          uploadLabel={product.bannerImage?.src ? "替换桌面 Banner" : "上传桌面 Banner"}
          onUpload={(file) => {
            void onUpload(file, (src, alt) => onChange({ bannerImage: { src, alt: alt || `${product.name} desktop banner` } }), {
              label: "桌面 Banner"
            });
          }}
        />
        <BannerAssetSlot
          title="移动 Banner"
          size="1600 x 2200 px"
          imageSrc={mobileSrc}
          disabled={disabled}
          uploadLabel={product.mobileBannerImage?.src ? "替换移动 Banner" : "上传移动 Banner"}
          onUpload={(file) => {
            void onUpload(file, (src, alt) => onChange({ mobileBannerImage: { src, alt: alt || `${product.name} mobile banner` } }), {
              label: "移动 Banner"
            });
          }}
        />
      </div>
    </section>
  );
}

function BannerAssetSlot({
  title,
  size,
  imageSrc,
  disabled,
  uploadLabel,
  onUpload
}: {
  title: string;
  size: string;
  imageSrc: string;
  disabled: boolean;
  uploadLabel: string;
  onUpload: (file: File) => void;
}) {
  return (
    <article className="admin-banner-slot">
      <div>
        <strong>{title}</strong>
        <span>{size}</span>
      </div>
      <div className="admin-banner-slot__preview">
        {imageSrc ? <AdminPreviewImage src={imageSrc} alt="" sizes="280px" /> : <span>未上传</span>}
      </div>
      <UploadButton
        disabled={disabled}
        label={uploadLabel}
        onUpload={(files) => {
          const file = files[0];
          if (!file) return;
          onUpload(file);
        }}
      />
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
