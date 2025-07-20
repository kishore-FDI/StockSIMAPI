// src/events/payloads/order.payloads.ts

export interface OrderPlacedPayload {
  orderId: number;
  stockId: string;
  userId: string;
  type: "buy" | "sell";
  quantity: number;
  price: number;
  createdAt: string;
}

export interface OrderFilledPayload {
  orderId: number;
  filledQuantity: number;
  remainingQuantity: number;
  status: "completed" | "partially_filled";
}

export interface OrderCancelledPayload {
  orderId: number;
  userId: string;
}
