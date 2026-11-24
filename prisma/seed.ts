import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // 管理员账号：admin@minimall.com / admin123456
  await prisma.user.upsert({
    where: { email: "admin@minimall.com" },
    update: {},
    create: {
      email: "admin@minimall.com",
      passwordHash: await hash("admin123456", 10),
      name: "管理员",
      role: "ADMIN",
    },
  });

  // 普通用户：user@minimall.com / user123456
  await prisma.user.upsert({
    where: { email: "user@minimall.com" },
    update: {},
    create: {
      email: "user@minimall.com",
      passwordHash: await hash("user123456", 10),
      name: "测试用户",
      role: "USER",
    },
  });

  const categories = [
    { name: "数码电子", slug: "electronics", description: "手机、电脑与配件" },
    { name: "服饰鞋包", slug: "fashion", description: "服装、鞋履与箱包" },
    { name: "图书文娱", slug: "books", description: "图书与文创" },
    { name: "家居生活", slug: "home", description: "家居日用品" },
  ];

  const categoryId: Record<string, string> = {};
  for (const c of categories) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, description: c.description },
      create: c,
    });
    categoryId[c.slug] = row.id;
  }

  const products = [
    {
      name: "无线蓝牙耳机",
      slug: "wireless-earbuds",
      category: "electronics",
      priceCents: 29900,
      stock: 120,
      description: "主动降噪，30 小时续航，支持快充与低延迟游戏模式。",
    },
    {
      name: "机械键盘 87 键",
      slug: "mechanical-keyboard",
      category: "electronics",
      priceCents: 45900,
      stock: 60,
      description: "热插拔轴体，PBT 键帽，三模连接，RGB 背光。",
    },
    {
      name: "便携显示器 15.6 英寸",
      slug: "portable-monitor",
      category: "electronics",
      priceCents: 89900,
      stock: 30,
      description: "1080P IPS 屏，Type-C 一线直连，轻薄便携。",
    },
    {
      name: "纯棉基础 T 恤",
      slug: "cotton-tshirt",
      category: "fashion",
      priceCents: 5900,
      stock: 200,
      description: "100% 纯棉，舒适透气，多色可选。",
    },
    {
      name: "经典帆布鞋",
      slug: "canvas-sneakers",
      category: "fashion",
      priceCents: 15900,
      stock: 90,
      description: "简约百搭，耐磨橡胶底，日常通勤首选。",
    },
    {
      name: "通勤双肩包",
      slug: "commuter-backpack",
      category: "fashion",
      priceCents: 21900,
      stock: 70,
      description: "大容量分区，防泼水面料，可容纳 15 英寸笔记本。",
    },
    {
      name: "深入理解计算机系统",
      slug: "csapp-book",
      category: "books",
      priceCents: 13900,
      stock: 50,
      description: "计算机系统领域的经典教材，程序员必读。",
    },
    {
      name: "手账本套装",
      slug: "journal-set",
      category: "books",
      priceCents: 3900,
      stock: 150,
      description: "精美手账本 + 贴纸胶带套装，记录每一天。",
    },
    {
      name: "陶瓷马克杯",
      slug: "ceramic-mug",
      category: "home",
      priceCents: 4900,
      stock: 180,
      description: "简约北欧风，320ml 容量，微波炉可用。",
    },
    {
      name: "香薰蜡烛",
      slug: "aroma-candle",
      category: "home",
      priceCents: 6900,
      stock: 100,
      description: "天然大豆蜡，木质香调，营造舒适氛围。",
    },
  ];

  for (const p of products) {
    const images = JSON.stringify([
      `https://picsum.photos/seed/${p.slug}-1/600/400`,
      `https://picsum.photos/seed/${p.slug}-2/600/400`,
    ]);
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        description: p.description,
        priceCents: p.priceCents,
        stock: p.stock,
        images,
        categoryId: categoryId[p.category],
        isActive: true,
      },
      create: {
        name: p.name,
        slug: p.slug,
        description: p.description,
        priceCents: p.priceCents,
        stock: p.stock,
        images,
        categoryId: categoryId[p.category],
        isActive: true,
      },
    });
  }

  console.log("Seed 完成：2 个账号，4 个分类，10 个商品");
  console.log("管理员 admin@minimall.com / admin123456");
  console.log("用户   user@minimall.com / user123456");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
