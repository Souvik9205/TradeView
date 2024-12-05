"use client";

import { useEffect, useState } from "react";
import { getDepth } from "../../[utils]/httpClient";
import { BidTable } from "./BidTable";
import { AskTable } from "./AskTable";
import { SignalingManager } from "@/app/[utils]/SignalingManager";

export function Depth({
  market,
  currentPrice,
}: {
  market: string;
  currentPrice: number;
}) {
  const [bids, setBids] = useState<[string, string][]>();
  const [asks, setAsks] = useState<[string, string][]>();
  const [price, setPrice] = useState<number>(currentPrice);
  const [isTradeView, setIsTradeView] = useState(false);

  const [askTotal, setAskTotal] = useState(0);
  const [bidTotal, setBidTotal] = useState(0);

  const [tradeData, setTradeData] = useState<
    { price: string; quantity: string }[]
  >([]);

  useEffect(() => {
    setPrice(currentPrice);
  }, [currentPrice]);

  useEffect(() => {
    SignalingManager.getInstance().registerCallback(
      "depth",
      (data: any) => {
        setBids((originalBids) => {
          const bidsAfterUpdate = [...(originalBids || [])].filter(
            (bid) => bid[1] !== "0.00"
          );
          data.bids.forEach((newBid: [any, any]) => {
            const [newPrice, newQuantity] = newBid;
            const existingIndex = bidsAfterUpdate.findIndex(
              (bid) => bid[0] === newPrice
            );
            if (existingIndex > -1) {
              if (newQuantity === "0.00") {
                bidsAfterUpdate.splice(existingIndex, 1);
              } else {
                bidsAfterUpdate[existingIndex][1] = newQuantity;
              }
            } else if (newQuantity !== "0.00") {
              bidsAfterUpdate.push(newBid);
            }
          });

          return bidsAfterUpdate;
        });

        setAsks((originalAsks) => {
          const asksAfterUpdate = [...(originalAsks || [])].filter(
            (ask) => ask[1] !== "0.00"
          );
          data.asks.forEach((newAsk: [any, any]) => {
            const [newPrice, newQuantity] = newAsk;
            const existingIndex = asksAfterUpdate.findIndex(
              (ask) => ask[0] === newPrice
            );
            if (existingIndex > -1) {
              if (newQuantity === "0.00") {
                asksAfterUpdate.splice(existingIndex, 1);
              } else {
                asksAfterUpdate[existingIndex][1] = newQuantity;
              }
            } else if (newQuantity !== "0.00") {
              asksAfterUpdate.push(newAsk);
            }
          });

          return asksAfterUpdate;
        });
      },
      `DEPTH-${market}`
    );

    SignalingManager.getInstance().sendMessage({
      method: "SUBSCRIBE",
      params: [`depth.200ms.${market}`],
    });

    getDepth(market).then((d) => {
      setBids(d.bids.reverse().filter(([_, quantity]) => quantity !== "0.00"));
      setAsks(d.asks.filter(([_, quantity]) => quantity !== "0.00"));
    });

    return () => {
      SignalingManager.getInstance().sendMessage({
        method: "UNSUBSCRIBE",
        params: [`depth.200ms.${market}`],
      });
      SignalingManager.getInstance().deRegisterCallback(
        "depth",
        `DEPTH-${market}`
      );
    };
  }, [market]);

  useEffect(() => {
    const tradeCallback = (data: any) => {
      console.log("Raw WebSocket Data:", data); // Log raw WebSocket data
      if (data && data.p && data.q) {
        setTradeData((prev) => [
          { price: data.p, quantity: data.q },
          ...(prev || []).slice(0, 19), // Keep last 20 trades
        ]);
      } else {
        console.warn("Unexpected trade data:", data);
      }
    };

    SignalingManager.getInstance().registerCallback(
      "trade",
      tradeCallback,
      `TRADE-${market}`
    );

    SignalingManager.getInstance().sendMessage({
      method: "SUBSCRIBE",
      params: [`trade.${market}`],
    });

    return () => {
      SignalingManager.getInstance().sendMessage({
        method: "UNSUBSCRIBE",
        params: [`trade.${market}`],
      });
      SignalingManager.getInstance().deRegisterCallback(
        "trade",
        `TRADE-${market}`
      );
    };
  }, [market]);

  return (
    <div className="mx-1 bg-neutral-700/60 justify-between border border-neutral-600 p-2">
      <DepthNav isTradeView={isTradeView} setIsTradeView={setIsTradeView} />
      <div className="w-full flex-col border-slate-700 border-t"></div>
      <div className="bg-neutral-900/70 text-white border border-gray-500">
        {isTradeView ? (
          <TradeView tradeData={tradeData} />
        ) : (
          <>
            <TableHeader />
            <div>
              {asks && (
                <AskTable
                  asks={asks}
                  onTotalChange={(total) => setAskTotal(total)}
                />
              )}
              {price && (
                <div className=" border-white/30 border my-2">{price}</div>
              )}
              {bids && (
                <BidTable
                  bids={bids}
                  onTotalChange={(total) => setBidTotal(total)}
                />
              )}
            </div>
            <BuyerSeller maxBidTotal={bidTotal} maxAskTotal={askTotal} />
          </>
        )}
      </div>
    </div>
  );
}

