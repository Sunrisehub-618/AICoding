"use client";

import { useActionState } from "react";
import Link from "next/link";
import { login, type AuthState } from "@/lib/actions/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(login, undefined);

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}
      <div>
        <Label htmlFor="email">邮箱</Label>
        <Input id="email" name="email" type="email" autoComplete="email" required />
        {state?.fieldErrors?.email && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.email[0]}</p>
        )}
      </div>
      <div>
        <Label htmlFor="password">密码</Label>
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
        {state?.fieldErrors?.password && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.password[0]}</p>
        )}
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "登录中…" : "登录"}
      </Button>
      <p className="text-center text-sm text-neutral-500">
        还没有账号？{" "}
        <Link href="/register" className="text-neutral-900 underline">
          注册
        </Link>
      </p>
    </form>
  );
}
