import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import {
  publishOrderFilled,
  publishTradeExecuted,
} from "../events/redis-pubsub";

export const matchOrders = async (stockId: string) => {
  const buyOrders = await prisma.order.findMany({
    where: { stock_id: stockId, type: "buy", status: "open" },
    orderBy: [{ price: "desc" }, { created_at: "asc" }],
  });

  const sellOrders = await prisma.order.findMany({
    where: { stock_id: stockId, type: "sell", status: "open" },
    orderBy: [{ price: "asc" }, { created_at: "asc" }],
  });

  // In-memory modifications
  const trades: any[] = [];
  const updatedOrders: Map<number, any> = new Map();
  const userWalletUpdates: Map<string, number> = new Map();
  const userReservedWalletUpdates: Map<string, number> = new Map();
  const balanceUpdates: Map<string, { quantity: number; reserved: number }> =
    new Map();

  for (const buy of buyOrders) {
    for (const sell of sellOrders) {
      const remainingBuy =
        buy.quantity -
        (updatedOrders.get(buy.id)?.full_filled_quantity ??
          buy.full_filled_quantity);
      const remainingSell =
        sell.quantity -
        (updatedOrders.get(sell.id)?.full_filled_quantity ??
          sell.full_filled_quantity);

      if (buy.price >= sell.price && remainingBuy > 0 && remainingSell > 0) {
        const matchedQuantity = Math.min(remainingBuy, remainingSell);
        const tradePrice = sell.price;

        // Store trade
        trades.push({
          buyer_id: buy.user_id,
          seller_id: sell.user_id,
          stock_id: stockId,
          price: tradePrice.toNumber(),
          quantity: matchedQuantity,
        });

        // Update buyer balance (received quantity)
        const buyKey = `${buy.user_id}|${stockId}`;
        if (!balanceUpdates.has(buyKey))
          balanceUpdates.set(buyKey, { quantity: 0, reserved: 0 });
        balanceUpdates.get(buyKey)!.quantity += matchedQuantity;

        // Update seller balance (reduce reserved quantity)
        const sellKey = `${sell.user_id}|${stockId}`;
        if (!balanceUpdates.has(sellKey))
          balanceUpdates.set(sellKey, { quantity: 0, reserved: 0 });
        balanceUpdates.get(sellKey)!.reserved += matchedQuantity;

        // Wallet updates
        userWalletUpdates.set(
          sell.user_id,
          (userWalletUpdates.get(sell.user_id) ?? 0) +
            tradePrice.toNumber() * matchedQuantity
        );
        userReservedWalletUpdates.set(
          buy.user_id,
          (userReservedWalletUpdates.get(buy.user_id) ?? 0) +
            tradePrice.toNumber() * matchedQuantity
        );

        // Update buy order state
        const updatedBuy = updatedOrders.get(buy.id) ?? { ...buy };
        updatedBuy.full_filled_quantity += matchedQuantity;
        updatedBuy.status =
          updatedBuy.full_filled_quantity >= updatedBuy.quantity
            ? "completed"
            : "open";
        updatedOrders.set(buy.id, updatedBuy);

        // Update sell order state
        const updatedSell = updatedOrders.get(sell.id) ?? { ...sell };
        updatedSell.full_filled_quantity += matchedQuantity;
        updatedSell.status =
          updatedSell.full_filled_quantity >= updatedSell.quantity
            ? "completed"
            : "open";
        updatedOrders.set(sell.id, updatedSell);

        // If buy order is fully filled, move to next buy
        if (updatedBuy.status === "completed") break;
      }
    }
  }

  // ✅ Persist changes in one transaction
  await prisma.$transaction(async (tx: any) => {
    // Insert trades
    for (const trade of trades) {
      const createdTrade = await tx.trade.create({ data: trade });

      // Publish trade event to Redis
      publishTradeExecuted({
        tradeId: createdTrade.id,
        stockId,
        price: trade.price,
        quantity: trade.quantity,
        buyerId: trade.buyer_id,
        sellerId: trade.seller_id,
        timestamp: createdTrade.timestamp?.toISOString(),
      });
    }

    // Update orders
    for (const [orderId, updatedOrder] of updatedOrders) {
      const result = await tx.order.update({
        where: { id: orderId },
        data: {
          full_filled_quantity: updatedOrder.full_filled_quantity,
          status: updatedOrder.status,
        },
      });

      // Publish order filled event to Redis
      publishOrderFilled({
        orderId: result.id,
        userId: result.user_id,
        remainingQuantity: result.quantity - result.full_filled_quantity,
        status: result.status,
        stockId,
      });
    }

    // Update balances
    for (const [key, value] of balanceUpdates) {
      const [userId, stockId] = key.split("|");
      console.log(key, userId, stockId);
      await tx.balance.upsert({
        where: {
          user_id_stock_id: {
            user_id: userId,
            stock_id: stockId,
          },
        },
        update: {
          quantity: { increment: value.quantity },
          reserved_quantity: { decrement: value.reserved },
        },
        create: {
          user_id: userId,
          stock_id: stockId,
          quantity: value.quantity,
          reserved_quantity: 0,
          avg_price: 0, // Optionally compute average price
        },
      });
    }

    // Update wallets
    for (const [userId, value] of userWalletUpdates) {
      await tx.user.update({
        where: { id: userId },
        data: { wallet: { increment: value } },
      });
    }

    for (const [userId, value] of userReservedWalletUpdates) {
      await tx.user.update({
        where: { id: userId },
        data: { reserved_wallet: { decrement: value } },
      });
    }
  });
};
