// src/sockets/user.handlers.ts
import { Server, Socket } from "socket.io";

interface UserHandshake {
  userId?: string;
}

export const registerUserHandlers = (io: Server, socket: Socket) => {
  try {
    const userId = (socket.handshake.query as UserHandshake).userId;

    if (userId) {
      socket.join(`user:${userId}`);
      console.log(`🔐 Socket ${socket.id} joined room user:${userId}`);
    }

    // Handle stock subscriptions
    socket.on("subscribe:stock", (stockId: string) => {
      try {
        if (!stockId) {
          throw new Error("Stock ID is required");
        }
        socket.join(`stock:${stockId}`);
        console.log(`📈 Socket ${socket.id} subscribed to stock:${stockId}`);
      } catch (error: any) {
        console.error(`Error subscribing to stock: ${error.message}`);
        socket.emit("error", { message: "Failed to subscribe to stock" });
      }
    });

    socket.on("unsubscribe:stock", (stockId: string) => {
      try {
        if (!stockId) {
          throw new Error("Stock ID is required");
        }
        socket.leave(`stock:${stockId}`);
        console.log(`📉 Socket ${socket.id} unsubscribed from stock:${stockId}`);
      } catch (error: any) {
        console.error(`Error unsubscribing from stock: ${error.message}`);
        socket.emit("error", { message: "Failed to unsubscribe from stock" });
      }
    });

    // Handle user-specific events
    socket.on("user:status", (status: string) => {
      try {
        if (!userId) {
          throw new Error("User not authenticated");
        }
        io.to(`user:${userId}`).emit("status:update", { status });
        console.log(`👤 User ${userId} status updated to: ${status}`);
      } catch (error: any) {
        console.error(`Error updating user status: ${error.message}`);
        socket.emit("error", { message: "Failed to update status" });
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ User disconnected: ${socket.id}`);
      if (userId) {
        console.log(`👤 User ${userId} disconnected`);
      }
    });

  } catch (error: any) {
    console.error(`Error in user handlers: ${error.message}`);
    socket.emit("error", { message: "Internal server error" });
  }
};
