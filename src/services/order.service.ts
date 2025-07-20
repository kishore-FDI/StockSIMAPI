import { z } from "zod";
import { eventEmitter } from "../events/emitter";
import { EVENTS } from "../events/types";
import { matchOrderQueue } from "../jobs/queue/order.queue";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import {
  InsufficientFundsError,
  InvalidOrderError,
} from "../utils/errors.util";
import { createOrderSchema } from "../utils/zodSchemas";

export const createOrder = async (
  userId: string,
  data: z.infer<typeof createOrderSchema>
) => {
  const { stock_id, price, quantity, type } = data;
  const totalCost = price * quantity;

  const stock = await prisma.stock.findUnique({ where: { id: stock_id } });
  if (!stock) throw new InvalidOrderError("Stock not found");

  if (type === "buy") {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new InvalidOrderError("User not found");

    const availableBalance =
      (user.wallet?.toNumber() ?? 0) - (user.reserved_wallet?.toNumber() ?? 0);
    if (availableBalance < totalCost) {
      throw new InsufficientFundsError("Not enough available wallet balance");
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        reserved_wallet: {
          increment: totalCost,
        },
      },
    });
  }

  if (type === "sell") {
    const balance = await prisma.balance.findFirst({
      where: { user_id: userId, stock_id },
    });
    if (!balance) {
      throw new InsufficientFundsError("No stock holdings found to sell");
    }

    const availableQuantity =
      balance.quantity - (balance.reserved_quantity ?? 0);
    if (availableQuantity < quantity) {
      throw new InsufficientFundsError("Not enough available stock to sell");
    }

    await prisma.balance.update({
      where: { id: balance.id },
      data: {
        reserved_quantity: {
          increment: quantity,
        },
      },
    });
  }

  const order = await prisma.order.create({
    data: {
      user_id: userId,
      stock_id,
      type,
      price,
      quantity,
      status: "open",
      full_filled_quantity: 0,
    },
  });

  // ✅ Emit event for new order
  eventEmitter.emit(EVENTS.ORDER_PLACED, order);

  // ✅ Queue matching engine
  await matchOrderQueue.add("match", { stock_id });

  return order;
};

export const cancelOrder = async (orderId: number, userId: string) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order || order.user_id !== userId) {
    throw new InvalidOrderError("Order not found or not authorized");
  }

  if (order.status !== "open") {
    throw new InvalidOrderError("Only open orders can be cancelled");
  }

  const totalCost = order.price.toNumber() * order.quantity;

  if (order.type === "buy") {
    await prisma.user.update({
      where: { id: userId },
      data: {
        reserved_wallet: {
          decrement: totalCost,
        },
      },
    });
  } else if (order.type === "sell") {
    const balance = await prisma.balance.findFirst({
      where: { user_id: userId, stock_id: order.stock_id },
    });

    if (balance) {
      await prisma.balance.update({
        where: { id: balance.id },
        data: {
          reserved_quantity: {
            decrement: order.quantity,
          },
        },
      });
    }
  }

  const cancelledOrder = await prisma.order.update({
    where: { id: orderId },
    data: { status: "cancelled" },
  });

  // ✅ Emit event for order cancellation
  eventEmitter.emit(EVENTS.ORDER_CANCELLED, cancelledOrder);

  return cancelledOrder;
};

export const getUserOrders = async (userId: string) => {
  return prisma.order.findMany({
    where: { user_id: userId },
    orderBy: { created_at: "desc" },
  });
};

export const getOrderById = async (id: number, userId: string) => {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order || order.user_id !== userId) {
    throw new InvalidOrderError("Not authorized or order not found");
  }
  return order;
};

export const getOrderBook = async (stock_id: string) => {
  const bids = await prisma.order.findMany({
    where: { stock_id, type: "buy", status: "open" },
    orderBy: { price: "desc" },
  });

  const asks = await prisma.order.findMany({
    where: { stock_id, type: "sell", status: "open" },
    orderBy: { price: "asc" },
  });

  return { bids, asks };
};
