"use client";

import { useActionState } from "react";
import type { AdminActionState } from "@/lib/actions/admin";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  stock: number;
  images: string[];
  categoryId: string;
  isActive: boolean;
};

export function ProductForm({
  action,
  categories,
  initial,
}: {
  action: (prev: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  categories: { id: string; name: string }[];
  initial?: ProductFormValues;
}) {
  const [state, formAction, pending] = useActionState<AdminActionState, FormData>(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}

      <div>
        <Label htmlFor="name">商品名</Label>
        <Input id="name" name="name" defaultValue={initial?.name} required />
        {state?.fieldErrors?.name && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="slug">slug</Label>
        <Input
          id="slug"
          name="slug"
          defaultValue={initial?.slug}
          required
          placeholder="例如 wireless-earbuds"
        />
        {state?.fieldErrors?.slug && (
          <p className="mt-1 text-sm text-red-600">{state.fieldErrors.slug[0]}</p>
        )}
      </div>

      <div>
        <Label htmlFor="description">描述</Label>
        <Textarea
          id="description"
          name="description"
          defaultValue={initial?.description}
          required
          rows={4}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="priceYuan">价格（元）</Label>
          <Input
            id="priceYuan"
            name="priceYuan"
            type="number"
            step="0.01"
            min="0"
            defaultValue={initial ? (initial.priceCents / 100).toFixed(2) : ""}
            required
          />
        </div>
        <div>
          <Label htmlFor="stock">库存</Label>
          <Input id="stock" name="stock" type="number" min="0" defaultValue={initial?.stock} required />
        </div>
      </div>

      <div>
        <Label htmlFor="categoryId">分类</Label>
        <select
          id="categoryId"
          name="categoryId"
          defaultValue={initial?.categoryId}
          required
          className="h-10 w-full rounded-md border border-neutral-300 bg-white px-3 text-sm outline-none focus:border-neutral-500"
        >
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <Label htmlFor="images">图片链接（每行一个）</Label>
        <Textarea
          id="images"
          name="images"
          defaultValue={initial?.images.join("\n")}
          rows={3}
          placeholder="https://…"
        />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="isActive"
          defaultChecked={initial ? initial.isActive : true}
          className="h-4 w-4"
        />
        上架
      </label>

      <Button type="submit" disabled={pending}>
        {pending ? "保存中…" : "保存"}
      </Button>
    </form>
  );
}
