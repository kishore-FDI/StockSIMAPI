import { Request, Response } from "express";
import { ZodError } from "zod";
import * as OrderService from "../services/order.service";
import { createOrderSchema } from "../utils/zodSchemas";

export const createOrder = async (req: Request, res: Response) => {
  try {
    console.log("controller order");

    const userId = req.user?.id;
    if (!userId) {
      console.log(req.user);
      res.status(401).json({ message: "user not found" });
      return;
    }
    const data = createOrderSchema.parse(req.body);

    const order = await OrderService.createOrder(userId, data);
    res.status(201).json(order);
  } catch (error: any) {
    if (error instanceof ZodError) {
      res.status(400).json({ message: error.errors });
      return;
    }
    res.status(500).json({ message: error.message });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return;
    const orderId = parseInt(req.params.id);

    const order = await OrderService.cancelOrder(orderId, userId);
    res.status(200).json(order);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

export const getUserOrders = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return;
    const orders = await OrderService.getUserOrders(userId);
    res.status(200).json(orders);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return;
    const orderId = parseInt(req.params.id);

    const order = await OrderService.getOrderById(orderId, userId);
    res.status(200).json(order);
  } catch (error: any) {
    res.status(404).json({ message: error.message });
  }
};

export const getOrderBook = async (req: Request, res: Response) => {
  try {
    const { stockId } = req.params;
    const book = await OrderService.getOrderBook(stockId);
    res.status(200).json(book);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};
