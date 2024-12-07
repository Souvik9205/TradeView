"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserTrades } from "@/app/[utils]/serverClient";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

type Trade = {
  id: string;
  traderId: string;
  coin: string;
  buyTime: string;
  sellTime: string | null;
  buyPrice: number;
  sellPrice: number;
  volume: number;
  gain: number;
};

const AllTrades = ({ userId }: { userId: string }) => {
  const router = useRouter();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkScreenSize();

    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const data = await getUserTrades();
        console.log("alltrades :", data);
        if (data.success) {
          setTrades(data.message);
        }
      } catch (error) {
        console.error("Error fetching trades:", error);
      }
    };

    fetchTrades();
  }, [userId]);

  const handleRowClick = (trade: Trade) => {
    setSelectedTrade(trade);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-2 md:p-6 bg-neutral-900/50 rounded-lg shadow-lg">
      <TooltipProvider>
        <ScrollArea className="h-[30vh] bg-white/10 rounded-lg overflow-auto p-2">
          {trades.length > 0 ? (
            <table className="w-full text-left table-auto">
              <thead>
                <tr className="text-white/60 text-base font-semibold">
                  <th className="py-2">Coin</th>
                  {isMobile && <th className="py-2">Status</th>}
                  {!isMobile && (
                    <>
                      <th className="py-2">Buy Time</th>
                      <th className="py-2">Sell Time</th>
                      <th className="py-2">Buy Price</th>
                      <th className="py-2">Volume</th>
                    </>
                  )}
                  <th className="py-2">Gain</th>
                </tr>
              </thead>
              <tbody>
                {[...trades].reverse().map((trade) => (
                  <Tooltip key={trade.id}>
                    <TooltipTrigger
                      asChild
                      className="cursor-pointer bg-neutral-800/60 rounded-md p-1 transition"
                    >
                      <tr
                        className="cursor-pointer text-white/80 hover:bg-white/20 transition rounded-md"
                        onClick={() => handleRowClick(trade)}
                      >
                        <td className="py-2">{trade.coin.split("_")[0]}</td>
                        {isMobile && (
                          <td className="py-2">
                            {trade.sellTime ? "Closed" : "Open"}
                          </td>
                        )}
                        {!isMobile && (
                          <>
                            <td className="py-2">
                              {trade.buyTime
                                ? new Date(trade.buyTime).toLocaleString()
                                : "N/A"}
                            </td>
                            <td className="py-2">
                              {trade.sellTime
                                ? new Date(trade.sellTime).toLocaleString()
                                : "N/A"}
                            </td>
                            <td className="py-2">
                              {trade.buyPrice.toFixed(2)}
                            </td>
                            <td className="py-2">{trade.volume}</td>
                          </>
                        )}
                        <td
                          className={`py-2 ${
                            trade.gain >= 0 ? "text-green-400" : "text-red-400"
                          }`}
                        >
                          {trade.gain.toFixed(2)}
                        </td>
                      </tr>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>
                        Buy Price: {trade.buyPrice}
                        <br />
                        Sell Price:
                        {trade.sellPrice === 0 ? "N/A" : trade.sellPrice}
                        <br />
                        volume: {trade.volume === 0 ? "N/A" : trade.volume}
                        <br />
                        <br />
                        Gain: {trade.gain === 0 ? "N/A" : trade.gain}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="pt-10 flex flex-col items-center gap-5">
              <p className="text-center text-white/60">No trades available.</p>
              <Button onClick={() => router.push("/")}>
                Explore Market to Trade
              </Button>
            </div>
          )}
        </ScrollArea>

        {/* Detailed Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="bg-gradient-to-bl from-neutral-800/90 to-neutral-900/90 backdrop-blur-lg">
            {selectedTrade && (
              <div className="text-white/80 space-y-2">
                <p>
                  <strong>Coin:</strong> {selectedTrade.coin}
                </p>
                <p>
                  <strong>Buy Time:</strong>{" "}
                  {new Date(selectedTrade.buyTime).toLocaleString()}
                </p>
                <p>
                  <strong>Sell Time:</strong>{" "}
                  {selectedTrade.sellTime
                    ? new Date(selectedTrade.sellTime).toLocaleString()
                    : "N/A"}
                </p>
                <p>
                  <strong>Buy Price:</strong> {selectedTrade.buyPrice}
                </p>
                <p>
                  <strong>Sell Price:</strong> {selectedTrade.sellPrice}
                </p>
                <p>
                  <strong>Volume:</strong> {selectedTrade.volume.toFixed(2)}
                </p>
                <p
                  className={`${
                    selectedTrade.gain >= 0 ? "text-green-400" : "text-red-400"
                  }`}
                >
                  <strong>Gain:</strong> {selectedTrade.gain.toFixed(2)}
                </p>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </TooltipProvider>
    </div>
  );
};

export default AllTrades;
