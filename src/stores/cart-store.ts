"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  variantId: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (variantId: string, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],

      addItem: (variantId, quantity = 1) =>
        set((state) => {
          const existing = state.items.find(
            (item) => item.variantId === variantId
          );

          if (existing) {
            return {
              items: state.items.map((item) =>
                item.variantId === variantId
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }

          return { items: [...state.items, { variantId, quantity }] };
        }),

      removeItem: (variantId) =>
        set((state) => ({
          items: state.items.filter((item) => item.variantId !== variantId),
        })),

      updateQuantity: (variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => item.variantId !== variantId)
              : state.items.map((item) =>
                  item.variantId === variantId ? { ...item, quantity } : item
                ),
        })),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({ items: state.items }),
    }
  )
);