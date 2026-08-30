import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { products } from "@/data/catalog";
import { appendInquiryRecord, getAdminRuntimeStatus, readInquiryRecords } from "@/lib/content-admin";
import type { InquiryRecord, InquirySourceProduct, SubmittedInquiryProduct } from "@/types/domain";

export const dynamic = "force-dynamic";

interface InquirySubmitPayload {
  inquiryId?: string;
  visitorId?: string;
  source?: {
    submittedFromUrl?: string;
    submittedFromPath?: string;
    referrer?: string;
    sourceProductId?: string;
    sourceProductSlug?: string;
  };
  customer?: {
    name?: string;
    companyName?: string;
    countryRegion?: string;
    email?: string;
    phone?: string;
    shippingDestination?: string;
    preferredContactMethod?: string;
  };
  trade?: {
    targetMarket?: string;
    volume?: string;
    customLogo?: string;
    customPackaging?: string;
    incoterms?: string;
    deliveryTime?: string;
  };
  message?: string;
  requirements?: string;
  items?: Array<{
    productId?: string;
    quantity?: number;
    note?: string;
  }>;
}

export async function POST(request: Request) {
  try {
    const payload = (await request.json()) as InquirySubmitPayload;
    const existingRecords = await readInquiryRecords();
    const ip = getClientIp(request);
    const userAgent = request.headers.get("user-agent") ?? "unknown";
    const visitorId = getStableVisitorId(payload.visitorId, ip, userAgent);
    const ipFingerprint = ip === "unknown" ? "unknown" : fingerprint(ip);
    const userAgentFingerprint = userAgent === "unknown" ? "unknown" : fingerprint(userAgent);
    const personId = `P-${fingerprint(`${visitorId}:${ipFingerprint}:${userAgentFingerprint}`).slice(0, 10).toUpperCase()}`;
    const customer = normalizeCustomer(payload.customer);
    const sourceProduct = getSourceProduct(payload);
    const submittedFromPath = cleanText(payload.source?.submittedFromPath, 420) || "/";
    const submittedFromUrl = cleanText(payload.source?.submittedFromUrl, 720) || submittedFromPath;
    const createdAt = new Date().toISOString();
    const items = normalizeItems(payload.items, sourceProduct);
    const pageType = getPageType(submittedFromPath, sourceProduct);

    if (!customer.name || !customer.companyName || !customer.countryRegion || !customer.email) {
      return NextResponse.json({ ok: false, error: "请填写姓名、公司、国家/地区和邮箱。" }, { status: 400 });
    }

    const inquiryId = cleanText(payload.inquiryId, 80) || createServerInquiryId();
    const record: InquiryRecord = {
      id: `inquiry-${Date.now()}-${crypto.randomBytes(3).toString("hex")}`,
      inquiryId,
      personId,
      visitorId,
      ipFingerprint,
      ipPreview: maskIp(ip),
      userAgentFingerprint,
      userAgentPreview: summarizeUserAgent(userAgent),
      repeat: {
        samePersonTotal: countBy(existingRecords, (record) => record.personId === personId) + 1,
        sameDeviceTotal: countBy(existingRecords, (record) => record.visitorId === visitorId) + 1,
        sameIpTotal: countBy(existingRecords, (record) => record.ipFingerprint === ipFingerprint && ipFingerprint !== "unknown") + 1,
        sameEmailTotal: countBy(existingRecords, (record) => record.customer.email.toLowerCase() === customer.email.toLowerCase()) + 1
      },
      source: {
        pageType,
        pageLabel: getPageLabel(pageType, sourceProduct),
        submittedFromUrl,
        submittedFromPath,
        referrer: cleanText(payload.source?.referrer, 720),
        sourceProduct
      },
      customer,
      trade: {
        targetMarket: cleanText(payload.trade?.targetMarket, 120),
        volume: cleanText(payload.trade?.volume, 180),
        customLogo: cleanText(payload.trade?.customLogo, 80),
        customPackaging: cleanText(payload.trade?.customPackaging, 80),
        incoterms: cleanText(payload.trade?.incoterms, 80),
        deliveryTime: cleanText(payload.trade?.deliveryTime, 160)
      },
      message: cleanText(payload.message, 1500),
      requirements: cleanText(payload.requirements, 1500),
      items,
      status: "new",
      createdAt,
      updatedAt: createdAt
    };

    await appendInquiryRecord(record);

    return NextResponse.json({
      ok: true,
      inquiryId,
      personId,
      repeat: record.repeat,
      runtime: getAdminRuntimeStatus()
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "意向单提交失败，请稍后重试。",
        runtime: getAdminRuntimeStatus()
      },
      { status: 400 }
    );
  }
}

