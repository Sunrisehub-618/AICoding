import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/guards";
import { getCartLines } from "@/lib/cart";
import { formatCents } from "@/lib/utils";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export const metadata: Metadata = { title: "结算" };

export default async function CheckoutPage() {
  const user = await requireUser();
  const lines = await getCartLines(user.id);

  if (lines.length === 0) redirect("/cart");

  const totalCents = lines.reduce((s, l) => s + l.priceCents * l.quantity, 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">结算</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <h2 className="mb-4 font-semibold">收货信息</h2>
          <CheckoutForm />
        </div>

        <div className="h-fit rounded-lg border border-neutral-200 p-4">
          <h2 className="mb-3 font-semibold">订单明细</h2>
          <ul className="divide-y divide-neutral-200 border-y border-neutral-200">
            {lines.map((l) => (
              <li key={l.productId} className="flex justify-between py-2 text-sm">
                <span>
                  {l.name} × {l.quantity}
                </span>
                <span>¥{formatCents(l.priceCents * l.quantity)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex justify-between text-sm">
            <span>合计</span>
            <span className="font-bold text-red-600">¥{formatCents(totalCents)}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
