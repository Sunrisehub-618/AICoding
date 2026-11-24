"use client";

import { useActionState } from "react";
import type { AdminActionState } from "@/lib/actions/admin";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";

export function CategoryForm({
  action,
  initial,
}: {
  action: (prev: AdminActionState, formData: FormData) => Promise<AdminActionState>;
  initial?: { id: string; name: string; slug: string; description: string | null };
}) {
  const [state, formAction, pending] = useActionState<AdminActionState, FormData>(action, undefined);

  return (
    <form action={formAction} className="space-y-4">
      {initial?.id && <input type="hidden" name="id" value={initial.id} />}
      {state?.error && (
        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{state.error}</p>
      )}

      <div>
        <Label htmlFor="name">分类名</Label>
        <Input id="name" name="name" defaultValue={initial?.name} required />
      </div>
      <div>
        <Label htmlFor="slug">slug</Label>
        <Input id="slug" name="slug" defaultValue={initial?.slug} required placeholder="例如 books" />
      </div>
      <div>
        <Label htmlFor="description">描述</Label>
        <Input id="description" name="description" defaultValue={initial?.description ?? ""} />
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "保存中…" : "保存"}
      </Button>
    </form>
  );
}
