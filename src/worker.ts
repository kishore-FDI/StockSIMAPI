import { orderProcessor } from "./jobs/processor/order-processor";

orderProcessor.on("completed", (job) => {
  console.log(`✅ Job ${job.id} completed for stockId: ${job.data.stockId}`);
});

orderProcessor.on("failed", (job, err) => {
  console.error(`❌ Job ${job?.id} failed:`, err);
});

console.log("🚀 Order Matching Worker started and listening...");
