"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register, type AuthState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export function RegisterForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(register, undefined);

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}
      <div>
        <Label htmlFor="name">昵称</Label>
        <Input id="name" name="name" autoComplete="name" required />
        {state?.fieldErrors?.name && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.name[0]}</p>
        )}
      </div>
      <div>
        <Label htmlFor="email">邮箱</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        {state?.fieldErrors?.email && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.email[0]}</p>
        )}
      </div>
      <div>
        <Label htmlFor="password">密码（至少 8 位）</Label>
        <Input id="password" name="password" type="password" autoComplete="new-password" required />
        {state?.fieldErrors?.password && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.password[0]}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "注册中…" : "注册"}
      </Button>
      <p className="text-center text-sm text-neutral-500">
        已有账号？{" "}
        <Link href="/login" className="text-neutral-900 underline">
          登录
        </Link>
      </p>
    </form>
  );
}
