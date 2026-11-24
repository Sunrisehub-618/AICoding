import Link from "next/link";
import { requireAdmin } from "@/lib/guards";
import { logout } from "@/lib/actions/auth";

const nav = [
  { href: "/admin", label: "仪表盘" },
  { href: "/admin/products", label: "商品" },
  { href: "/admin/categories", label: "分类" },
  { href: "/admin/orders", label: "订单" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="flex min-h-screen">
      <aside className="w-56 shrink-0 border-r border-neutral-200 p-4">
        <Link href="/" className="block text-lg font-bold tracking-tight">
          Mini Mall
        </Link>
        <p className="mt-1 text-xs text-neutral-400">后台管理</p>
        <nav className="mt-6 space-y-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="block rounded-md px-3 py-2 text-sm text-neutral-700 hover:bg-neutral-100"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 border-t border-neutral-200 pt-4">
          <form action={logout}>
            <button type="submit" className="text-sm text-neutral-500 hover:text-neutral-900">
              退出登录
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
