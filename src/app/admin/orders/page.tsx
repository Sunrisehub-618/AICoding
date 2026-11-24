import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { cn, formatCents } from "@/lib/utils";
import { ORDER_STATUSES, ORDER_STATUS_LABELS } from "@/lib/types";
import { StatusBadge } from "@/components/orders/StatusBadge";

export default async function AdminOrdersPage(props: PageProps<"/admin/orders">) {
  const sp = await props.searchParams;
  const status = typeof sp.status === "string" ? sp.status : "";

  const orders = await prisma.order.findMany({
    where: status ? { status } : {},
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">订单管理</h1>

      <div className="mb-4 flex flex-wrap gap-2">
        <Link
          href="/admin/orders"
          className={cn(
            "rounded-full border px-3 py-1 text-sm",
            !status ? "border-neutral-900 bg-neutral-900 text-white" : "border-neutral-300",
          )}
        >
          全部
        </Link>
        {ORDER_STATUSES.map((s) => (
          <Link
            key={s}
            href={`/admin/orders?status=${s}`}
            className={cn(
              "rounded-full border px-3 py-1 text-sm",
              status === s
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-300 hover:border-neutral-500",
            )}
          >
            {ORDER_STATUS_LABELS[s]}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-neutral-500">
              <th className="px-4 py-2 font-medium">订单号</th>
              <th className="px-4 py-2 font-medium">用户</th>
              <th className="px-4 py-2 font-medium">金额</th>
              <th className="px-4 py-2 font-medium">状态</th>
              <th className="px-4 py-2 font-medium">时间</th>
              <th className="px-4 py-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-2">{o.orderNo}</td>
                <td className="px-4 py-2">{o.user.email}</td>
                <td className="px-4 py-2">¥{formatCents(o.totalCents)}</td>
                <td className="px-4 py-2">
                  <StatusBadge status={o.status} />
                </td>
                <td className="px-4 py-2 text-neutral-500">{o.createdAt.toLocaleString("zh-CN")}</td>
                <td className="px-4 py-2">
                  <Link href={`/admin/orders/${o.orderNo}`} className="text-neutral-600 underline">
                    详情
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
