import { Request, Response } from "express";
import * as stockService from "../services/stock.service";

// GET /stocks
export const getAllStocks = async (req: Request, res: Response) => {
  try {
    const stocks = await stockService.getAllStocks();
    res.json(stocks);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stocks" });
  }
};

// GET /stocks/:symbol
export const getStockBySymbol = async (req: Request, res: Response) => {
  try {
    const stock = await stockService.getStockBySymbol(req.params.symbol);
    if (!stock) {
      res.status(404).json({ error: "Stock not found" });
      return;
    }
    res.json(stock);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stock" });
  }
};

// GET /stocks/:symbol/history
export const getStockHistory = async (req: Request, res: Response) => {
  try {
    const { symbol } = req.params;
    const { range } = req.query; // e.g., 1D, 1W, etc.
    const history = await stockService.getStockHistory(symbol, range as string);
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch stock history" });
  }
};

// POST /stocks
export const createStock = async (req: Request, res: Response) => {
  try {
    const stock = await stockService.createStock(req.body);
    res.status(201).json(stock);
  } catch (err) {
    res.status(400).json({ error: "Failed to create stock" });
  }
};

// PUT /stocks/:symbol
export const updateStock = async (req: Request, res: Response) => {
  try {
    const stock = await stockService.updateStock(req.params.symbol, req.body);
    if (!stock) {
      res.status(404).json({ error: "Stock not found" });
      return;
    }
    res.json(stock);
  } catch (err) {
    res.status(400).json({ error: "Failed to update stock" });
  }
};

// DELETE /stocks/:symbol
export const deleteStock = async (req: Request, res: Response) => {
  try {
    const deleted = await stockService.deleteStock(req.params.symbol);
    if (!deleted) {
      res.status(404).json({ error: "Stock not found" });
      return;
    }
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: "Failed to delete stock" });
  }
};
