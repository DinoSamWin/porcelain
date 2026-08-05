"use client";

import { CheckCircle2, Circle, Search } from "lucide-react";
import { FormEvent, useState } from "react";
import type { Shipment } from "@/types/domain";

const steps = [
  "Inquiry Submitted",
  "Sales Review",
  "Quotation Sent",
  "Order Confirmed",
  "Production / Preparing",
  "Shipped",
  "Delivered"
];

export function TrackOrderClient({ shipment }: { shipment: Shipment }) {
  const [searched, setSearched] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearched(true);
  }

  return (
    <div className="tracking-layout">
      <form className="panel tracking-form" onSubmit={handleSubmit}>
        <span className="panel-label">Guest Tracking</span>
        <h1>Track an inquiry or sample shipment</h1>
        <p>Enter an Inquiry ID and email address to view the current mock status.</p>
        <label>
          Inquiry ID / Order ID
          <input required placeholder="IQ-2026-AURELIA" />
        </label>
        <label>
          Email
          <input required type="email" placeholder="buyer@company.com" />
        </label>
        <button className="btn btn-primary" type="submit">
          <Search size={16} aria-hidden="true" />
          Track Inquiry
        </button>
      </form>

      <section className="panel tracking-result">
        <span className="panel-label">Mock Status</span>
        {searched ? (
          <>
            <h2>{shipment.orderId}</h2>
            <p>
              Carrier: {shipment.carrier} · Tracking: {shipment.trackingNumber}
            </p>
            <div className="timeline">
              {steps.map((step, index) => {
                const complete = index <= 5;
                return (
                  <div className={complete ? "timeline-step timeline-step--complete" : "timeline-step"} key={step}>
                    {complete ? <CheckCircle2 size={20} aria-hidden="true" /> : <Circle size={20} aria-hidden="true" />}
                    <span>{step}</span>
                  </div>
                );
              })}
            </div>
            <div className="shipment-events">
              {shipment.events.map((event) => (
                <article key={event.id}>
                  <span>{new Date(event.occurredAt).toLocaleDateString("en-US")}</span>
                  <h3>{event.description}</h3>
                  <p>{event.location}</p>
                </article>
              ))}
            </div>
          </>
        ) : (
          <div className="empty-state empty-state--compact">
            <h2>Use demo tracking</h2>
            <p>Submit the form to display the sample inquiry status timeline.</p>
          </div>
        )}
      </section>
    </div>
  );
}
