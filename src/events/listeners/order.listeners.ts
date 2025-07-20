// src/events/listeners/order.listeners.ts
import { Server } from "socket.io";
import { eventEmitter } from "../emitter";
import {
  OrderCancelledPayload,
  OrderFilledPayload,
  OrderPlacedPayload,
} from "../payloads/order.payloads";
import { EVENTS } from "../types";

export const registerOrderListeners = (io: Server) => {
  // Emit when a new order is placed
  eventEmitter.on(EVENTS.ORDER_PLACED, (data: OrderPlacedPayload) => {
    console.log("Event emitted order:placed");
    io.emit("order:placed", data);
  });

  // Emit when an order is filled
  eventEmitter.on(EVENTS.ORDER_FILLED, (data: OrderFilledPayload) => {
    console.log("Event Emitted order:filled");
    io.emit("order:filled", data);
  });

  // Emit when an order is cancelled
  eventEmitter.on(EVENTS.ORDER_CANCELLED, (data: OrderCancelledPayload) => {
    console.log("Event emitted order:cancelled");
    io.emit("order:cancelled", data);
  });
};
