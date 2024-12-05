import { useEffect, useRef } from "react";
import { ChartManager } from "../[utils]/ChartManager";
import { SignalingManager } from "../[utils]/SignalingManager";
import { getKlines } from "../[utils]/httpClient";
import { KLine } from "../[utils]/types";

export function TradeView({ market }: { market: string }) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartManagerRef = useRef<ChartManager | null>(null);

  const fetchAndUpdateKlines = async () => {
    try {
      const klineData = await getKlines(
        market,
        "1h",
        Math.floor((new Date().getTime() - 1000 * 60 * 60 * 24 * 7) / 1000),
        Math.floor(new Date().getTime() / 1000)
      );

      if (chartRef.current) {
        if (chartManagerRef.current) {
          chartManagerRef.current.destroy();
        }
        const chartManager = new ChartManager(
          chartRef.current,
          [
            ...klineData.map((x) => ({
              close: parseFloat(x.close),
              high: parseFloat(x.high),
              low: parseFloat(x.low),
              open: parseFloat(x.open),
              timestamp: new Date(x.end),
            })),
          ].sort((x, y) => (x.timestamp < y.timestamp ? -1 : 1)),
          {
            background: "#191919",
            color: "white",
          }
        );

        chartManagerRef.current = chartManager;
      }
    } catch (error) {
      console.error("Error fetching Kline data:", error);
    }
  };

  useEffect(() => {
    fetchAndUpdateKlines();

    const signalingManager = SignalingManager.getInstance();

    const callbackId = `${market}-ticker`;
    signalingManager.registerCallback(
      "ticker",
      (newTicker) => {
        console.log("Updated Ticker:", newTicker);
        fetchAndUpdateKlines();
      },
      callbackId
    );

    signalingManager.registerCallback(
      "depth",
      (depthData) => {
        console.log("Updated Depth:", depthData);
      },
      `${market}-depth`
    );

    signalingManager.sendMessage({
      method: "SUBSCRIBE",
      params: [`ticker.${market}`, `depth.${market}`],
      id: 2,
    });

    return () => {
      signalingManager.deRegisterCallback("ticker", callbackId);
      signalingManager.deRegisterCallback("depth", `${market}-depth`);
      signalingManager.sendMessage({
        method: "UNSUBSCRIBE",
        params: [`ticker.${market}`, `depth.${market}`],
        id: 3,
      });
    };
  }, [market]);

  return (
    <div
      ref={chartRef}
      className="w-full h-full mt-1 rounded-lg shadow-md"
      style={{ height: "100%", width: "100%", marginTop: 4 }}
    ></div>
  );
}
