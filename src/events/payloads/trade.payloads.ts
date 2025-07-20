export interface TradeExecutedPayload {
  tradeId: number;
  stockId: string;
  price: number;
  quantity: number;
  buyerId: string;
  sellerId: string;
  timestamp: string;
}
