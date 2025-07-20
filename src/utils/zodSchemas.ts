import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email(),
  username: z.string().min(1),
  password: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const createOrderSchema = z.object({
  stock_id: z.string().min(1),
  price: z.number().positive(),
  quantity: z.number().int().positive(),
  type: z.enum(["buy", "sell"]),
});

export const stockInputSchema = z.object({
  symbol: z.string().max(10),
  name: z.string().max(100),
  price: z.number().nonnegative(),
});
