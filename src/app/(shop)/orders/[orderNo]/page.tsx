import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/utils";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { cancelOrder } from "@/lib/actions/order";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = { title: "订单详情" };

export default async function OrderDetailPage(props: PageProps<"/orders/[orderNo]">) {
  const user = await requireUser();
  const { orderNo } = await props.params;

  const order = await prisma.order.findUnique({
    where: { orderNo },
    include: { items: true },
  });
  if (!order || order.userId !== user.id) notFound();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">订单详情</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-2 text-sm text-neutral-500">
        订单号 {order.orderNo} · {order.createdAt.toLocaleString("zh-CN")}
      </p>

      <div className="mt-6 rounded-lg border border-neutral-200 p-4">
        <h2 className="mb-2 font-semibold">收货信息</h2>
        <p className="text-sm">
          {order.receiverName} · {order.receiverPhone}
        </p>
        <p className="mt-1 text-sm text-neutral-600">{order.receiverAddr}</p>
      </div>

      <div className="mt-4 rounded-lg border border-neutral-200">
        <ul className="divide-y divide-neutral-200">
          {order.items.map((item) => (
            <li key={item.id} className="flex justify-between px-4 py-3 text-sm">
              <span>
                {item.productName} × {item.quantity}
              </span>
              <span>¥{formatCents(item.subtotalCents)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between border-t border-neutral-200 px-4 py-3">
          <span className="font-semibold">合计</span>
          <span className="font-bold text-red-600">¥{formatCents(order.totalCents)}</span>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {order.status === "PENDING_PAYMENT" && (
          <>
            <Link href={`/orders/${order.orderNo}/pay`}>
              <Button>去支付</Button>
            </Link>
            <form action={cancelOrder}>
              <input type="hidden" name="orderNo" value={order.orderNo} />
              <Button type="submit" variant="outline">
                取消订单
              </Button>
            </form>
          </>
        )}
        <Link href="/orders">
          <Button variant="ghost">返回订单列表</Button>
        </Link>
      </div>
    </div>
  );
}
