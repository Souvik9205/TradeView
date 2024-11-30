"use client";

import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

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
  const [trades, setTrades] = useState<Trade[]>([]);
  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Fetch trades data
  useEffect(() => {
    const fetchTrades = async () => {
      try {
        const res = await fetch(`/api/user/trades/${userId}`);
        const data = await res.json();
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
    <div className="p-6 bg-gradient-to-r from-gray-800 to-gray-900 rounded-lg shadow-lg">
      <p className="text-lg text-white/80 font-bold mb-4">
        All of Your Executed Trades
      </p>
      <Separator />
      <ScrollArea className="h-[30vh] mt-4 bg-white/10 rounded-lg overflow-auto p-2">
        {trades.length > 0 ? (
          <table className="w-full text-left">
            <thead>
              <tr className="text-white/60 text-sm">
                <th className="py-2">Coin</th>
                <th className="py-2">Sell Time</th>
                <th className="py-2">Gain</th>
              </tr>
            </thead>
            <tbody>
              {trades.map((trade) => (
                <Tooltip key={trade.id}>
                  <TooltipTrigger asChild>
                    <tr
                      className="cursor-pointer text-white/80 hover:bg-white/20 transition rounded-md"
                      onClick={() => handleRowClick(trade)}
                    >
                      <td className="py-2 px-3">{trade.coin}</td>
                      <td className="py-2 px-3">
                        {trade.sellTime
                          ? new Date(trade.sellTime).toLocaleString()
                          : "N/A"}
                      </td>
                      <td
                        className={`py-2 px-3 ${
                          trade.gain >= 0 ? "text-green-400" : "text-red-400"
                        }`}
                      >
                        {trade.gain.toFixed(2)}
                      </td>
                    </tr>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>
                      Gain: {trade.gain.toFixed(2)} | Volume:{" "}
                      {trade.volume.toFixed(2)}
                    </p>
                  </TooltipContent>
                </Tooltip>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-center text-white/60">No trades available.</p>
        )}
      </ScrollArea>

      {/* Detailed Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedTrade
                ? `Details of ${selectedTrade.coin}`
                : "Trade Details"}
            </DialogTitle>
            <DialogDescription>
              View the full details of the selected trade below.
            </DialogDescription>
          </DialogHeader>
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
    </div>
  );
};

export default AllTrades;
