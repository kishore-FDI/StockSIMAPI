import { Router } from "express";
import * as OrderController from "../controllers/order.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

const router = Router();

router.post("/", authMiddleware, OrderController.createOrder);
router.delete("/:id", authMiddleware, OrderController.cancelOrder);
router.get("/", authMiddleware, OrderController.getUserOrders);
router.get("/:id", authMiddleware, OrderController.getOrderById);
router.get("/book/:stockId", OrderController.getOrderBook); // public

export default router;
