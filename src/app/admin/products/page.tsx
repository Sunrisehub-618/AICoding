import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatCents } from "@/lib/utils";
import { toggleProductActive } from "@/lib/actions/admin";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">商品管理</h1>
        <Link
          href="/admin/products/new"
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white hover:bg-neutral-700"
        >
          新增商品
        </Link>
      </div>

      <div className="overflow-x-auto rounded-lg border border-neutral-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50 text-left text-neutral-500">
              <th className="px-4 py-2 font-medium">商品</th>
              <th className="px-4 py-2 font-medium">分类</th>
              <th className="px-4 py-2 font-medium">价格</th>
              <th className="px-4 py-2 font-medium">库存</th>
              <th className="px-4 py-2 font-medium">状态</th>
              <th className="px-4 py-2 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-neutral-100 last:border-0">
                <td className="px-4 py-2">{p.name}</td>
                <td className="px-4 py-2">{p.category.name}</td>
                <td className="px-4 py-2">¥{formatCents(p.priceCents)}</td>
                <td className="px-4 py-2">{p.stock}</td>
                <td className="px-4 py-2">
                  {p.isActive ? (
                    <span className="text-green-600">上架</span>
                  ) : (
                    <span className="text-neutral-400">下架</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center gap-3">
                    <Link href={`/admin/products/${p.id}/edit`} className="text-neutral-600 underline">
                      编辑
                    </Link>
                    <form action={toggleProductActive}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="text-neutral-600 underline">
                        {p.isActive ? "下架" : "上架"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
