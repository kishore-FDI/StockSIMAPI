import { Server as HTTPServer } from "http";
import { Server, Socket } from "socket.io";
import { setupListeners } from "../events/listeners";
import { registerSocketHandlers } from "./handlers";

let io: Server;

export const initSocket = (server: HTTPServer) => {
  console.log("Initializing Socket.IO server...");

  io = new Server(server, {
    cors: {
      origin: "*", // adjust for production
      methods: ["GET", "POST"],
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Log all events
  io.engine.on("connection_error", (err) => {
    console.error("Socket.IO connection error:", err);
  });

  io.on("connection", (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Log all events for this socket
    socket.onAny((eventName, ...args) => {
      console.log(`Socket ${socket.id} event ${eventName}:`, args);
    });

    socket.on("disconnect", (reason) => {
      console.log(`Client disconnected: ${socket.id}, reason: ${reason}`);
    });

    socket.on("error", (error) => {
      console.error(`Socket error for ${socket.id}:`, error);
    });
  });

  registerSocketHandlers(io);
  console.log("Socket handlers registered");

  // Register event listeners for order and trade events
  setupListeners(io);
  console.log("Event listeners setup complete");

  return io;
};

export const getIO = (): Server => {
  if (!io) {
    console.error("Socket.IO not initialized");
    throw new Error("Socket.IO not initialized");
  }
  return io;
};
