"use client";

import { Check, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/components/CartProvider";

interface AddToInquiryButtonProps {
  productId: string;
  quantity: number;
  className?: string;
}

export function AddToInquiryButton({ productId, quantity, className }: AddToInquiryButtonProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      className={className ?? "btn btn-primary btn-compact"}
      type="button"
      onClick={() => {
        addItem({ productId, quantity });
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1600);
      }}
    >
      {added ? <Check size={16} aria-hidden="true" /> : <ShoppingBag size={16} aria-hidden="true" />}
      {added ? "Saved" : "Save Interest"}
    </button>
  );
}
