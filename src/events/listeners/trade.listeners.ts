import { Server } from "socket.io";
import { eventEmitter } from "../emitter";
import { TradeExecutedPayload } from "../payloads/trade.payloads";
import { EVENTS } from "../types";

export const registerTradeListeners = (io: Server) => {
  eventEmitter.on(EVENTS.TRADE_EXECUTED, (data: TradeExecutedPayload) => {
    // Emit globally, or optimize later to emit to rooms
    io.emit("trade:executed", data);
    io.to(data.buyerId).emit("trade:executed", data);
    io.to(data.sellerId).emit("trade:executed", data);
  });
};
