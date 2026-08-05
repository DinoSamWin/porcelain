import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Inquiry Submitted",
  description: "Inquiry submission confirmation with tracking entry."
};

interface SuccessPageProps {
  searchParams: Promise<{ inquiryId?: string }>;
}

export default async function SuccessPage({ searchParams }: SuccessPageProps) {
  const { inquiryId } = await searchParams;
  const displayId = inquiryId ?? "IQ-2026-AP-DEMO";

  return (
    <section className="success-page">
      <div className="panel success-panel">
        <CheckCircle2 size={42} aria-hidden="true" />
        <span className="panel-label">Inquiry Submitted Successfully</span>
        <h1>{displayId}</h1>
        <p>
          We will contact you within 1-2 business days. Please save this Inquiry ID to track your request with your email address.
        </p>
        <div className="success-actions">
          <Link className="btn btn-primary" href="/track-order">
            Track Inquiry
          </Link>
          <Link className="btn btn-secondary" href="/">
            Back to Home
          </Link>
          <Link className="text-link" href="/products">
            Continue Browsing
          </Link>
        </div>
      </div>
    </section>
  );
}
