export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/** 分 -> 元字符串，如 1290 -> "12.90" */
export function formatCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

/** 解析商品 images 字段（JSON 字符串数组） */
export function parseImages(json: string | null | undefined): string[] {
  if (!json) return [];
  try {
    const v = JSON.parse(json);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}
