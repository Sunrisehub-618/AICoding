import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseImages } from "@/lib/utils";
import { ProductForm } from "@/components/admin/ProductForm";
import { updateProduct } from "@/lib/actions/admin";

export default async function EditProductPage(props: PageProps<"/admin/products/[id]/edit">) {
  const { id } = await props.params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!product) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">编辑商品</h1>
      <ProductForm
        action={updateProduct}
        categories={categories}
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          priceCents: product.priceCents,
          stock: product.stock,
          images: parseImages(product.images),
          categoryId: product.categoryId,
          isActive: product.isActive,
        }}
      />
    </div>
  );
}
