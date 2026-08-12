import type { Metadata } from "next";
import { AdminContentManager } from "@/components/AdminContentManager";
import { getPublishMode, readCatalogContent } from "@/lib/content-admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Catalog Admin",
  description: "Manage homepage, porcelain products, categories, images and catalog publishing."
};

export default async function AdminPage() {
  const content = await readCatalogContent();

  return <AdminContentManager initialContent={content} initialPublishMode={getPublishMode()} />;
}
