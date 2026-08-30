export function createInquiryId() {
  const date = new Date();
  const year = date.getFullYear();
  const stamp = String(date.getTime()).slice(-6);
  return `IQ-${year}-AP-${stamp}`;
}

const visitorStorageKey = "aurelia-visitor-id";

export interface InquirySubmitItem {
  productId: string;
  quantity: number;
  note?: string;
}

export interface InquirySubmitPayload {
  inquiryId: string;
  visitorId: string;
  source: {
    submittedFromUrl: string;
    submittedFromPath: string;
    referrer: string;
    sourceProductId?: string;
    sourceProductSlug?: string;
  };
  customer: {
    name: string;
    companyName: string;
    countryRegion: string;
    email: string;
    phone?: string;
    shippingDestination?: string;
    preferredContactMethod: string;
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
  items: InquirySubmitItem[];
}

export function getOrCreateVisitorId() {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = window.localStorage.getItem(visitorStorageKey);
  if (existing) {
    return existing;
  }

  const id = `VIS-${new Date().getFullYear()}-${createRandomId()}`;
  window.localStorage.setItem(visitorStorageKey, id);
  return id;
}

export function getCurrentSourceContext(sourceProduct?: { id: string; slug: string }) {
  const url = typeof window === "undefined" ? "" : window.location.href;
  const submittedFromPath =
    typeof window === "undefined" ? "" : `${window.location.pathname}${window.location.search}${window.location.hash}`;

  return {
    submittedFromUrl: url,
    submittedFromPath,
    referrer: typeof document === "undefined" ? "" : document.referrer,
    sourceProductId: sourceProduct?.id,
    sourceProductSlug: sourceProduct?.slug
  };
}

export async function submitInquiryRecord(payload: InquirySubmitPayload) {
  const response = await fetch("/api/inquiries", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });
  const result = (await response.json()) as { ok?: boolean; inquiryId?: string; error?: string };

  if (!response.ok || !result.ok) {
    throw new Error(result.error ?? "意向单提交失败，请稍后重试。");
  }

  return result;
}

export function formatMoq(moq: number) {
  return `MOQ ${moq}+`;
}

function createRandomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID().slice(0, 13).toUpperCase();
  }

  return Math.random().toString(36).slice(2, 12).toUpperCase();
}
