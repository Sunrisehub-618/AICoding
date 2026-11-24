"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useSession } from "next-auth/react";
import type { CartLine } from "@/lib/types";

const STORAGE_KEY = "mini_mall_cart";

type CartContextValue = {
  items: CartLine[];
  loading: boolean;
  count: number;
  totalCents: number;
  addItem: (product: CartLine, quantity?: number) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  refresh: () => Promise<void>;
};

const CartContext = createContext<CartContextValue | null>(null);

function readLocal(): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    return [];
  }
}

function writeLocal(items: CartLine[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
  });
  if (!res.ok) throw new Error("请求失败");
  return res.json() as Promise<T>;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const [items, setItems] = useState<CartLine[]>([]);
  const [loading, setLoading] = useState(true);
  const authed = status === "authenticated";

  // 初始加载 + 登录时合并 localStorage 到数据库
  useEffect(() => {
    let cancelled = false;
    async function init() {
      if (status === "loading") return;
      setLoading(true);
      if (status === "authenticated") {
        const local = readLocal();
        if (local.length > 0) {
          try {
            await api("/api/cart/merge", {
              method: "POST",
              body: JSON.stringify({
                items: local.map((l) => ({ productId: l.productId, quantity: l.quantity })),
              }),
            });
            writeLocal([]);
          } catch {
            /* ignore merge error */
          }
        }
        try {
          const data = await api<{ items: CartLine[] }>("/api/cart");
          if (!cancelled) setItems(data.items);
        } catch {
          if (!cancelled) setItems([]);
        }
      } else {
        if (!cancelled) setItems(readLocal());
      }
      if (!cancelled) setLoading(false);
    }
    init();
    return () => {
      cancelled = true;
    };
  }, [status]);

  const addItem = useCallback(
    async (product: CartLine, quantity = 1) => {
      if (authed) {
        const data = await api<{ items: CartLine[] }>("/api/cart", {
          method: "POST",
          body: JSON.stringify({ productId: product.productId, quantity }),
        });
        setItems(data.items);
      } else {
        const cur = readLocal();
        const existing = cur.find((l) => l.productId === product.productId);
        const next = existing
          ? cur.map((l) =>
              l.productId === product.productId
                ? { ...l, quantity: Math.min(l.quantity + quantity, product.stock) }
                : l,
            )
          : [...cur, { ...product, quantity }];
        writeLocal(next);
        setItems(next);
      }
    },
    [authed],
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      if (authed) {
        const data = await api<{ items: CartLine[] }>("/api/cart", {
          method: "PATCH",
          body: JSON.stringify({ productId, quantity }),
        });
        setItems(data.items);
      } else {
        const cur = readLocal();
        const next =
          quantity <= 0
            ? cur.filter((l) => l.productId !== productId)
            : cur.map((l) => (l.productId === productId ? { ...l, quantity } : l));
        writeLocal(next);
        setItems(next);
      }
    },
    [authed],
  );

  const removeItem = useCallback(
    async (productId: string) => {
      if (authed) {
        const data = await api<{ items: CartLine[] }>(`/api/cart?productId=${productId}`, {
          method: "DELETE",
        });
        setItems(data.items);
      } else {
        const cur = readLocal().filter((l) => l.productId !== productId);
        writeLocal(cur);
        setItems(cur);
      }
    },
    [authed],
  );

  const refresh = useCallback(async () => {
    if (authed) {
      try {
        const data = await api<{ items: CartLine[] }>("/api/cart");
        setItems(data.items);
      } catch {
        setItems([]);
      }
    } else {
      setItems(readLocal());
    }
  }, [authed]);

  const count = useMemo(() => items.reduce((s, l) => s + l.quantity, 0), [items]);
  const totalCents = useMemo(
    () => items.reduce((s, l) => s + l.priceCents * l.quantity, 0),
    [items],
  );

  return (
    <CartContext.Provider
      value={{ items, loading, count, totalCents, addItem, updateQuantity, removeItem, refresh }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart 必须在 CartProvider 内使用");
  return ctx;
}
