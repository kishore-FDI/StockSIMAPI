import http from "http";
import app from "./app";
import { initSocket } from "./sockets";
import { setupRedisSubscriptions } from "./events/redis-pubsub";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      }; // or whatever your structure is
    }
  }
}

const server = http.createServer(app);

// Initialize Socket.IO
initSocket(server);

// Setup Redis subscriptions
const redisSubscriber = setupRedisSubscriptions();

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});

// Cleanup on server shutdown
process.on('SIGTERM', () => {
  redisSubscriber.quit();
  server.close();
});