function normalizeCustomer(customer: InquirySubmitPayload["customer"]): InquiryRecord["customer"] {
  return {
    name: cleanText(customer?.name, 120),
    companyName: cleanText(customer?.companyName, 160),
    countryRegion: cleanText(customer?.countryRegion, 120),
    email: cleanText(customer?.email, 180),
    phone: cleanText(customer?.phone, 120),
    shippingDestination: cleanText(customer?.shippingDestination, 180),
    preferredContactMethod: getContactMethod(customer?.preferredContactMethod)
  };
}

function normalizeItems(items: InquirySubmitPayload["items"], sourceProduct?: InquirySourceProduct): SubmittedInquiryProduct[] {
  const productMap = new Map(products.map((product) => [product.id, product]));
  const normalized: SubmittedInquiryProduct[] = [];

  for (const item of items ?? []) {
    const product = item.productId ? productMap.get(item.productId) : undefined;
    if (!product) continue;

    const note = cleanText(item.note, 600);
    normalized.push({
      productId: product.id,
      slug: product.slug,
      sku: product.sku,
      name: product.name,
      imageSrc: product.images[0]?.src ?? "",
      productUrl: `/products/${product.slug}`,
      quantity: Math.max(1, Number(item.quantity) || 1),
      ...(note ? { note } : {})
    });
  }

  if (normalized.length === 0 && sourceProduct) {
    return [
      {
        ...sourceProduct,
        quantity: 1
      }
    ];
  }

  return normalized;
}

function getSourceProduct(payload: InquirySubmitPayload): InquirySourceProduct | undefined {
  const sourceProduct = products.find(
    (product) => product.id === payload.source?.sourceProductId || product.slug === payload.source?.sourceProductSlug
  );

  if (!sourceProduct) return undefined;

  return {
    productId: sourceProduct.id,
    slug: sourceProduct.slug,
    sku: sourceProduct.sku,
    name: sourceProduct.name,
    imageSrc: sourceProduct.images[0]?.src ?? "",
    productUrl: `/products/${sourceProduct.slug}`
  };
}

function getClientIp(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || request.headers.get("cf-connecting-ip");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

function maskIp(ip: string) {
  if (ip === "unknown") return "unknown";

  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(ip)) {
    const parts = ip.split(".");
    return `${parts[0]}.${parts[1]}.*.*`;
  }

  if (ip.includes(":")) {
    return `${ip.split(":").slice(0, 3).join(":")}:****`;
  }

  return "masked";
}

function summarizeUserAgent(userAgent: string) {
  return cleanText(userAgent, 140) || "unknown";
}

function getStableVisitorId(visitorId: string | undefined, ip: string, userAgent: string) {
  const cleanedVisitorId = cleanText(visitorId, 120);
  if (cleanedVisitorId) return cleanedVisitorId;
  return `VIS-ANON-${fingerprint(`${ip}:${userAgent}`).slice(0, 12).toUpperCase()}`;
}

function fingerprint(value: string) {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 24);
}

function getContactMethod(value: string | undefined): InquiryRecord["customer"]["preferredContactMethod"] {
  if (value === "whatsapp" || value === "phone") return value;
  return "email";
}

function getPageType(pathname: string, sourceProduct?: InquirySourceProduct): InquiryRecord["source"]["pageType"] {
  if (sourceProduct) return "product-detail";
  if (pathname === "/" || pathname.startsWith("/?")) return "home";
  if (pathname.startsWith("/products")) return "product-list";
  if (pathname.startsWith("/cart")) return "interest-list";
  if (pathname.startsWith("/request-quote")) return "contact";
  return "unknown";
}

function getPageLabel(pageType: InquiryRecord["source"]["pageType"], sourceProduct?: InquirySourceProduct) {
  if (sourceProduct) return `商品详情页：${sourceProduct.name}`;

  const labels: Record<InquiryRecord["source"]["pageType"], string> = {
    home: "首页",
    "product-list": "商品列表页",
    "product-detail": "商品详情页",
    "interest-list": "意向清单页",
    contact: "联系表单页",
    unknown: "未知页面"
  };
  return labels[pageType];
}

function countBy(records: InquiryRecord[], predicate: (record: InquiryRecord) => boolean) {
  return records.filter(predicate).length;
}

function cleanText(value: unknown, maxLength: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, maxLength);
}

function createServerInquiryId() {
  const year = new Date().getFullYear();
  return `IQ-${year}-AP-${String(Date.now()).slice(-6)}`;
}
