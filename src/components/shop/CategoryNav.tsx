import Link from "next/link";
import { cn } from "@/lib/utils";

type Category = { slug: string; name: string };

export function CategoryNav({
  categories,
  active,
}: {
  categories: Category[];
  active?: string;
}) {
  return (
    <div className="mb-6 flex flex-wrap gap-2">
      <Link
        href="/"
        className={cn(
          "rounded-full border px-4 py-1.5 text-sm transition-colors",
          !active
            ? "border-neutral-900 bg-neutral-900 text-white"
            : "border-neutral-300 hover:border-neutral-500",
        )}
      >
        全部
      </Link>
      {categories.map((c) => (
        <Link
          key={c.slug}
          href={`/?category=${c.slug}`}
          className={cn(
            "rounded-full border px-4 py-1.5 text-sm transition-colors",
            active === c.slug
              ? "border-neutral-900 bg-neutral-900 text-white"
              : "border-neutral-300 hover:border-neutral-500",
          )}
        >
          {c.name}
        </Link>
      ))}
    </div>
  );
}
