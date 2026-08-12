import content from "@/data/content.json";
import type { Category, Collection, HomeContent, Product, Shipment } from "@/types/domain";

export interface CatalogContent {
  homeContent: HomeContent;
  categories: Category[];
  collections: Collection[];
  products: Product[];
}

export const catalogContent = content as CatalogContent;
export const categories = catalogContent.categories;
export const collections = catalogContent.collections;
export const products = catalogContent.products;
export const homeContent = catalogContent.homeContent;

const now = "2026-08-04T00:00:00.000Z";

export const mockShipment: Shipment = {
  id: "SHP-2026-0712",
  orderId: "IQ-2026-AURELIA",
  carrier: "DHL",
  trackingNumber: "DHL-DEMO-284910",
  shippingMethod: "Air freight sample shipment",
  shippingFrom: "Jingdezhen, China",
  shippingTo: "Dubai, United Arab Emirates",
  estimatedDeliveryDate: "2026-07-18",
  status: "in-transit",
  trackingUrl: "https://www.dhl.com/",
  createdAt: now,
  updatedAt: now,
  events: [
    {
      id: "evt-1",
      shipmentId: "SHP-2026-0712",
      status: "pending-shipment",
      location: "Jingdezhen",
      description: "Inquiry submitted and awaiting sales review.",
      occurredAt: "2026-07-07T08:00:00.000Z"
    },
    {
      id: "evt-2",
      shipmentId: "SHP-2026-0712",
      status: "preparing",
      location: "Export warehouse",
      description: "Sales team reviewed item interest and buyer contact details.",
      occurredAt: "2026-07-08T10:30:00.000Z"
    },
    {
      id: "evt-3",
      shipmentId: "SHP-2026-0712",
      status: "shipped",
      location: "Guangzhou",
      description: "Sample shipment prepared for carrier pickup.",
      occurredAt: "2026-07-11T14:15:00.000Z"
    },
    {
      id: "evt-4",
      shipmentId: "SHP-2026-0712",
      status: "in-transit",
      location: "In transit",
      description: "Shipment is in transit to destination country.",
      occurredAt: "2026-07-12T19:45:00.000Z"
    }
  ]
};

export function getCategoryById(id: string) {
  return categories.find((category) => category.id === id);
}

export function getCollectionById(id: string) {
  return collections.find((collection) => collection.id === id);
}

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getProductById(id: string) {
  return products.find((product) => product.id === id);
}

export function getRelatedProducts(product: Product) {
  return products
    .filter(
      (candidate) =>
        candidate.id !== product.id &&
        (candidate.categoryId === product.categoryId || candidate.collectionId === product.collectionId)
    )
    .slice(0, 3);
}
