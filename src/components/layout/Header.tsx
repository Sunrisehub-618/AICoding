import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { UserNav } from "./UserNav";
import { CartLink } from "./CartLink";

export async function Header() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4">
        <Link href="/" className="text-lg font-bold tracking-tight">
          Mini Mall
        </Link>

        <form action="/" method="GET" className="flex-1">
          <input
            name="q"
            type="search"
            placeholder="搜索商品…"
            className="h-10 w-full max-w-sm rounded-md border border-neutral-300 px-3 text-sm outline-none transition-colors placeholder:text-neutral-400 focus:border-neutral-500"
          />
        </form>

        <nav className="hidden items-center gap-4 text-sm text-neutral-600 lg:flex">
          {categories.slice(0, 5).map((c) => (
            <Link key={c.id} href={`/?category=${c.slug}`} className="hover:text-neutral-900">
              {c.name}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <CartLink />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
