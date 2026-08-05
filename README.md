# Aurelia Ceramics B2B Porcelain Export Prototype

This project is a static MVP prototype for a porcelain export B2B independent site. It is designed for sales representatives, wholesale buyers, importers, hotels, restaurants, and regional distributors.

## MVP Scope

- Responsive home page with premium porcelain brand styling.
- Product listing with filters and sorting.
- Product detail pages with MOQ, specifications, packaging, lead time, and wholesale CTA.
- Inquiry Cart with local storage.
- Request Quote form without forced registration.
- Submission success page with Inquiry ID.
- Guest tracking page with mock order and shipment timeline.
- Admin placeholder page for long-term system modules.

## Core Flow

1. Sales scan flow: Home -> Products -> Product Detail -> Add to Inquiry -> Submit Inquiry.
2. Buyer browsing flow: Home -> Products -> Filters -> Related Products -> Inquiry Cart.
3. Guest inquiry flow: Inquiry Cart -> Buyer Info -> Success Page -> Save Inquiry ID.
4. Guest tracking flow: Track Inquiry -> Inquiry ID + Email -> Mock status timeline.

## Data Model Direction

The MVP uses static TypeScript mock data in `data/catalog.ts`, backed by migration-friendly interfaces in `types/domain.ts`:

- Product
- Category
- Collection
- Inquiry
- InquiryItem
- Customer
- Order
- OrderItem
- Shipment
- ShipmentEvent
- HomeContent
- AdminUser

These models can later map to a database and API layer without changing page-level product logic.

## Future System Modules

- Product CMS and category management.
- Home content management.
- RFQ and inquiry pipeline.
- B2B customer accounts with company buyers.
- Customer-specific pricing, MOQ, discounts, and payment terms.
- Formal order and production management.
- Shipment management with logistics adapters.
- Email notifications and WhatsApp handoff.
- Multilingual content including English, German, French, and Arabic with RTL readiness.

## Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.
