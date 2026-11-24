import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";
import type { CartLine } from "@/lib/types";

/** 读取某用户的购物车行（含商品信息快照） */
export async function getCartLines(userId: string): Promise<CartLine[]> {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
    orderBy: { createdAt: "desc" },
  });
  return items.map((i) => ({
    productId: i.productId,
    slug: i.product.slug,
    name: i.product.name,
    priceCents: i.product.priceCents,
    image: parseImages(i.product.images)[0] ?? null,
    quantity: i.quantity,
    stock: i.product.stock,
    isActive: i.product.isActive,
  }));
}
