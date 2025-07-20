import cookieParser from "cookie-parser";
import csurf from "csurf";
import express from "express";
import { serverAdapter } from "./config/bull-board";
import authRoutes from "./routes/auth.routes";
import orderRoutes from "./routes/order.routes";
import stockRoutes from "./routes/stock.routes";

const app = express();
app.use(express.json());

app.use(cookieParser());

const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    sameSite: "strict",
  },
});

app.use((req, res, next) => {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];
  if (
    safeMethods.includes(req.method) &&
    !/^\/(auth\/csrf-token)/.test(req.path)
  ) {
    return next();
  }
  if (/^\/(auth\/login|auth\/register)/.test(req.path)) {
    return next();
  }
  return csrfProtection(req, res, next);
});

// Mount Bull Board
// app.use("/admin/queues", serverAdapter.getRouter());

app.use("/auth", authRoutes);
app.use("/stocks", stockRoutes);
app.use("/order", orderRoutes);

// Default route
app.get("/", (req, res) => {
  res.send("hello");
});

export default app;
