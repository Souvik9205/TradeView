import { Ticker } from "./types";

export const BASE_URL = "wss://ws.backpack.exchange/";

type CallbackType = {
  id: string;
  callback: (data: Partial<Ticker> | { bids: any[]; asks: any[] }) => void;
};

type Callbacks = Record<string, CallbackType[]>;

type MessageData = {
  e: string; // Event type, e.g., "ticker" or "depth"
  c?: string; // Last price
  h?: string; // High price
  l?: string; // Low price
  v?: string; // Volume
  V?: string; // Quote volume
  s?: string; // Symbol
  b?: any[]; // Bids
  a?: any[]; // Asks
};

export class SignalingManager {
  private ws: WebSocket;
  private static instance: SignalingManager;
  private bufferedMessages: any[] = [];
  private callbacks: Callbacks = {};
  private id: number;
  private initialized: boolean = false;

  private constructor() {
    this.ws = new WebSocket(BASE_URL);
    this.bufferedMessages = [];
    this.id = 1;
    this.init();
  }

  public static getInstance(): SignalingManager {
    if (!this.instance) {
      this.instance = new SignalingManager();
    }
    return this.instance;
  }

  private init(): void {
    this.ws.onopen = () => {
      this.initialized = true;
      this.bufferedMessages.forEach((message) => {
        this.ws.send(JSON.stringify(message));
      });
      this.bufferedMessages = [];
    };

    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data) as { data: MessageData };
      const { e: type } = message.data;

      if (this.callbacks[type]) {
        this.callbacks[type].forEach(({ callback }) => {
          if (type === "ticker") {
            const newTicker: Partial<Ticker> = {
              lastPrice: message.data.c,
              high: message.data.h,
              low: message.data.l,
              volume: message.data.v,
              quoteVolume: message.data.V,
              symbol: message.data.s,
            };

            callback(newTicker);
          }

          if (type === "depth") {
            const updatedBids = message.data.b || [];
            const updatedAsks = message.data.a || [];
            callback({ bids: updatedBids, asks: updatedAsks });
          }
        });
      }
    };
  }

  public sendMessage(message: Record<string, any>): void {
    const messageToSend = {
      ...message,
      id: this.id++,
    };
    if (!this.initialized) {
      this.bufferedMessages.push(messageToSend);
      return;
    }
    this.ws.send(JSON.stringify(messageToSend));
  }

  public registerCallback(
    type: string,
    callback: (data: Partial<Ticker> | { bids: any[]; asks: any[] }) => void,
    id: string
  ): void {
    this.callbacks[type] = this.callbacks[type] || [];
    this.callbacks[type].push({ callback, id });
  }

  public deRegisterCallback(type: string, id: string): void {
    if (this.callbacks[type]) {
      const index = this.callbacks[type].findIndex((cb) => cb.id === id);
      if (index !== -1) {
        this.callbacks[type].splice(index, 1);
      }
    }
  }
}
