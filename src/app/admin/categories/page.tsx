import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { createCategory, deleteCategory } from "@/lib/actions/admin";

export default async function AdminCategoriesPage(props: PageProps<"/admin/categories">) {
  const sp = await props.searchParams;
  const hasError = typeof sp.error === "string" && sp.error === "hasProducts";

  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <h1 className="mb-4 text-2xl font-bold">新增分类</h1>
        <CategoryForm action={createCategory} />
      </div>

      <div>
        <h1 className="mb-4 text-2xl font-bold">分类列表</h1>
        {hasError && (
          <p className="mb-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            该分类下还有商品，无法删除
          </p>
        )}
        <div className="rounded-lg border border-neutral-200">
          <ul className="divide-y divide-neutral-200">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center justify-between px-4 py-3 text-sm">
                <div>
                  <span className="font-medium">{c.name}</span>
                  <span className="ml-2 text-neutral-400">
                    /{c.slug} · {c._count.products} 件商品
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <Link
                    href={`/admin/categories/${c.id}/edit`}
                    className="text-neutral-600 underline"
                  >
                    编辑
                  </Link>
                  <form action={deleteCategory}>
                    <input type="hidden" name="id" value={c.id} />
                    <button type="submit" className="text-neutral-400 underline hover:text-red-600">
                      删除
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
