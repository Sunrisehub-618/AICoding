import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { updateCategory } from "@/lib/actions/admin";

export default async function EditCategoryPage(props: PageProps<"/admin/categories/[id]/edit">) {
  const { id } = await props.params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) notFound();

  return (
    <div className="max-w-md">
      <h1 className="mb-6 text-2xl font-bold">编辑分类</h1>
      <CategoryForm
        action={updateCategory}
        initial={{
          id: category.id,
          name: category.name,
          slug: category.slug,
          description: category.description,
        }}
      />
    </div>
  );
}
