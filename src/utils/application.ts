// import { WebSocket } from "ws";
// import { Stocks } from "../models/data.model";
// import { IncomingMessage } from "../types";

// export class Application {
//   private stocksUser: Map<string, WebSocket[]>;
//   private applicationUser: WebSocket[];

//   constructor() {
//     this.stocksUser = new Map<string, WebSocket[]>();
//     this.applicationUser = [];
//   }

//   addUserToApplication(ws: WebSocket) {
//     this.applicationUser.push(ws);
//   }

//   removeUserFromApplication(ws: WebSocket) {
//     this.applicationUser = this.applicationUser.filter((ele) => ele != ws);
//   }

//   addUserToStocks(ws: WebSocket, stockId: string) {
//     if (!this.stocksUser.get(stockId)) {
//       this.stocksUser.set(stockId, []);
//     }

//     this.stocksUser.get(stockId)?.push(ws);
//   }

//   removeUserFromStocks(ws: WebSocket, stockId: string) {
//     const stock = this.stocksUser.get(stockId);

//     if (!stock) return;

//     const newStock = stock.filter((ele) => ele != ws);

//     this.stocksUser.set(stockId, newStock);
//   }

//   broadCastApplicationUser() {
//     const stocks = Stocks.map((stock) => {
//       return { id: stock.id, price: stock.price };
//     });

//     this.applicationUser.forEach((ws) => {
//       ws.send(JSON.stringify(stocks));
//     });
//   }

//   broadCastStocksUser(stockId: string) {
//     const users = this.stocksUser.get(stockId);
//     const stock = Stocks.find((ele) => ele.id == stockId);

//     if (!users || !stock) return;

//     users.forEach((ws) => {
//       ws.send(JSON.stringify(stock));
//     });
//   }
// }

// export function handleMessage(
//   ws: WebSocket,
//   message: IncomingMessage,
//   application: Application
// ) {
//   if (message.action === "unsubscribe" && message.type === "price-only") {
//     application.removeUserFromApplication(ws);
//     return;
//   }

//   if (message.action === "subscribe" && message.type === "price-only") {
//     application.addUserToApplication(ws);
//     return;
//   }

//   if (message.action === "subscribe" && message.type === "order-book") {
//     if (!message.symbol) return;
//     application.addUserToStocks(ws, message.symbol);
//     return;
//   }

//   if (message.action === "unsubscribe" && message.type === "order-book") {
//     if (!message.symbol) return;
//     application.removeUserFromStocks(ws, message.symbol);
//     return;
//   }
// }
