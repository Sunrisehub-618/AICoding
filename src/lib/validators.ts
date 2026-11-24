import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "名字至少 2 个字符").max(50),
  email: z.email("邮箱格式不正确").trim().toLowerCase(),
  password: z.string().min(8, "密码至少 8 位").max(100),
});

export const loginSchema = z.object({
  email: z.email("邮箱格式不正确").trim().toLowerCase(),
  password: z.string().min(1, "请输入密码"),
});

export const receiverSchema = z.object({
  receiverName: z.string().trim().min(2, "收货人至少 2 个字符").max(50),
  receiverPhone: z.string().trim().min(6, "手机号格式不正确").max(20),
  receiverAddr: z.string().trim().min(5, "地址至少 5 个字符").max(200),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, "请输入分类名").max(50),
  slug: z
    .string()
    .trim()
    .min(1, "请输入 slug")
    .max(50)
    .regex(/^[a-z0-9-]+$/, "slug 仅限小写字母、数字、连字符"),
  description: z.string().trim().max(500).optional().or(z.literal("")),
});

export const productSchema = z.object({
  name: z.string().trim().min(1, "请输入商品名").max(100),
  slug: z
    .string()
    .trim()
    .min(1, "请输入 slug")
    .max(100)
    .regex(/^[a-z0-9-]+$/, "slug 仅限小写字母、数字、连字符"),
  description: z.string().trim().min(1, "请输入商品描述"),
  priceCents: z.coerce.number().int("价格需为整数（分）").min(0, "价格不能为负"),
  stock: z.coerce.number().int("库存需为整数").min(0, "库存不能为负"),
  images: z.array(z.url("图片链接格式不正确")).max(8, "最多 8 张图片"),
  categoryId: z.string().min(1, "请选择分类"),
  isActive: z.boolean(),
});
