// src/events/listeners/index.ts
import { Server } from "socket.io";
import { registerOrderListeners } from "./order.listeners";
import { registerTradeListeners } from "./trade.listeners";

export const setupListeners = (io: Server) => {
  registerOrderListeners(io);
  registerTradeListeners(io);
};
