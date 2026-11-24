import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCartLines } from "@/lib/cart";

async function requireUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}

export async function GET() {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });
  return NextResponse.json({ items: await getCartLines(userId) });
}

const addSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

export async function POST(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const parsed = addSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "参数错误" }, { status: 400 });

  const { productId, quantity } = parsed.data;
  const product = await prisma.product.findUnique({ where: { id: productId } });
  if (!product || !product.isActive) {
    return NextResponse.json({ error: "商品不存在或已下架" }, { status: 400 });
  }

  const existing = await prisma.cartItem.findUnique({
    where: { userId_productId: { userId, productId } },
  });
  const nextQty = Math.min((existing?.quantity ?? 0) + quantity, product.stock);
  await prisma.cartItem.upsert({
    where: { userId_productId: { userId, productId } },
    update: { quantity: nextQty },
    create: { userId, productId, quantity: nextQty },
  });

  return NextResponse.json({ items: await getCartLines(userId) });
}

const patchSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(0),
});

export async function PATCH(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const parsed = patchSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "参数错误" }, { status: 400 });

  const { productId, quantity } = parsed.data;
  if (quantity <= 0) {
    await prisma.cartItem.deleteMany({ where: { userId, productId } });
  } else {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    const qty = product ? Math.min(quantity, product.stock) : quantity;
    await prisma.cartItem.update({
      where: { userId_productId: { userId, productId } },
      data: { quantity: qty },
    });
  }

  return NextResponse.json({ items: await getCartLines(userId) });
}

export async function DELETE(req: Request) {
  const userId = await requireUserId();
  if (!userId) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const productId = new URL(req.url).searchParams.get("productId");
  if (!productId) return NextResponse.json({ error: "参数错误" }, { status: 400 });

  await prisma.cartItem.deleteMany({ where: { userId, productId } });
  return NextResponse.json({ items: await getCartLines(userId) });
}
