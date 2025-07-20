import { redis } from "../config/redis";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
import { safeJson } from "../utils";
import { stockInputSchema } from "../utils/zodSchemas";

// GET /stocks
export const getAllStocks = async () => {
  const cacheKey = "stocks:all";
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const res = await prisma.stock.findMany();
  const stocks = safeJson(res);
  await redis.set(cacheKey, JSON.stringify(stocks)); // 1 min cache
  return stocks;
};

// GET /stocks/:symbol
export const getStockBySymbol = async (symbol: string) => {
  const cacheKey = `stocks:${symbol}`;
  const cached = await redis.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const stock = safeJson(
    await prisma.stock.findUnique({
      where: { symbol },
    })
  );

  if (stock) await redis.set(cacheKey, JSON.stringify(stock));
  return stock;
};

// GET /stocks/:symbol/history
export const getStockHistory = async (symbol: string, range = "1D") => {
  const stock = await prisma.stock.findUnique({
    where: { symbol },
    include: {
      trades: {
        take: 100, // You can filter by range, for now fetch latest 100 points
        orderBy: { timestamp: "desc" },
      },
    },
  });

  return stock?.trades || [];
};

// POST /stocks
export const createStock = async (data: any) => {
  const parsed = stockInputSchema.parse(data);

  const stock = await prisma.stock.create({
    data: {
      symbol: parsed.symbol,
      name: parsed.name,
      last_price: parsed.price,
    },
  });

  await redis.del("stocks:all"); // invalidate list cache
  return stock;
};

// PUT /stocks/:symbol
export const updateStock = async (symbol: string, data: any) => {
  const stock = await prisma.stock.update({
    where: { symbol },
    data,
  });

  await redis.del(`stocks:${symbol}`);
  await redis.del("stocks:all");

  return stock;
};

// DELETE /stocks/:symbol
export const deleteStock = async (symbol: string) => {
  const deleted = await prisma.stock.delete({
    where: { symbol },
  });

  await redis.del(`stocks:${symbol}`);
  await redis.del("stocks:all");

  return deleted;
};
