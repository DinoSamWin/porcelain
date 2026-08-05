import type { Metadata } from "next";
import { TrackOrderClient } from "@/components/TrackOrderClient";
import { mockShipment } from "@/data/catalog";

export const metadata: Metadata = {
  title: "Track Inquiry",
  description: "Track a guest inquiry or sample shipment using Inquiry ID and email."
};

export default function TrackOrderPage() {
  return (
    <section className="section-pad page-shell">
      <TrackOrderClient shipment={mockShipment} />
    </section>
  );
}
