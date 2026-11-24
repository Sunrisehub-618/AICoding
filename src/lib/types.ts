export const ROLES = ["USER", "ADMIN"] as const;
export type Role = (typeof ROLES)[number];

export const ORDER_STATUSES = [
  "PENDING_PAYMENT",
  "PAID",
  "SHIPPED",
  "COMPLETED",
  "CANCELLED",
] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  PENDING_PAYMENT: "待支付",
  PAID: "已支付",
  SHIPPED: "已发货",
  COMPLETED: "已完成",
  CANCELLED: "已取消",
};

/** 购物车行：客户端（localStorage 快照）与服务端（API 返回）共用的结构 */
export type CartLine = {
  productId: string;
  slug: string;
  name: string;
  priceCents: number;
  image: string | null;
  quantity: number;
  stock: number;
  isActive: boolean;
};
