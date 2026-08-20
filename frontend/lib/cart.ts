"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartLine } from "./types";

interface CartState {
  items: CartLine[];
  addItem: (item: Omit<CartLine, "id" | "quantity"> & { quantity?: number; id?: string }) => void;
  removeItem: (id: string) => void;
  setQuantity: (id: string, quantity: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => {
        const quantity = item.quantity ?? 1;
        const existing = get().items.find(
          (line) =>
            line.sku === item.sku &&
            JSON.stringify(line.configuration ?? null) ===
              JSON.stringify(item.configuration ?? null) &&
            (line.notes ?? "") === (item.notes ?? ""),
        );
        if (existing) {
          set({
            items: get().items.map((line) =>
              line.id === existing.id
                ? { ...line, quantity: line.quantity + quantity }
                : line,
            ),
          });
          return;
        }
        const id =
          item.id ?? `ln_${Math.random().toString(36).slice(2, 10)}`;
        set({
          items: [...get().items, { ...item, id, quantity }],
        });
      },
      removeItem: (id) =>
        set({ items: get().items.filter((line) => line.id !== id) }),
      setQuantity: (id, quantity) => {
        if (quantity <= 0) {
          set({ items: get().items.filter((line) => line.id !== id) });
          return;
        }
        set({
          items: get().items.map((line) =>
            line.id === id ? { ...line, quantity } : line,
          ),
        });
      },
      clear: () => set({ items: [] }),
    }),
    { name: "mihbash-cart" },
  ),
);

export function cartTotals(items: CartLine[]) {
  const subtotal = items.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;
  const count = items.reduce((sum, line) => sum + line.quantity, 0);
  return { subtotal, tax, total, count };
}
