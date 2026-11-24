import type { Metadata } from "next";
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = { title: "登录" };

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm">
      <h1 className="mb-6 text-2xl font-bold">登录</h1>
      <LoginForm />
    </div>
  );
}
