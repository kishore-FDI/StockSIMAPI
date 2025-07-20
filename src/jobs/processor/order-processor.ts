import { Worker } from "bullmq";
import { redis } from "../../config/redis";
import { matchOrders } from "../../utils/matching-engine";

export const orderProcessor = new Worker(
  "match-order",
  async (job) => {
    console.log(`Processing job ${job.id} for stock ${job.data.stock_id}`);
    try {
      const { stock_id } = job.data;
      console.log('Job data:', job.data);
      await matchOrders(stock_id);
      console.log(`Successfully processed job ${job.id}`);
    } catch (error) {
      console.error(`Error processing job ${job.id}:`, error);
      throw error;
    }
  },
  { 
    connection: redis,
    concurrency: 1, // Process one job at a time
    removeOnComplete: {
      count: 1000, // Keep last 1000 completed jobs
      age: 24 * 3600 // Keep jobs for 24 hours
    },
    removeOnFail: {
      count: 5000 // Keep last 5000 failed jobs
    }
  }
);

// Log worker events
orderProcessor.on('completed', (job) => {
  console.log(`Job ${job.id} completed successfully`);
});

orderProcessor.on('failed', (job, error) => {
  console.error(`Job ${job?.id} failed:`, error);
});

orderProcessor.on('error', (error) => {
  console.error('Worker error:', error);
});
