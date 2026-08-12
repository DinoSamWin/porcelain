import { promises as fs } from "node:fs";
import path from "node:path";
import type { CatalogContent } from "@/data/catalog";
import type { Category, Product } from "@/types/domain";

export const contentFilePath = path.join(process.cwd(), "data", "content.json");
export const uploadDirPath = path.join(process.cwd(), "public", "uploads");

interface GitHubContentResponse {
  sha?: string;
  content?: string;
  encoding?: string;
}

interface ImageUploadPayload {
  fileName: string;
  buffer: Buffer;
}

export async function readCatalogContent() {
  const github = getGitHubConfig();

  if (github) {
    const remote = await getGitHubContent("data/content.json");
    if (remote.content && remote.encoding === "base64") {
      return JSON.parse(Buffer.from(remote.content, "base64").toString("utf8")) as CatalogContent;
    }
  }

  const raw = await fs.readFile(contentFilePath, "utf8");
  return JSON.parse(raw) as CatalogContent;
}

export async function writeCatalogContent(content: CatalogContent) {
  const nextContent = `${JSON.stringify(normalizeCatalogContent(content), null, 2)}\n`;
  const github = getGitHubConfig();

  if (github) {
    await putGitHubContent({
      filePath: "data/content.json",
      content: Buffer.from(nextContent, "utf8"),
      message: "Update catalog content from admin"
    });
    return;
  }

  assertWritableLocalMode();
  await fs.writeFile(contentFilePath, nextContent, "utf8");
}

export async function saveUploadedImage({ fileName, buffer }: ImageUploadPayload) {
  const github = getGitHubConfig();
  const publicPath = `/uploads/${fileName}`;

  if (github) {
    await putGitHubContent({
      filePath: `public/uploads/${fileName}`,
      content: buffer,
      message: `Upload product image ${fileName}`
    });
    return publicPath;
  }

  assertWritableLocalMode();
  await fs.mkdir(uploadDirPath, { recursive: true });
  await fs.writeFile(path.join(uploadDirPath, fileName), buffer);
  return publicPath;
}

export function normalizeCatalogContent(content: CatalogContent): CatalogContent {
  const products = content.products
    .map((product, index) => normalizeProduct(product, index))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const categories = content.categories
    .map((category, index) => normalizeCategory(category, index))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return {
    homeContent: {
      ...content.homeContent,
      featuredProductIds: content.homeContent.featuredProductIds.filter((id) => products.some((product) => product.id === id)),
      featuredCategoryIds: content.homeContent.featuredCategoryIds.filter((id) => categories.some((category) => category.id === id))
    },
    categories,
    collections: content.collections,
    products
  };
}

function normalizeProduct(product: Product, index: number): Product {
  const slug = product.slug || slugify(product.name || product.sku || `product-${index + 1}`);
  const id = product.id || `prod-${slug}`;
  const now = new Date().toISOString();

  return {
    ...product,
    id,
    slug,
    sku: product.sku || `REF-${String(index + 1).padStart(3, "0")}`,
    categoryId: product.categoryId,
    collectionId: product.collectionId,
    moq: Number(product.moq) || 1,
    availability: product.availability ?? "waiting-list",
    marketFit: product.marketFit ?? [],
    usage: product.usage.filter(Boolean),
    tags: product.tags.filter(Boolean),
    images: product.images.filter((image) => image.src),
    attributes: product.attributes.filter((attribute) => attribute.label || attribute.value),
    packagingInfo: product.packagingInfo.filter(Boolean),
    sortOrder: Number(product.sortOrder) || index + 1,
    isFeatured: Boolean(product.isFeatured),
    featuredOrder: Number(product.featuredOrder) || Number(product.sortOrder) || index + 1,
    isHeroBanner: Boolean(product.isHeroBanner),
    heroOrder: Number(product.heroOrder) || Number(product.sortOrder) || index + 1,
    status: product.status ?? "published",
    createdAt: product.createdAt || now,
    updatedAt: now
  };
}

