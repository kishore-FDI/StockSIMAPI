import { Router } from "express";
import * as stockController from "../controllers/stock.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validate } from "../middlewares/validate.middleware"; // optional
import { stockInputSchema } from "../utils/zodSchemas";

const router = Router();

// Public Routes
router.get("/", stockController.getAllStocks);
router.get("/:symbol", stockController.getStockBySymbol);
router.get("/:symbol/history", stockController.getStockHistory);

// Admin-protected Routes (you can customize based on your role logic)
router.post(
  "/",
  authMiddleware, // ensure user is authenticated
  validate(stockInputSchema),
  stockController.createStock
);

router.put(
  "/:symbol",
  authMiddleware,
  validate(stockInputSchema.partial()), // allow partial updates
  stockController.updateStock
);

router.delete("/:symbol", authMiddleware, stockController.deleteStock);

export default router;
