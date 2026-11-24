import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCents, parseImages } from "@/lib/utils";
import { AddToCartButton } from "@/components/cart/AddToCartButton";

export async function generateMetadata(props: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true },
  });
  return { title: product?.name ?? "商品" };
}

export default async function ProductPage(props: PageProps<"/products/[slug]">) {
  const { slug } = await props.params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });
  if (!product || !product.isActive) notFound();

  const images = parseImages(product.images);
  const cartProduct = {
    productId: product.id,
    slug: product.slug,
    name: product.name,
    priceCents: product.priceCents,
    image: images[0] ?? null,
    quantity: 1,
    stock: product.stock,
    isActive: product.isActive,
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-lg bg-neutral-100">
          {images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={images[0]} alt={product.name} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-neutral-400">无图</div>
          )}
        </div>

        <div>
          <nav className="mb-3 text-sm text-neutral-500">
            <Link href="/" className="hover:text-neutral-900">
              首页
            </Link>
            <span className="mx-1">/</span>
            <Link href={`/?category=${product.category.slug}`} className="hover:text-neutral-900">
              {product.category.name}
            </Link>
          </nav>

          <h1 className="text-2xl font-bold">{product.name}</h1>
          <p className="mt-3 text-3xl font-bold text-red-600">¥{formatCents(product.priceCents)}</p>
          <p className="mt-2 text-sm text-neutral-500">
            库存 {product.stock} 件{product.stock <= 0 ? "（已售罄）" : ""}
          </p>

          <div className="mt-6 whitespace-pre-line leading-relaxed text-neutral-700">
            {product.description}
          </div>

          <div className="mt-8 max-w-xs">
            <AddToCartButton product={cartProduct} className="w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}
