import { redis } from '../config/redis';
import { getIO } from '../sockets';

const ORDER_FILLED_CHANNEL = 'order:filled';
const TRADE_EXECUTED_CHANNEL = 'trade:executed';

// Subscribe to Redis channels
export const setupRedisSubscriptions = () => {
  console.log('Setting up Redis subscriptions...');
  const subscriber = redis.duplicate();
  
  // Subscribe to channels
  subscriber.subscribe(ORDER_FILLED_CHANNEL, (err) => {
    if (err) {
      console.error('Error subscribing to order filled channel:', err);
    } else {
      console.log('Successfully subscribed to order filled channel');
    }
  });

  subscriber.subscribe(TRADE_EXECUTED_CHANNEL, (err) => {
    if (err) {
      console.error('Error subscribing to trade executed channel:', err);
    } else {
      console.log('Successfully subscribed to trade executed channel');
    }
  });

  // Handle messages
  subscriber.on('message', (channel: string, message: string) => {
    console.log(`Received message on channel ${channel}:`, message);
    
    try {
      if (channel === ORDER_FILLED_CHANNEL) {
        const data = JSON.parse(message);
        console.log('Processing order filled event:', data);
        const io = getIO();
        console.log('Socket.IO instance:', io ? 'Available' : 'Not available');
        io.emit('order:filled', data);
        console.log('Order filled event emitted to socket');
      } else if (channel === TRADE_EXECUTED_CHANNEL) {
        const data = JSON.parse(message);
        console.log('Processing trade executed event:', data);
        const io = getIO();
        console.log('Socket.IO instance:', io ? 'Available' : 'Not available');
        io.emit('trade:executed', data);
        console.log('Trade executed event emitted to socket');
      }
    } catch (error) {
      console.error('Error processing Redis message:', error);
    }
  });

  return subscriber;
};

// Publish events to Redis
export const publishOrderFilled = (data: any) => {
  console.log('Publishing order filled event to Redis:', data);
  redis.publish(ORDER_FILLED_CHANNEL, JSON.stringify(data))
    .then(() => console.log('Order filled event published successfully'))
    .catch(err => console.error('Error publishing order filled event:', err));
};

export const publishTradeExecuted = (data: any) => {
  console.log('Publishing trade executed event to Redis:', data);
  redis.publish(TRADE_EXECUTED_CHANNEL, JSON.stringify(data))
    .then(() => console.log('Trade executed event published successfully'))
    .catch(err => console.error('Error publishing trade executed event:', err));
}; 