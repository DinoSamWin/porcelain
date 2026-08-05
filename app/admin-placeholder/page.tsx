import type { Metadata } from "next";
import { BarChart3, Boxes, FileText, LayoutDashboard, PackageSearch, Settings, Ship, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Admin Roadmap",
  description: "Long-term B2B porcelain export admin modules and system extension plan."
};

const modules = [
  {
    icon: LayoutDashboard,
    title: "Dashboard",
    body: "Inquiry volume, hot products, top countries, pending orders, shipment exceptions, and sales workload."
  },
  {
    icon: FileText,
    title: "Home Content CMS",
    body: "Hero banner, featured categories, recommended products, selling points, export capability, and contact blocks."
  },
  {
    icon: Boxes,
    title: "Product Management",
    body: "SKU, category, collection, material, images, MOQ, lead time, packaging, market fit, status, and sort order."
  },
  {
    icon: PackageSearch,
    title: "Inquiry & RFQ",
    body: "New, contacted, quotation sent, negotiating, converted to order, and closed pipeline states."
  },
  {
    icon: BarChart3,
    title: "Orders",
    body: "Draft, confirmed, awaiting payment, production, ready to ship, shipped, completed, and cancelled states."
  },
  {
    icon: Ship,
    title: "Shipments",
    body: "Carrier, tracking number, shipment events, partial shipments, export documents, and logistics API adapter."
  },
  {
    icon: Users,
    title: "Customers",
    body: "Guest inquiries, wholesale accounts, company buyers, customer levels, negotiated MOQ, and dedicated pricing."
  },
  {
    icon: Settings,
    title: "System Settings",
    body: "Company profile, email templates, WhatsApp links, logistics providers, SEO, languages, currencies, and RTL readiness."
  }
];

export default function AdminPlaceholderPage() {
  return (
    <section className="section-pad page-shell">
      <div className="section-heading section-heading--left">
        <span>Admin Placeholder</span>
        <h1>Long-term system modules reserved beyond MVP</h1>
        <p>
          The MVP uses local data, but the domain models and routes are shaped so product CMS, RFQ, order, shipment, and CRM modules can replace mock data later.
        </p>
      </div>
      <div className="admin-grid">
        {modules.map((module) => (
          <article className="panel" key={module.title}>
            <module.icon size={26} aria-hidden="true" />
            <h2>{module.title}</h2>
            <p>{module.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
