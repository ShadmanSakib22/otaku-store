"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CheckoutAddress {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CheckoutCustomerInfo {
  name: string;
  email: string;
  phone: string;
  address?: CheckoutAddress;
}

interface CheckoutState {
  customer: CheckoutCustomerInfo;
  setCustomer: (customer: Partial<CheckoutCustomerInfo>) => void;
  clearCustomer: () => void;
}

const defaultCustomer: CheckoutCustomerInfo = {
  name: "",
  email: "",
  phone: "",
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      customer: defaultCustomer,

      setCustomer: (customer) =>
        set((state) => ({
          customer: { ...state.customer, ...customer },
        })),

      clearCustomer: () => set({ customer: defaultCustomer }),
    }),
    {
      name: "checkout-storage",
    }
  )
);