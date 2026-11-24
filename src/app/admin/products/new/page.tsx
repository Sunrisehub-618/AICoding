import { prisma } from "@/lib/prisma";
import { ProductForm } from "@/components/admin/ProductForm";
import { createProduct } from "@/lib/actions/admin";

export default async function NewProductPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">新增商品</h1>
      <ProductForm action={createProduct} categories={categories} />
    </div>
  );
}
