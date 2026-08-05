import type { Category, Collection, HomeContent, Product, Shipment } from "@/types/domain";

const image = {
  hero: "/images/phase1/plum-lidded-censer.png",
  plumCenser: "/images/phase1/plum-lidded-censer.png",
  plumCenserGallery: "/images/phase1/plum-lidded-censer-gallery.png",
  blueCenser: "/images/phase1/blue-floral-censer.png",
  blueCenserGallery: "/images/phase1/blue-floral-censer-gallery.png",
  yellowVessel: "/images/phase1/yellow-enamel-vessel.png",
  butterflyVessel: "/images/phase1/butterfly-shoulder-vessel.png",
  showroom: "/images/showroom-export-ready.png"
};

export const categories: Category[] = [
  {
    id: "cat-censers",
    name: "Decorative Censers",
    slug: "decorative-censers",
    description: "Lidded enamel porcelain pieces with gilded mounts for luxury interior display.",
    coverImage: image.blueCenser,
    sortOrder: 1,
    status: "published"
  },
  {
    id: "cat-vessels",
    name: "Vessels & Vases",
    slug: "vessels-and-vases",
    description: "Statement vessels with hand-painted enamel surfaces and sculptural metal details.",
    coverImage: image.butterflyVessel,
    sortOrder: 2,
    status: "published"
  },
  {
    id: "cat-centerpieces",
    name: "Centerpieces",
    slug: "centerpieces",
    description: "Decorative porcelain objects selected for showroom, hotel, and private interior projects.",
    coverImage: image.yellowVessel,
    sortOrder: 3,
    status: "published"
  }
];

export const collections: Collection[] = [
  {
    id: "col-enamel-edit",
    name: "Enamel Porcelain Edit",
    slug: "enamel-porcelain-edit",
    description: "A compact buyer-facing selection prepared for early conversations with importers and interior buyers.",
    coverImage: image.hero,
    marketFit: ["Europe", "Middle East", "Retail", "Importer"]
  },
  {
    id: "col-blue-white",
    name: "Blue & White Gilded",
    slug: "blue-white-gilded",
    description: "Blue-and-white porcelain with gilded bronze-style fittings for classic European interiors.",
    coverImage: image.blueCenser,
    marketFit: ["Europe", "Retail", "Importer"]
  }
];

const now = "2026-08-04T00:00:00.000Z";

const placeholderSpec = {
  size: "To be confirmed",
  weight: "To be confirmed",
  packaging: "Protective export packaging available after item confirmation",
  cartonSize: "To be confirmed",
  grossWeight: "To be confirmed",
  netWeight: "To be confirmed"
};

const packagingInfo = [
  "Dimensions on request.",
  "Packing photos available.",
  "MOQ and sample options by sales."
];

