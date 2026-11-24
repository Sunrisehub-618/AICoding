"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/guards";
import { prisma } from "@/lib/prisma";
import { categorySchema, productSchema } from "@/lib/validators";

export type AdminActionState =
  | { error?: string; fieldErrors?: Record<string, string[]> }
  | undefined;

function parseProductForm(formData: FormData) {
  const images = String(formData.get("images") ?? "")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  const priceYuan = Number.parseFloat(String(formData.get("priceYuan") ?? "0"));
  return {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    priceCents: Math.round((Number.isFinite(priceYuan) ? priceYuan : 0) * 100),
    stock: formData.get("stock"),
    images,
    categoryId: formData.get("categoryId"),
    isActive: formData.get("isActive") === "on",
  };
}

export async function createProduct(
  prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = productSchema.safeParse(parseProductForm(formData));
  if (!parsed.success) {
    return { error: "请检查输入", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const exists = await prisma.product.findUnique({ where: { slug: parsed.data.slug } });
  if (exists) return { error: "该 slug 已存在" };

  await prisma.product.create({
    data: { ...parsed.data, images: JSON.stringify(parsed.data.images) },
  });

  revalidatePath("/");
  redirect("/admin/products");
}

export async function updateProduct(
  prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const parsed = productSchema.safeParse(parseProductForm(formData));
  if (!parsed.success) {
    return { error: "请检查输入", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const exists = await prisma.product.findUnique({ where: { slug: parsed.data.slug } });
  if (exists && exists.id !== id) return { error: "该 slug 已存在" };

  await prisma.product.update({
    where: { id },
    data: { ...parsed.data, images: JSON.stringify(parsed.data.images) },
  });

  revalidatePath("/");
  redirect("/admin/products");
}

export async function toggleProductActive(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) redirect("/admin/products");

  await prisma.product.update({ where: { id }, data: { isActive: !product.isActive } });
  revalidatePath("/");
  revalidatePath("/admin/products");
}

export async function createCategory(
  prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { error: "请检查输入", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const exists = await prisma.category.findUnique({ where: { slug: parsed.data.slug } });
  if (exists) return { error: "该 slug 已存在" };

  await prisma.category.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
    },
  });

  revalidatePath("/");
  redirect("/admin/categories");
}

export async function updateCategory(
  prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const id = String(formData.get("id") ?? "");
  const parsed = categorySchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
  });
  if (!parsed.success) {
    return { error: "请检查输入", fieldErrors: parsed.error.flatten().fieldErrors };
  }

  const exists = await prisma.category.findUnique({ where: { slug: parsed.data.slug } });
  if (exists && exists.id !== id) return { error: "该 slug 已存在" };

  await prisma.category.update({
    where: { id },
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      description: parsed.data.description || null,
    },
  });

  revalidatePath("/");
  redirect("/admin/categories");
}

export async function deleteCategory(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const productCount = await prisma.product.count({ where: { categoryId: id } });
  if (productCount > 0) redirect("/admin/categories?error=hasProducts");

  await prisma.category.delete({ where: { id } });
  revalidatePath("/");
  redirect("/admin/categories");
}

const ORDER_TRANSITIONS: Record<string, string[]> = {
  PENDING_PAYMENT: ["PAID", "CANCELLED"],
  PAID: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};

export async function updateOrderStatus(formData: FormData) {
  await requireAdmin();
  const orderNo = String(formData.get("orderNo") ?? "");
  const status = String(formData.get("status") ?? "");

  const order = await prisma.order.findUnique({
    where: { orderNo },
    include: { items: true },
  });
  if (!order) redirect("/admin/orders");

  if (!ORDER_TRANSITIONS[order.status]?.includes(status)) {
    redirect(`/admin/orders/${orderNo}?error=invalid`);
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({ where: { orderNo }, data: { status } });
    // 取消待支付/已支付订单时回补库存
    if (status === "CANCELLED" && order.status !== "SHIPPED" && order.status !== "COMPLETED") {
      for (const item of order.items) {
        if (item.productId) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
        }
      }
    }
  });

  revalidatePath("/admin/orders");
  redirect(`/admin/orders/${orderNo}`);
}
