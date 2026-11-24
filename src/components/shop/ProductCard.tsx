import Link from "next/link";
import { formatCents, parseImages } from "@/lib/utils";

type ProductCardProps = {
  product: {
    slug: string;
    name: string;
    priceCents: number;
    images: string;
    category?: { name: string } | null;
  };
};

export function ProductCard({ product }: ProductCardProps) {
  const image = parseImages(product.images)[0];

  return (
    <Link
      href={`/products/${product.slug}`}
      className="group overflow-hidden rounded-lg border border-neutral-200 transition-colors hover:border-neutral-400"
    >
      <div className="aspect-square w-full overflow-hidden bg-neutral-100">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={image}
            alt={product.name}
            className="h-full w-full object-cover transition-transform group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-neutral-400">无图</div>
        )}
      </div>
      <div className="p-3">
        <h3 className="truncate text-sm font-medium">{product.name}</h3>
        <p className="mt-0.5 text-xs text-neutral-500">{product.category?.name}</p>
        <p className="mt-1 font-semibold text-red-600">¥{formatCents(product.priceCents)}</p>
      </div>
    </Link>
  );
}