export const products: Product[] = [
  {
    id: "prod-plum-lidded-censer",
    slug: "plum-lidded-enamel-censer",
    name: "Plum Lidded Enamel Censer",
    sku: "REF-EN-001",
    categoryId: "cat-censers",
    collectionId: "col-enamel-edit",
    material: "Enamel porcelain with gilded metal mounts",
    color: "Black, vermilion red, antique gold",
    finish: "Gloss enamel with sculptural gilded details",
    moq: 1,
    leadTime: "Sales team to confirm",
    customizable: true,
    marketFit: ["Europe", "Middle East", "Retail", "Importer"],
    usage: ["Luxury interior display", "Showroom selection", "Buyer sample discussion"],
    style: "Ornamental enamel",
    tags: ["Hero Piece", "Enamel Porcelain", "Gilded Mount"],
    description:
      "A hero enamel censer for buyer conversations.",
    images: [
      { src: image.plumCenser, alt: "Black and vermilion enamel porcelain lidded censer" },
      { src: image.plumCenserGallery, alt: "Gallery view of the plum enamel lidded censer" }
    ],
    specification: placeholderSpec,
    packagingInfo,
    status: "published",
    sortOrder: 1,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prod-blue-floral-censer",
    slug: "blue-floral-gilded-censer",
    name: "Blue Floral Gilded Censer",
    sku: "REF-EN-002",
    categoryId: "cat-censers",
    collectionId: "col-blue-white",
    material: "Blue-and-white porcelain with gilded metal lid and legs",
    color: "Cobalt blue, porcelain white, antique gold",
    finish: "Gloss glaze with pierced gilded lid",
    moq: 1,
    leadTime: "Sales team to confirm",
    customizable: true,
    marketFit: ["Europe", "Middle East", "Retail", "Importer"],
    usage: ["Interior styling", "Decorative retail", "Importer preview"],
    style: "Blue-and-white classical",
    tags: ["Blue & White", "Gilded Lid", "Buyer Favorite"],
    description:
      "A blue-and-white censer with gilded hardware.",
    images: [
      { src: image.blueCenser, alt: "Blue-and-white floral porcelain censer with gilded lid" },
      { src: image.blueCenserGallery, alt: "Gallery view of the blue floral gilded censer" }
    ],
    specification: placeholderSpec,
    packagingInfo,
    status: "published",
    sortOrder: 2,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prod-yellow-enamel-vessel",
    slug: "yellow-enamel-treasure-vessel",
    name: "Yellow Enamel Treasure Vessel",
    sku: "REF-EN-003",
    categoryId: "cat-centerpieces",
    collectionId: "col-enamel-edit",
    material: "Enamel porcelain with gilded handles and cabochon accents",
    color: "Imperial yellow, cobalt blue, jade green, antique gold",
    finish: "Gloss enamel with hand-painted floral scrolls",
    moq: 1,
    leadTime: "Sales team to confirm",
    customizable: true,
    marketFit: ["Europe", "Middle East", "Retail", "Importer"],
    usage: ["Statement decor", "Hotel lobby styling", "Private residence display"],
    style: "Color enamel decorative arts",
    tags: ["Color Enamel", "Statement Vessel", "Gilded Handles"],
    description:
      "A colorful enamel vessel with a strong decorative profile.",
    images: [{ src: image.yellowVessel, alt: "Yellow enamel porcelain treasure vessel with gilded handles" }],
    specification: placeholderSpec,
    packagingInfo,
    status: "published",
    sortOrder: 3,
    createdAt: now,
    updatedAt: now
  },
  {
    id: "prod-butterfly-shoulder-vessel",
    slug: "butterfly-shoulder-display-vessel",
    name: "Butterfly Shoulder Display Vessel",
    sku: "REF-EN-004",
    categoryId: "cat-vessels",
    collectionId: "col-enamel-edit",
    material: "Enamel porcelain with gilded branch and butterfly details",
    color: "Ivory, navy blue, coral, pink, antique gold",
    finish: "Gloss enamel with decorative metalwork",
    moq: 1,
    leadTime: "Sales team to confirm",
    customizable: true,
    marketFit: ["Europe", "Middle East", "Retail", "Importer"],
    usage: ["Showroom centerpiece", "Interior project styling", "Boutique retail display"],
    style: "Butterfly and floral decorative vessel",
    tags: ["Butterfly Detail", "Decorative Vessel", "Collector Style"],
    description:
      "A sculptural vessel with butterfly and floral detailing.",
    images: [{ src: image.butterflyVessel, alt: "Butterfly shoulder enamel porcelain display vessel" }],
    specification: placeholderSpec,
    packagingInfo,
    status: "published",
    sortOrder: 4,
    createdAt: now,
    updatedAt: now
  }
];

export const homeContent: HomeContent = {
  hero: {
    title: "Enamel Porcelain Pieces for Buyer Conversations",
    subtitle:
      "A mobile-first preview catalog for sales teams meeting importers, interior buyers, and decorative retail partners in Europe.",
    primaryCta: "View Featured Pieces",
    secondaryCta: "Contact Sales",
    image: image.hero
  },
  sellingPoints: [
    {
      title: "Visual-first catalog",
      body: "Made for QR-code sharing when product names and specifications are still being confirmed."
    },
    {
      title: "Collect buyer interest",
      body: "Buyers can save pieces to an inquiry list and leave contact details without creating an account."
    },
    {
      title: "Factory details later",
      body: "Dimensions, MOQ, sample fee, and packaging can be confirmed by the sales team after interest is clear."
    }
  ],
  featuredCategoryIds: ["cat-censers", "cat-vessels", "cat-centerpieces"],
  featuredProductIds: ["prod-plum-lidded-censer", "prod-blue-floral-censer", "prod-yellow-enamel-vessel"]
};

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
