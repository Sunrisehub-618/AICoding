"use server";

import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { receiverSchema } from "@/lib/validators";
import { generateOrderNo } from "@/lib/order";

export type OrderActionState = { error?: string } | undefined;

export async function createOrder(
  prev: OrderActionState,
  formData: FormData,
): Promise<OrderActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const parsed = receiverSchema.safeParse({
    receiverName: formData.get("receiverName"),
    receiverPhone: formData.get("receiverPhone"),
    receiverAddr: formData.get("receiverAddr"),
  });
  if (!parsed.success) return { error: "请完整填写收货信息" };

  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    include: { product: true },
  });
  if (cartItems.length === 0) return { error: "购物车是空的" };

  if (cartItems.some((i) => !i.product.isActive)) {
    return { error: "购物车中有已下架商品，请先移除" };
  }
  if (cartItems.some((i) => i.quantity > i.product.stock)) {
    return { error: "部分商品库存不足，请调整数量" };
  }

  const totalCents = cartItems.reduce((s, i) => s + i.product.priceCents * i.quantity, 0);
  const orderNo = generateOrderNo();

  try {
    await prisma.$transaction(async (tx) => {
      // 事务内再次扣减并校验库存，防止超卖
      for (const i of cartItems) {
        const res = await tx.product.updateMany({
          where: { id: i.productId, stock: { gte: i.quantity }, isActive: true },
          data: { stock: { decrement: i.quantity } },
        });
        if (res.count === 0) throw new Error("INSUFFICIENT");
      }

      await tx.order.create({
        data: {
          orderNo,
          userId,
          status: "PENDING_PAYMENT",
          totalCents,
          receiverName: parsed.data.receiverName,
          receiverPhone: parsed.data.receiverPhone,
          receiverAddr: parsed.data.receiverAddr,
          items: {
            create: cartItems.map((i) => ({
              productId: i.productId,
              productName: i.product.name,
              priceCents: i.product.priceCents,
              quantity: i.quantity,
              subtotalCents: i.product.priceCents * i.quantity,
            })),
          },
        },
      });

      await tx.cartItem.deleteMany({ where: { userId } });
    });
  } catch (e) {
    if (e instanceof Error && e.message === "INSUFFICIENT") {
      return { error: "库存不足或商品已下架，请刷新后重试" };
    }
    throw e;
  }

  redirect(`/orders/${orderNo}/pay`);
}

export async function payOrder(prev: OrderActionState, formData: FormData): Promise<OrderActionState> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const orderNo = String(formData.get("orderNo") ?? "");
  if (!orderNo) return { error: "参数错误" };

  const order = await prisma.order.findUnique({ where: { orderNo } });
  if (!order || order.userId !== userId) return { error: "订单不存在" };
  if (order.status !== "PENDING_PAYMENT") {
    redirect(`/orders/${orderNo}`);
  }

  await prisma.order.update({ where: { orderNo }, data: { status: "PAID" } });
  redirect(`/orders/${orderNo}`);
}

export async function cancelOrder(formData: FormData) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const orderNo = String(formData.get("orderNo") ?? "");
  const order = await prisma.order.findUnique({
    where: { orderNo },
    include: { items: true },
  });
  if (!order || order.userId !== userId) redirect("/orders");
  if (order.status !== "PENDING_PAYMENT") redirect(`/orders/${orderNo}`);

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { orderNo }, data: { status: "CANCELLED" } });
    for (const item of order.items) {
      if (item.productId) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }
  });

  redirect(`/orders/${orderNo}`);
}
