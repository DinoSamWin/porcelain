import type { Metadata } from "next";
import { AdminContentManager } from "@/components/AdminContentManager";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catalog Admin",
  description: "Manage homepage, porcelain products, categories, images and catalog publishing."
};

export default function AdminPage() {
  return <AdminContentManager />;
}
