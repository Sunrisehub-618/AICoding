"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";
import { formatCents } from "@/lib/utils";
import type { CartLine } from "@/lib/types";

function CartRow({
  item,
  onQty,
  onRemove,
}: {
  item: CartLine;
  onQty: (productId: string, quantity: number) => void;
  onRemove: (productId: string) => void;
}) {
  return (
    <div className="flex items-center gap-4 py-4">
      <Link
        href={`/products/${item.slug}`}
        className="h-20 w-20 shrink-0 overflow-hidden rounded-md bg-neutral-100"
      >
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">无图</div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <Link href={`/products/${item.slug}`} className="font-medium hover:underline">
          {item.name}
        </Link>
        <p className="mt-0.5 text-sm text-neutral-500">¥{formatCents(item.priceCents)}</p>
        {!item.isActive && <p className="text-xs text-red-500">商品已下架</p>}
      </div>

      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onQty(item.productId, item.quantity - 1)}
          className="h-8 w-8 rounded border border-neutral-300 hover:bg-neutral-50"
        >
          −
        </button>
        <span className="w-8 text-center text-sm">{item.quantity}</span>
        <button
          type="button"
          onClick={() => onQty(item.productId, Math.min(item.quantity + 1, item.stock))}
          className="h-8 w-8 rounded border border-neutral-300 hover:bg-neutral-50"
        >
          +
        </button>
      </div>

      <div className="w-24 text-right font-medium">¥{formatCents(item.priceCents * item.quantity)}</div>

      <button
        type="button"
        onClick={() => onRemove(item.productId)}
        className="text-sm text-neutral-400 hover:text-red-600"
      >
        删除
      </button>
    </div>
  );
}

export function CartPage() {
  const { items, loading, totalCents, updateQuantity, removeItem } = useCart();
  const { status } = useSession();

  if (loading) {
    return <div className="py-20 text-center text-neutral-400">加载中…</div>;
  }

  if (items.length === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-neutral-500">购物车是空的</p>
        <Link href="/" className="mt-4 inline-block text-sm underline">
          去逛逛
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">购物车</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="divide-y divide-neutral-200 border-y border-neutral-200">
          {items.map((item) => (
            <CartRow
              key={item.productId}
              item={item}
              onQty={updateQuantity}
              onRemove={removeItem}
            />
          ))}
        </div>

        <div className="h-fit rounded-lg border border-neutral-200 p-4 lg:sticky lg:top-24">
          <p className="text-sm text-neutral-500">合计</p>
          <p className="mt-1 text-2xl font-bold text-red-600">¥{formatCents(totalCents)}</p>
          <Link href="/checkout" className="mt-4 block">
            <Button className="w-full" disabled={status !== "authenticated"}>
              {status === "authenticated" ? "去结算" : "登录后结算"}
            </Button>
          </Link>
          {status !== "authenticated" && (
            <p className="mt-2 text-center text-xs text-neutral-400">
              结算前需先 <Link href="/login" className="underline">登录</Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
