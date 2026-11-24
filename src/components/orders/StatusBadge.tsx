import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

const styles: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "border-amber-200 bg-amber-50 text-amber-700",
  PAID: "border-blue-200 bg-blue-50 text-blue-700",
  SHIPPED: "border-indigo-200 bg-indigo-50 text-indigo-700",
  COMPLETED: "border-green-200 bg-green-50 text-green-700",
  CANCELLED: "border-neutral-200 bg-neutral-100 text-neutral-500",
};

export function StatusBadge({ status }: { status: string }) {
  const s = status as OrderStatus;
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
        styles[s] ?? styles.CANCELLED,
      )}
    >
      {ORDER_STATUS_LABELS[s] ?? status}
    </span>
  );
}
