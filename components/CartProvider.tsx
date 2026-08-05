"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export interface CartItemState {
  productId: string;
  quantity: number;
  note?: string;
}

interface CartContextValue {
  items: CartItemState[];
  itemCount: number;
  addItem: (item: CartItemState) => void;
  updateItem: (productId: string, patch: Partial<Omit<CartItemState, "productId">>) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "aurelia-inquiry-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItemState[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored) as CartItemState[]);
      }
    } catch {
      setItems([]);
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    if (ready) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, ready]);

  const addItem = useCallback((item: CartItemState) => {
    setItems((current) => {
      const existing = current.find((candidate) => candidate.productId === item.productId);
      if (!existing) {
        return [...current, item];
      }

      return current.map((candidate) =>
        candidate.productId === item.productId
          ? {
              ...candidate,
              quantity: Math.max(candidate.quantity, item.quantity),
              note: item.note ?? candidate.note
            }
          : candidate
      );
    });
  }, []);

  const updateItem = useCallback((productId: string, patch: Partial<Omit<CartItemState, "productId">>) => {
    setItems((current) =>
      current.map((item) =>
        item.productId === productId
          ? {
              ...item,
              ...patch
            }
          : item
      )
    );
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((current) => current.filter((item) => item.productId !== productId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const value = useMemo(
    () => ({
      items,
      itemCount: items.length,
      addItem,
      updateItem,
      removeItem,
      clearCart
    }),
    [addItem, clearCart, items, removeItem, updateItem]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) {
    throw new Error("useCart must be used within CartProvider");
  }
  return value;
}
