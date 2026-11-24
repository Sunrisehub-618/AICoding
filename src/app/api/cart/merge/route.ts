import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCartLines } from "@/lib/cart";

const mergeSchema = z.object({
  items: z
    .array(z.object({ productId: z.string().min(1), quantity: z.number().int().positive() }))
    .max(100),
});

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const parsed = mergeSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "参数错误" }, { status: 400 });

  for (const item of parsed.data.items) {
    const product = await prisma.product.findUnique({ where: { id: item.productId } });
    if (!product || !product.isActive) continue;

    const existing = await prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId: item.productId } },
    });
    const nextQty = Math.min((existing?.quantity ?? 0) + item.quantity, product.stock);
    await prisma.cartItem.upsert({
      where: { userId_productId: { userId, productId: item.productId } },
      update: { quantity: nextQty },
      create: { userId, productId: item.productId, quantity: nextQty },
    });
  }

  return NextResponse.json({ items: await getCartLines(userId) });
}
