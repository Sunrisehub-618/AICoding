import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/utils";
import { StatusBadge } from "@/components/orders/StatusBadge";
import { updateOrderStatus } from "@/lib/actions/admin";
import { Button } from "@/components/ui/Button";

const ACTIONS: Record<string, { status: string; label: string; danger?: boolean }[]> = {
  PENDING_PAYMENT: [
    { status: "PAID", label: "标记已支付" },
    { status: "CANCELLED", label: "取消订单", danger: true },
  ],
  PAID: [
    { status: "SHIPPED", label: "发货" },
    { status: "CANCELLED", label: "取消订单", danger: true },
  ],
  SHIPPED: [{ status: "COMPLETED", label: "完成订单" }],
  COMPLETED: [],
  CANCELLED: [],
};

export default async function AdminOrderDetailPage(props: PageProps<"/admin/orders/[orderNo]">) {
  const { orderNo } = await props.params;
  const sp = await props.searchParams;
  const invalid = typeof sp.error === "string" && sp.error === "invalid";

  const order = await prisma.order.findUnique({
    where: { orderNo },
    include: { user: true, items: true },
  });
  if (!order) notFound();

  return (
    <div className="max-w-3xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">订单详情</h1>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-2 text-sm text-neutral-500">
        订单号 {order.orderNo} · 用户 {order.user.email} ·{" "}
        {order.createdAt.toLocaleString("zh-CN")}
      </p>

      {invalid && (
        <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">非法状态流转</p>
      )}

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

      {ACTIONS[order.status]?.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          {ACTIONS[order.status].map((a) => (
            <form key={a.status} action={updateOrderStatus}>
              <input type="hidden" name="orderNo" value={order.orderNo} />
              <input type="hidden" name="status" value={a.status} />
              <Button type="submit" variant={a.danger ? "outline" : "primary"}>
                {a.label}
              </Button>
            </form>
          ))}
        </div>
      )}
    </div>
  );
}
