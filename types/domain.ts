export type MarketRegion =
  | "Europe"
  | "Middle East"
  | "Hotel"
  | "Restaurant"
  | "Retail"
  | "Importer";

export type ProductStatus = "draft" | "published" | "archived";

export type ProductAvailability = "in-stock" | "made-to-order" | "pre-order" | "waiting-list";

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  parentCategoryId?: string;
  sortOrder: number;
  status: ProductStatus;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description: string;
  coverImage: string;
  marketFit: MarketRegion[];
}

export interface ProductImage {
  src: string;
  alt: string;
}

export interface ProductSpecification {
  size: string;
  weight: string;
  capacity?: string;
  piecesPerSet?: string;
  packaging: string;
  cartonSize: string;
  grossWeight: string;
  netWeight: string;
}

export interface ProductAttribute {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  sku: string;
  categoryId: string;
  collectionId: string;
  material: string;
  color: string;
  finish: string;
  moq: number;
  leadTime: string;
  availability: ProductAvailability;
  customizable: boolean;
  marketFit: MarketRegion[];
  usage: string[];
  style: string;
  tags: string[];
  description: string;
  images: ProductImage[];
  specification: ProductSpecification;
  attributes: ProductAttribute[];
  packagingInfo: string[];
  status: ProductStatus;
  sortOrder: number;
  isFeatured?: boolean;
  featuredOrder?: number;
  isHeroBanner?: boolean;
  heroOrder?: number;
  createdAt: string;
  updatedAt: string;
}

export interface InquiryItem {
  productId: string;
  sku: string;
  quantity: number;
  note?: string;
}

export type InquiryStatus =
  | "new"
  | "contacted"
  | "quotation-sent"
  | "negotiating"
  | "converted-to-order"
  | "closed";

export interface Customer {
  id: string;
  name: string;
  companyName: string;
  countryRegion: string;
  email: string;
  phone?: string;
  whatsapp?: string;
  customerType: "guest" | "wholesale-account" | "distributor" | "importer";
  source: "scan" | "exhibition" | "email" | "website" | "sales-share";
  notes?: string;
}

export interface Inquiry {
  id: string;
  customer: Customer;
  items: InquiryItem[];
  message?: string;
  shippingDestination?: string;
  preferredContactMethod: "email" | "whatsapp" | "phone";
  status: InquiryStatus;
  assignedSales?: string;
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus =
  | "draft"
  | "confirmed"
  | "awaiting-payment"
  | "in-production"
  | "ready-to-ship"
  | "shipped"
  | "completed"
  | "cancelled";

export interface OrderItem {
  productId: string;
  sku: string;
  quantity: number;
  quotedUnitPrice?: number;
  currency?: string;
  note?: string;
}

export interface Order {
  id: string;
  inquiryId?: string;
  customerId: string;
  items: OrderItem[];
  paymentStatus: "not-required" | "pending" | "partial" | "paid";
  orderStatus: OrderStatus;
  productionStatus: "not-started" | "scheduled" | "in-production" | "completed";
  shipmentStatus: ShipmentStatus;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ShipmentStatus =
  | "pending-shipment"
  | "preparing"
  | "shipped"
  | "in-transit"
  | "arrived-at-destination-country"
  | "customs-clearance"
  | "out-for-delivery"
  | "delivered"
  | "exception";

export interface ShipmentEvent {
  id: string;
  shipmentId: string;
  status: ShipmentStatus;
  location?: string;
  description: string;
  occurredAt: string;
}

export interface Shipment {
  id: string;
  orderId: string;
  carrier: "DHL" | "FedEx" | "UPS" | "Freight Forwarder" | "Custom";
  trackingNumber: string;
  shippingMethod: string;
  shippingFrom: string;
  shippingTo: string;
  estimatedDeliveryDate?: string;
  status: ShipmentStatus;
  trackingUrl?: string;
  events: ShipmentEvent[];
  createdAt: string;
  updatedAt: string;
}

export interface HomeContent {
  hero: {
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    image: string;
  };
  sellingPoints: Array<{
    title: string;
    body: string;
  }>;
  featuredCategoryIds: string[];
  featuredProductIds: string[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: "owner" | "sales" | "operator" | "admin";
  status: "active" | "invited" | "disabled";
  createdAt: string;
  updatedAt: string;
}
