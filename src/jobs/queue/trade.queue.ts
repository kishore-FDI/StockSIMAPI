import { Queue } from "bullmq";
import { defaultQueueOptions } from "../../config/bullmq";

export const tradeQueue = new Queue("trade-queue", defaultQueueOptions);
