import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/utils";
import { CategoryNav } from "@/components/shop/CategoryNav";
import { ProductCard } from "@/components/shop/ProductCard";

export default async function HomePage(props: PageProps<"/">) {
  const sp = await props.searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const category = typeof sp.category === "string" ? sp.category : "";
  const sort = typeof sp.sort === "string" ? sp.sort : "newest";

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(q ? { OR: [{ name: { contains: q } }, { description: { contains: q } }] } : {}),
    ...(category ? { category: { slug: category } } : {}),
  };

  let orderBy: Prisma.ProductOrderByWithRelationInput;
  if (sort === "price_asc") orderBy = { priceCents: "asc" };
  else if (sort === "price_desc") orderBy = { priceCents: "desc" };
  else orderBy = { createdAt: "desc" };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where, include: { category: true }, orderBy }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  const sortUrl = (next: string) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    params.set("sort", next);
    return `/?${params.toString()}`;
  };

  const sortOptions = [
    { value: "newest", label: "最新" },
    { value: "price_asc", label: "价格 ↑" },
    { value: "price_desc", label: "价格 ↓" },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <CategoryNav categories={categories} active={category} />

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-neutral-500">
          {q ? `“${q}” 的搜索结果 · ` : ""}
          共 {products.length} 件商品
        </p>
        <div className="flex gap-1 text-sm">
          {sortOptions.map((o) => (
            <Link
              key={o.value}
              href={sortUrl(o.value)}
              className={cn(
                "rounded px-2 py-1",
                sort === o.value ? "bg-neutral-900 text-white" : "text-neutral-600 hover:bg-neutral-100",
              )}
            >
              {o.label}
            </Link>
          ))}
        </div>
      </div>

      {products.length === 0 ? (
        <p className="py-24 text-center text-neutral-400">没有找到相关商品</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