function normalizeCategory(category: Category, index: number): Category {
  const slug = category.slug || slugify(category.name || `category-${index + 1}`);

  return {
    ...category,
    id: category.id || `cat-${slug}`,
    slug,
    sortOrder: Number(category.sortOrder) || index + 1,
    status: category.status ?? "published"
  };
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function assertAdminAccess(request: Request) {
  const configuredToken = process.env.ADMIN_TOKEN;
  const providedToken = request.headers.get("x-admin-token") ?? request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");

  if (!configuredToken) {
    if (isOnlineRuntime()) {
      throw new Error("线上后台还没有配置 ADMIN_TOKEN。请先在 Vercel 环境变量里添加后台密码，并重新部署。");
    }
    return;
  }

  if (providedToken !== configuredToken) {
    throw new Error("后台密码不正确。");
  }
}

export function getPublishMode() {
  return getGitHubConfig({ throwOnInvalid: false }) ? "github" : "local";
}

export function getAdminRuntimeStatus() {
  const onlineRuntime = isOnlineRuntime();
  const githubRepo = parseGitHubRepo(process.env.GITHUB_REPO);
  const missing = onlineRuntime
    ? [
        ["ADMIN_TOKEN", process.env.ADMIN_TOKEN],
        ["GITHUB_TOKEN", process.env.GITHUB_TOKEN],
        ["GITHUB_REPO", process.env.GITHUB_REPO]
      ]
        .filter(([, value]) => !value)
        .map(([key]) => key)
    : [];
  const invalid = process.env.GITHUB_REPO && !githubRepo ? ["GITHUB_REPO 格式应为 owner/repo，例如 DinoSamWin/porcelain"] : [];
  const hasGitHubConfig = Boolean(process.env.GITHUB_TOKEN && githubRepo);

  return {
    publishMode: hasGitHubConfig ? "github" : "local",
    missing,
    invalid,
    branch: process.env.GITHUB_BRANCH || "main",
    isOnlineRuntime: onlineRuntime,
    canPublishOnline: !onlineRuntime || (hasGitHubConfig && missing.length === 0 && invalid.length === 0)
  };
}

function assertWritableLocalMode() {
  if (isOnlineRuntime()) {
    throw new Error(
      "线上后台缺少 GitHub 发布配置。请在 Vercel 环境变量中配置 GITHUB_TOKEN、GITHUB_REPO，并重新部署。GITHUB_BRANCH 不填时默认使用 main。"
    );
  }
}

function isOnlineRuntime() {
  return Boolean(process.env.VERCEL) || process.env.NODE_ENV === "production";
}

function getGitHubConfig({ throwOnInvalid = true } = {}) {
  const token = process.env.GITHUB_TOKEN;
  const repo = parseGitHubRepo(process.env.GITHUB_REPO);

  if (!token || !process.env.GITHUB_REPO) {
    return null;
  }

  if (!repo) {
    if (throwOnInvalid) {
      throw new Error("GITHUB_REPO 格式错误，应填写成 owner/repo，例如 DinoSamWin/porcelain。");
    }
    return null;
  }

  return {
    owner: repo.owner,
    repo: repo.name,
    token,
    branch: process.env.GITHUB_BRANCH || "main"
  };
}

function parseGitHubRepo(repo: string | undefined) {
  if (!repo) {
    return null;
  }

  const [owner, name, extra] = repo.split("/");
  if (!owner || !name || extra) {
    return null;
  }

  return { owner, name };
}

async function getGitHubContent(filePath: string) {
  const github = getGitHubConfig();
  if (!github) {
    throw new Error("GitHub publishing is not configured.");
  }

  const response = await fetch(
    `https://api.github.com/repos/${github.owner}/${github.repo}/contents/${encodeURIComponentPath(filePath)}?ref=${github.branch}`,
    {
      headers: githubHeaders(github.token),
      cache: "no-store"
    }
  );

  if (response.status === 404) {
    return {};
  }

  if (!response.ok) {
    throw new Error(await formatGitHubApiError(response, "读取 GitHub 内容"));
  }

  return (await response.json()) as GitHubContentResponse;
}

async function putGitHubContent({
  filePath,
  content,
  message
}: {
  filePath: string;
  content: Buffer;
  message: string;
}) {
  const github = getGitHubConfig();
  if (!github) {
    throw new Error("GitHub publishing is not configured.");
  }

  const current = await getGitHubContent(filePath);
  const response = await fetch(`https://api.github.com/repos/${github.owner}/${github.repo}/contents/${encodeURIComponentPath(filePath)}`, {
    method: "PUT",
    headers: githubHeaders(github.token),
    body: JSON.stringify({
      message,
      content: content.toString("base64"),
      branch: github.branch,
      sha: current.sha,
      committer: {
        name: process.env.GITHUB_COMMITTER_NAME || "Aurelia Admin",
        email: process.env.GITHUB_COMMITTER_EMAIL || "admin@aureliaceramics.example"
      }
    })
  });

  if (!response.ok) {
    throw new Error(await formatGitHubApiError(response, "保存到 GitHub"));
  }
}

async function formatGitHubApiError(response: Response, action: string) {
  const body = await response.text();
  const githubMessage = parseGitHubErrorMessage(body);

  if (response.status === 401) {
    return `${action}失败：GITHUB_TOKEN 无效或已过期。请重新生成 GitHub Token，更新到 Vercel 环境变量 GITHUB_TOKEN，然后重新部署。`;
  }

  if (response.status === 403 && githubMessage.includes("Resource not accessible by personal access token")) {
    return `${action}失败：当前 GITHUB_TOKEN 没有写入仓库的权限。请在 GitHub Token 里选择仓库 DinoSamWin/porcelain，并把 Repository permissions 里的 Contents 设置为 Read and write；如果仓库属于组织，还需要确认组织已批准这个 Token。更新 Vercel 环境变量后重新部署。`;
  }

  if (response.status === 404) {
    return `${action}失败：没有找到仓库、分支或文件。请确认 GITHUB_REPO 是 DinoSamWin/porcelain，GITHUB_BRANCH 是 main，并且 Token 可以访问这个仓库。`;
  }

  return `${action}失败：GitHub 返回 ${response.status}${githubMessage ? `，${githubMessage}` : ""}。`;
}

function parseGitHubErrorMessage(body: string) {
  try {
    const parsed = JSON.parse(body) as { message?: string };
    return parsed.message ?? body;
  } catch {
    return body;
  }
}

function githubHeaders(token: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28"
  };
}

function encodeURIComponentPath(filePath: string) {
  return filePath.split("/").map(encodeURIComponent).join("/");
}
