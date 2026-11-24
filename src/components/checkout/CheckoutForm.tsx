"use client";

import { useActionState } from "react";
import { createOrder, type OrderActionState } from "@/lib/actions/order";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

export function CheckoutForm() {
  const [state, action, pending] = useActionState<OrderActionState, FormData>(
    createOrder,
    undefined,
  );

  return (
    <form action={action} className="space-y-4">
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}
      <div>
        <Label htmlFor="receiverName">收货人</Label>
        <Input id="receiverName" name="receiverName" required autoComplete="name" />
      </div>
      <div>
        <Label htmlFor="receiverPhone">手机号</Label>
        <Input id="receiverPhone" name="receiverPhone" required autoComplete="tel" />
      </div>
      <div>
        <Label htmlFor="receiverAddr">收货地址</Label>
        <Textarea id="receiverAddr" name="receiverAddr" required rows={3} />
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "提交中…" : "提交订单"}
      </Button>
    </form>
  );
}
