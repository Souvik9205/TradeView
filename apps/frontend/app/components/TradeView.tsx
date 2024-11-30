import { useEffect, useRef } from "react";
import { ChartManager } from "../[utils]/ChartManager";
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
        Math.floor((new Date().getTime() - 1000 * 60 * 60 * 24 * 7) / 1000), // 7 days ago
        Math.floor(new Date().getTime() / 1000) // current time
      );

      if (chartRef.current) {
        // Destroy previous instance if it exists
        if (chartManagerRef.current) {
          chartManagerRef.current.destroy();
        }

        // Create new ChartManager with updated Kline data
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
            background: "#0e0f14",
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
    // Initial fetch of Kline data on component mount
    fetchAndUpdateKlines();

    // WebSocket subscription
    const ws = new WebSocket("wss://your-websocket-url");
    ws.onopen = () => {
      ws.send(
        JSON.stringify({
          method: "SUBSCRIBE",
          params: [`trade.${market}`],
          id: 2,
        })
      );
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data?.stream === `trade.${market}` && data?.data) {
        // Trigger Kline fetch and chart update on each trade message
        fetchAndUpdateKlines();
      }
    };

    ws.onclose = () => {
      console.log("WebSocket connection closed");
    };

    // Clean up on unmount
    return () => {
      ws.close();
      if (chartManagerRef.current) {
        chartManagerRef.current.destroy();
      }
    };
  }, [market]);

  return (
    <div
      ref={chartRef}
      style={{ height: "100%", width: "100%", marginTop: 4 }}
    ></div>
  );
}
