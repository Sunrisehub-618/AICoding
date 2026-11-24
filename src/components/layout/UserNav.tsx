"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { logout } from "@/lib/actions/auth";

export function UserNav() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <span className="text-sm text-neutral-400">…</span>;
  }

  if (!session) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <Link href="/login" className="hover:text-neutral-900">
          登录
        </Link>
        <Link href="/register" className="hover:text-neutral-900">
          注册
        </Link>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 text-sm">
      {session.user.role === "ADMIN" && (
        <Link href="/admin" className="text-neutral-500 hover:text-neutral-900">
          后台
        </Link>
      )}
      <Link href="/orders" className="text-neutral-600 hover:text-neutral-900">
        我的订单
      </Link>
      <span className="max-w-24 truncate text-neutral-700">
        {session.user.name ?? session.user.email}
      </span>
      <form action={logout}>
        <button type="submit" className="text-neutral-500 hover:text-neutral-900">
          退出
        </button>
      </form>
    </div>
  );
}
