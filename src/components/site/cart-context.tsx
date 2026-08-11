"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type CartItem = {
  key: string;
  variantId: string;
  choiceIds: string[];
  quantity: number;
  productName: string;
  variantName: string;
  unitPriceRappen: number;
  imageUrl?: string | null;
};

type CartContextValue = {
  items: CartItem[];
  add: (item: Omit<CartItem, "key">) => void;
  remove: (key: string) => void;
  setQuantity: (key: string, quantity: number) => void;
  clear: () => void;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const storageKey = "saltnpepper-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        setItems(JSON.parse(localStorage.getItem(storageKey) ?? "[]"));
      } catch {
        localStorage.removeItem(storageKey);
      }
      setReady(true);
    });
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(storageKey, JSON.stringify(items));
  }, [items, ready]);

  const value = useMemo<CartContextValue>(() => ({
    items,
    add: (item) => setItems((current) => [...current, { ...item, key: crypto.randomUUID() }]),
    remove: (key) => setItems((current) => current.filter((item) => item.key !== key)),
    setQuantity: (key, quantity) => setItems((current) => quantity < 1
      ? current.filter((item) => item.key !== key)
      : current.map((item) => item.key === key ? { ...item, quantity: Math.min(99, quantity) } : item)),
    clear: () => setItems([]),
    count: items.reduce((sum, item) => sum + item.quantity, 0),
  }), [items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}
