"use client";

import Link from "next/link";
import { useCart } from "@/components/cart/CartProvider";

export function CartLink() {
  const { count } = useCart();

  return (
    <Link href="/cart" className="relative text-sm hover:text-neutral-900">
      购物车
      {count > 0 && (
        <span className="absolute -right-2.5 -top-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-xs text-white">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
}
