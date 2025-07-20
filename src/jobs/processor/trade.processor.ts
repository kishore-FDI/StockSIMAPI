// import { Worker } from "bullmq";
// import { redis } from "../../config/redis";
// import { executeTrade } from "../../services/trade.service";

// export const tradeWorker = new Worker(
//   "trade-queue",
//   async (job) => {
//     const { buyOrderId, sellOrderId } = job.data;
//     await executeTrade(buyOrderId, sellOrderId);
//   },
//   { connection: redis }
// );
