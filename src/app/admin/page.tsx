import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/utils";

export default async function AdminDashboard() {
  const [productCount, categoryCount, orderCount, sales] = await Promise.all([
    prisma.product.count(),
    prisma.category.count(),
    prisma.order.count(),
    prisma.order.aggregate({
      where: { status: { in: ["PAID", "SHIPPED", "COMPLETED"] } },
      _sum: { totalCents: true },
    }),
  ]);

  const stats = [
    { label: "商品数", value: String(productCount) },
    { label: "分类数", value: String(categoryCount) },
    { label: "订单数", value: String(orderCount) },
    { label: "销售额", value: `¥${formatCents(sales._sum.totalCents ?? 0)}` },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">仪表盘</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border border-neutral-200 p-4">
            <p className="text-sm text-neutral-500">{s.label}</p>
            <p className="mt-1 text-2xl font-bold">{s.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
