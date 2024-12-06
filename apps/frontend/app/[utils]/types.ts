export interface KLine {
  close: string;
  end: string;
  high: string;
  low: string;
  open: string;
  quoteVolume: string;
  start: string;
  trades: string;
  volume: string;
}

export interface Trade {
  id: number;
  isBuyerMaker: boolean;
  price: string;
  quantity: string;
  quoteQuantity: string;
  timestamp: number;
}

export interface Depth {
  bids: [string, string][];
  asks: [string, string][];
  lastUpdateId: string;
}

export interface Ticker {
  firstPrice: string;
  high: string;
  lastPrice: string;
  low: string;
  priceChange: string;
  priceChangePercent: string;
  quoteVolume: string;
  symbol: string;
  trades: string;
  volume: string;
}

export interface Buy {
  traderId: string;
  coin: string;
  buyTime: string;
  buyPrice: number;
  volume: number;
}

export interface Sell {
  userId: string;
  coin: string;
  sellTime: string;
  sellPrice: number;
  volume: number;
}

export interface ApiResponse<T> {
  status: number;
  message: string;
  data: T;
}
