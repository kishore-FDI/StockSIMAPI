export function safeJson(obj: any) {
  return JSON.parse(
    JSON.stringify(obj, (_, value) =>
      typeof value === "bigint" ? value.toString() : value
    )
  );
}

// import { Users } from "../../model/data.model";
// import { Stock } from "../types";

// export function flipBalance(
//   userId1: string,
//   userId2: string,
//   quantity: number,
//   price: number,
//   stock: Stock
// ) {
//   let user1 = Users.find((a) => a.id === userId1);
//   let user2 = Users.find((a) => a.id === userId2);

//   if (!user1 || !user2) {
//     return;
//   }

//   const TICKER = stock.symbol;

//   stock.price = price;

//   user1.balance[TICKER] -= quantity;
//   user2.balance[TICKER] += quantity;
//   user1.balance["USD"] += quantity * price;
//   user1.balance["USD"] -= quantity * price;
// }

// export function fillOrders(
//   side: string,
//   price: number,
//   quantity: number,
//   userId: string,
//   stock: Stock
// ): number {
//   let remainingQuantity = quantity;

//   const Asks = stock.asks;
//   const Bids = stock.bids;

//   if (side === "bid") {
//     for (let i = Asks.length - 1; i > -1; i--) {
//       const ask = Asks[i];
//       if (ask.price > price) break;
//       if (ask.quantity > remainingQuantity) {
//         ask.quantity -= remainingQuantity;
//         flipBalance(ask.userId, userId, remainingQuantity, ask.price, stock);
//         return 0;
//       } else {
//         remainingQuantity -= ask.quantity;
//         flipBalance(ask.userId, userId, ask.quantity, ask.price, stock);
//         Asks.pop();
//       }
//     }
//   } else {
//     for (let i = Bids.length - 1; i > -1; i--) {
//       const bid = Bids[i];

//       if (bid.price < price) {
//         break;
//       }
//       if (bid.quantity > remainingQuantity) {
//         bid.quantity -= remainingQuantity;
//         flipBalance(userId, bid.userId, remainingQuantity, bid.price, stock);
//       } else {
//         remainingQuantity -= bid.quantity;
//         flipBalance(userId, bid.userId, bid.quantity, bid.price, stock);
//         Bids.pop();
//       }
//     }
//   }

//   return remainingQuantity;
// }
