import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/utils";
import { StatusBadge } from "@/components/orders/StatusBadge";

export const metadata: Metadata = { title: "我的订单" };

export default async function OrdersPage() {
  const user = await requireUser();
  const orders = await prisma.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">我的订单</h1>

      {orders.length === 0 ? (
        <p className="py-20 text-center text-neutral-400">
          还没有订单，<Link href="/" className="underline">去逛逛</Link>
        </p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <Link
              key={o.id}
              href={`/orders/${o.orderNo}`}
              className="block rounded-lg border border-neutral-200 p-4 transition-colors hover:border-neutral-400"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-neutral-500">订单号 {o.orderNo}</span>
                <StatusBadge status={o.status} />
              </div>
              <div className="mt-2 text-sm text-neutral-600">
                {o.items.length} 件商品 · {o.items[0]?.productName}
                {o.items.length > 1 ? " 等" : ""}
              </div>
              <div className="mt-2 flex items-center justify-between text-sm">
                <span className="text-neutral-500">{o.createdAt.toLocaleString("zh-CN")}</span>
                <span className="font-semibold">¥{formatCents(o.totalCents)}</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
