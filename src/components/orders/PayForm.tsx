"use client";

import { useActionState } from "react";
import { payOrder, type OrderActionState } from "@/lib/actions/order";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export function PayForm({ orderNo }: { orderNo: string }) {
  const [state, action, pending] = useActionState<OrderActionState, FormData>(
    payOrder,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="orderNo" value={orderNo} />
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}

      <div>
        <Label htmlFor="cardNo">银行卡号（模拟，随意填写）</Label>
        <Input id="cardNo" name="cardNo" placeholder="6222 0000 0000 0000" required />
      </div>
      <div>
        <Label htmlFor="holder">持卡人（模拟）</Label>
        <Input id="holder" name="holder" placeholder="姓名" required />
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "处理中…" : "确认支付"}
      </Button>
      <p className="text-center text-xs text-neutral-400">这是模拟支付，不会产生真实扣款</p>
    </form>
  );
}
