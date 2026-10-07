import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { getRemovedProductIds } from "@/lib/catalog";

export type CartItem = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  stock: number;
  quantity: number;
};
type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (item: Omit<CartItem, "quantity">, qty: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};
const Ctx = createContext<CartCtx | null>(null);
const KEY = "josppy-cart";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const removed = getRemovedProductIds();
          setItems(parsed.filter((i: CartItem) => !removed.has(i.id)));
        }
      }
    } catch {
      /* ignore */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (ready) localStorage.setItem(KEY, JSON.stringify(items));
  }, [items, ready]);

  const add: CartCtx["add"] = (item, qty) => {
    const removed = getRemovedProductIds();
    if (removed.has(item.id)) return;

    setItems((prev) => {
      const ex = prev.find((i) => i.id === item.id);
      if (ex)
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: Math.min(i.quantity + qty, item.stock) } : i,
        );
      return [...prev, { ...item, quantity: Math.min(qty, item.stock) }];
    });
  };

  const setQty = (id: string, qty: number) =>
    setItems((p) =>
      p.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, Math.min(qty, i.stock)) } : i)),
    );
  const remove = (id: string) => setItems((p) => p.filter((i) => i.id !== id));
  const clear = () => setItems([]);
  const count = items.reduce((s, i) => s + i.quantity, 0);
  const subtotal = items.reduce((s, i) => s + i.quantity * i.price, 0);
  return (
    <Ctx.Provider value={{ items, count, subtotal, add, setQty, remove, clear }}>
      {children}
    </Ctx.Provider>
  );
}

export const useCart = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside provider");
  return c;
};
