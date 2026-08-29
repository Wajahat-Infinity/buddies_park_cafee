"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import type { MenuItem } from "@/lib/types";

/**
 * A cart line stores a snapshot of the item as it was when added, so an admin
 * price or name edit mid session cannot silently change an open order.
 */
export type CartLine = {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  quantity: number;
};

type CartValue = {
  lines: CartLine[];
  itemCount: number;
  total: number;
  addItem: (item: MenuItem) => void;
  increment: (id: string) => void;
  decrement: (id: string) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  quantityOf: (id: string) => number;
};

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);

  const addItem = useCallback((item: MenuItem) => {
    if (!item.is_available) return;

    setLines((current) => {
      const existing = current.find((line) => line.id === item.id);
      if (existing) {
        return current.map((line) =>
          line.id === item.id ? { ...line, quantity: line.quantity + 1 } : line
        );
      }
      return [
        ...current,
        {
          id: item.id,
          name: item.name,
          price: Number(item.price),
          imageUrl: item.image_url,
          quantity: 1,
        },
      ];
    });
  }, []);

  const increment = useCallback((id: string) => {
    setLines((current) =>
      current.map((line) =>
        line.id === id ? { ...line, quantity: line.quantity + 1 } : line
      )
    );
  }, []);

  /** Dropping below one removes the line entirely. */
  const decrement = useCallback((id: string) => {
    setLines((current) =>
      current.flatMap((line) => {
        if (line.id !== id) return [line];
        return line.quantity > 1
          ? [{ ...line, quantity: line.quantity - 1 }]
          : [];
      })
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setLines((current) => current.filter((line) => line.id !== id));
  }, []);

  const clearCart = useCallback(() => setLines([]), []);

  const value = useMemo<CartValue>(() => {
    const itemCount = lines.reduce((sum, line) => sum + line.quantity, 0);
    const total = lines.reduce(
      (sum, line) => sum + line.price * line.quantity,
      0
    );

    return {
      lines,
      itemCount,
      total,
      addItem,
      increment,
      decrement,
      removeItem,
      clearCart,
      quantityOf: (id: string) =>
        lines.find((line) => line.id === id)?.quantity ?? 0,
    };
  }, [lines, addItem, increment, decrement, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside a CartProvider");
  }
  return context;
}
