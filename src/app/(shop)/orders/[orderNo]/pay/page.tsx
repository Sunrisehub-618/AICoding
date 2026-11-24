import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { requireUser } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/utils";
import { PayForm } from "@/components/orders/PayForm";

export const metadata: Metadata = { title: "模拟支付" };

export default async function PayPage(props: PageProps<"/orders/[orderNo]/pay">) {
  const user = await requireUser();
  const { orderNo } = await props.params;

  const order = await prisma.order.findUnique({ where: { orderNo } });
  if (!order || order.userId !== user.id) notFound();
  if (order.status !== "PENDING_PAYMENT") redirect(`/orders/${orderNo}`);

  return (
    <div className="mx-auto max-w-md px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">模拟支付</h1>
      <p className="mb-6 text-sm text-neutral-500">订单号 {order.orderNo}</p>

      <div className="mb-6 flex items-center justify-between rounded-lg border border-neutral-200 p-4">
        <span className="text-sm text-neutral-600">应付金额</span>
        <span className="text-xl font-bold text-red-600">¥{formatCents(order.totalCents)}</span>
      </div>

      <PayForm orderNo={order.orderNo} />
    </div>
  );
}
