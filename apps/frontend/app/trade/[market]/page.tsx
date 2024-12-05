"use client";
import { MarketBar } from "@/app/components/MarketBar";
import { SwapUI } from "@/app/components/SwapUI";
import { TradeView } from "@/app/components/TradeView";
import { Depth } from "@/app/components/depth/Depth";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SignalingManager } from "@/app/[utils]/SignalingManager";
import { getTicker } from "@/app/[utils]/httpClient";
import type { Ticker } from "@/app/[utils]/types";

export default function Page() {
  const { market } = useParams();
  const [ticker, setTicker] = useState<Ticker | null>(null);

  useEffect(() => {
    getTicker(market as string).then(setTicker);
    const signaling = SignalingManager.getInstance();

    signaling.registerCallback(
      "ticker",
      (data: Partial<Ticker> | { bids: any[]; asks: any[] }) => {
        if ("bids" in data && "asks" in data) {
          console.warn("Received unexpected market depth data:", data);
          return;
        }

        setTicker((prevTicker) => ({
          firstPrice: data?.firstPrice ?? prevTicker?.firstPrice ?? "",
          high: data?.high ?? prevTicker?.high ?? "",
          lastPrice: data?.lastPrice ?? prevTicker?.lastPrice ?? "",
          low: data?.low ?? prevTicker?.low ?? "",
          priceChange: data?.priceChange ?? prevTicker?.priceChange ?? "",
          priceChangePercent:
            data?.priceChangePercent ?? prevTicker?.priceChangePercent ?? "",
          quoteVolume: data?.quoteVolume ?? prevTicker?.quoteVolume ?? "",
          symbol: data?.symbol ?? prevTicker?.symbol ?? "",
          trades: data?.trades ?? prevTicker?.trades ?? "",
          volume: data?.volume ?? prevTicker?.volume ?? "",
        }));
      },
      `TICKER-${market}`
    );
    signaling.sendMessage({
      method: "SUBSCRIBE",
      params: [`ticker.${market}`],
    });

    return () => {
      signaling.deRegisterCallback("ticker", `TICKER-${market}`);
      signaling.sendMessage({
        method: "UNSUBSCRIBE",
        params: [`ticker.${market}`],
      });
    };
  }, [market]);

  return (
    <div className="flex flex-row flex-1 bg-gradient-to-bl from-neutral-800 to-neutral-950">
      <div className="flex flex-col flex-1 mx-10">
        <MarketBar market={market as string} ticker={ticker} />
        <div className="flex h-[80vh] border-y border-slate-800">
          <div className="flex flex-col flex-1 border border-slate-800 h-full">
            <TradeView market={market as string} />
          </div>
          <div className="flex flex-col w-[20vw] overflow-hidden">
            {ticker && ticker.lastPrice ? (
              <Depth
                market={market as string}
                currentPrice={parseFloat(ticker.lastPrice)}
              />
            ) : (
              <div>Loading...</div>
            )}
          </div>
          <div className="w-[10px] flex-col border-slate-800 border-l"></div>
          <div className="flex flex-col w-[15vw]">
            {ticker && ticker.lastPrice ? (
              <SwapUI
                market={market as string}
                price={parseFloat(ticker.lastPrice)}
              />
            ) : (
              <div>Loading...</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
