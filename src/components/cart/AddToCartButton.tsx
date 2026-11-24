"use client";

import { useState } from "react";
import { useCart } from "@/components/cart/CartProvider";
import { Button } from "@/components/ui/Button";
import type { CartLine } from "@/lib/types";

export function AddToCartButton({
  product,
  className,
}: {
  product: CartLine;
  className?: string;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  async function handleClick() {
    await addItem(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  const soldOut = product.stock <= 0 || !product.isActive;

  return (
    <Button onClick={handleClick} disabled={soldOut} className={className}>
      {soldOut ? "已售罄" : added ? "已加入 ✓" : "加入购物车"}
    </Button>
  );
}
