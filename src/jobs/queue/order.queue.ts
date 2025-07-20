// jobs/queues.ts
import { Queue } from "bullmq";
import { redis } from "../../config/redis";

export const matchOrderQueue = new Queue("match-order", {
  connection: redis,
});