function TradeView({
  tradeData,
}: {
  tradeData: { price: string; quantity: string }[];
}) {
  return (
    <div className="mt-4">
      <div className="text-sm text-slate-500 flex justify-between mb-2">
        <span>Price</span>
        <span>Quantity</span>
      </div>
      <div className="max-h-64 overflow-y-auto">
        {tradeData.map((trade, index) => (
          <div
            key={index}
            className="flex justify-between text-white text-sm py-1"
          >
            <span>{trade.price}</span>
            <span>{trade.quantity}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TableHeader() {
  return (
    <div className="flex justify-between text-sm">
      <div className="text-white">Price</div>
      <div className="text-slate-500">Size</div>
      <div className="text-slate-500">Total</div>
    </div>
  );
}

function DepthNav({
  isTradeView,
  setIsTradeView,
}: {
  isTradeView: boolean;
  setIsTradeView: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return (
    <div className="flex gap-5 py-2">
      <div
        onClick={() => setIsTradeView(false)}
        className={`transition-all duration-300 ease-in-out cursor-pointer hover:text-white/90 ${
          !isTradeView ? "underline underline-offset-[6px]" : "text-white/50"
        }`}
      >
        Book
      </div>
      <div
        onClick={() => setIsTradeView(true)}
        className={`transition-all duration-300 ease-in-out cursor-pointer hover:text-white/90 ${
          isTradeView ? "underline underline-offset-[6px]" : "text-white/50"
        }`}
      >
        Trade
      </div>
    </div>
  );
}

export function BuyerSeller({
  maxBidTotal,
  maxAskTotal,
}: {
  maxBidTotal: number;
  maxAskTotal: number;
}) {
  const total = maxBidTotal + maxAskTotal;
  const buyerRatio = Math.floor((maxBidTotal / total) * 100);
  const sellerRatio = Math.floor((maxAskTotal / total) * 100);

  return (
    <div className="relative w-full h-8 mt-4">
      <div
        className="absolute bottom-0 left-0 top-0 border-r-2 border-slate-600 bg-green-400/70 flex items-center justify-center"
        style={{
          width: `${buyerRatio}%`,
          transition: "width 0.3s ease-in-out",
        }}
      >
        <span className="text-sm font-semibold text-slate-800">
          {buyerRatio}%
        </span>
      </div>

      <div
        className="absolute bottom-0 right-0 top-0 border-l-2 border-slate-600 bg-red-400/70 flex items-center justify-center"
        style={{
          width: `${sellerRatio}%`,
          transition: "width 0.3s ease-in-out",
        }}
      >
        <span className="text-sm font-semibold text-slate-800">
          {sellerRatio + 1}%
        </span>
      </div>
    </div>
  );
}
