import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import { matchOrderQueue } from '../jobs/queue/order.queue';
import { tradeQueue } from '../jobs/queue/trade.queue';

// Create Express adapter
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

// Create Bull Board instance
const { addQueue, removeQueue, setQueues, replaceQueues } = createBullBoard({
  queues: [
    new BullMQAdapter(matchOrderQueue),
    new BullMQAdapter(tradeQueue)
  ],
  serverAdapter: serverAdapter,
});

export { serverAdapter, addQueue, removeQueue, setQueues, replaceQueues }; 