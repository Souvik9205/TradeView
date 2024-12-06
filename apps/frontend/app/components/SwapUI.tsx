"use client";
import { useEffect, useState } from "react";
import { SellClient, TradeClient } from "../[utils]/tradeClient";
import { useAuthStore } from "../[utils]/AuthStore";
import { useToast } from "@/hooks/use-toast";

export function SwapUI({ market, price }: { market: string; price: number }) {
  const [amount, setAmount] = useState(price);
  const [wallet, setWallet] = useState(0);
  const [quantity, setQuantity] = useState(0);
  const [activeTab, setActiveTab] = useState("buy");
  const [type, setType] = useState("market");
  const { toast } = useToast();

  const total = (amount * quantity).toFixed(2);
  const id = localStorage.getItem("userId");

  useEffect(() => {
    setAmount(price);
  }, [price]);

  function HandleTrade() {
    if (quantity <= 0) {
      toast({
        title: "Invalid Quantity",
        description: "Quantity must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    try {
      if (activeTab === "buy") {
        TradeClient({
          traderId: id as string,
          coin: market,
          buyTime: new Date().toISOString(),
          buyPrice: amount,
          volume: quantity,
        })
          .then((res) => {
            console.log("buy res", res);
            if (res.message === "trade updated") {
              toast({
                title: "Success",
                description: "Buy transaction successful",
              });
            } else {
              toast({
                title: "Transaction",
                description:
                  res.message || "Something went wrong during the transaction",
              });
            }
          })
          .catch((err) => {
            toast({
              title: "Error",
              description: err.message || "Failed to process the transaction",
              variant: "destructive",
            });
            console.error(err);
          });
      } else {
        SellClient({
          userId: id as string,
          coin: market,
          sellTime: new Date().toISOString(),
          sellPrice: amount,
          volume: quantity,
        })
          .then((res) => {
            console.log("sell res", res);
            if (res.message === "trade updated") {
              toast({
                title: "Success",
                description: "Sell transaction successful",
              });
            } else {
              toast({
                title: "Transaction",
                description:
                  res.message || "Something went wrong during the transaction",
              });
            }
          })
          .catch((err) => {
            toast({
              title: "Error",
              description: "No Trades found",
              variant: "destructive",
            });
            console.error(err);
          });
      }
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      });
      console.error(err);
    }
  }

  return (
    <div className="bg-neutral-700/60 justify-between border border-neutral-600 p-2">
      <div className="flex flex-col bg-neutral-800 text-white border border-gray-500">
        <div className="flex flex-row h-[60px]">
          <BuyButton activeTab={activeTab} setActiveTab={setActiveTab} />
          <SellButton activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>
        <div className="flex flex-col gap-1">
          <div className="px-3">
            <div className="flex flex-row flex-0 gap-5">
              <LimitButton type={type} setType={setType} />
              <MarketButton type={type} setType={setType} />
            </div>
          </div>
          <div className="flex flex-col px-3">
            <div className="flex flex-col flex-1 gap-3 text-baseTextHighEmphasis">
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between flex-row">
                  <p className="text-sm font-normal text-baseTextMedEmphasis">
                    Available Balance
                  </p>
                  <p className="font-medium text-base text-baseTextHighEmphasis">
                    {wallet} $
                  </p>
                </div>
              </div>
              {type === "limit" && (
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-normal text-baseTextMedEmphasis">
                    Price
                  </p>
                  <div className="flex flex-col relative">
                    <input
                      step="0.01"
                      placeholder="0"
                      className="h-12 rounded-lg border-2 border-solid bg-neutral-700 border-baseBorderLight bg-[var(--background)] pr-12 text-right text-2xl leading-9 text-[$text] placeholder-baseTextMedEmphasis ring-0 transition focus:border-accentBlue focus:ring-0"
                      type="text"
                      onChange={(e) => setAmount(parseFloat(e.target.value))}
                      value={amount}
                    />
                    <div className="flex flex-row absolute right-1 top-1 p-2">
                      <div className="relative">
                        <img src="/usdc.webp" className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <p className="text-sm font-normal text-baseTextMedEmphasis">
                Quantity
              </p>
              <div className="flex flex-col relative">
                <input
                  step="0.01"
                  placeholder="0"
                  className="h-12 rounded-lg border-2 border-solid bg-neutral-700 border-baseBorderLight bg-[var(--background)] pr-12 text-right text-2xl leading-9 text-[$text] placeholder-baseTextMedEmphasis ring-0 transition focus:border-accentBlue focus:ring-0"
                  type="text"
                  onChange={(e) => {
                    const value = parseFloat(e.target.value);
                    setQuantity(!isNaN(value) && value >= 0 ? value : 0);
                  }}
                  value={quantity}
                />

                <div className="flex flex-row absolute right-1 top-1 p-2">
                  <div className="relative">
                    <img
                      src={`/market/${market.split("_")[0].toLowerCase()}.webp`}
                      className="w-6 h-6"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end flex-row">
                <p className="font-medium pr-2 text-base text-baseTextMedEmphasis">
                  ≈ {total} USDC
                </p>
              </div>
            </div>
            <button
              type="button"
              className={`font-semibold mt-5 focus:ring-blue-200 focus:none focus:outline-none text-center h-12 rounded-xl text-base px-4 py-2 my-4 ${activeTab === "buy" ? "bg-green-500/70" : "bg-red-500/70"} text-greenPrimaryButtonText active:scale-98`}
              data-rac=""
              onClick={HandleTrade}
            >
              {activeTab === "buy" ? "Buy" : "Sell"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function LimitButton({ type, setType }: { type: string; setType: any }) {
  return (
    <div
      className="flex flex-col cursor-pointer justify-center py-2"
      onClick={() => setType("limit")}
    >
      <div
        className={`text-base font-medium py-1 border-b-2 ${type === "limit" ? "border-accentBlue text-baseTextHighEmphasis" : "border-transparent text-baseTextMedEmphasis hover:border-baseTextHighEmphasis hover:text-baseTextHighEmphasis"}`}
      >
        Limit
      </div>
    </div>
  );
}

function MarketButton({ type, setType }: { type: string; setType: any }) {
  return (
    <div
      className="flex flex-col cursor-pointer justify-center py-2"
      onClick={() => setType("market")}
    >
      <div
        className={`text-base font-medium py-1 border-b-2 ${type === "market" ? "border-accentBlue text-baseTextHighEmphasis" : "border-b-2 border-transparent text-baseTextMedEmphasis hover:border-baseTextHighEmphasis hover:text-baseTextHighEmphasis"} `}
      >
        Market
      </div>
    </div>
  );
}

function BuyButton({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: any;
}) {
  return (
    <div
      className={`flex flex-col mb-[-2px] flex-1 cursor-pointer justify-center border-b-2 p-4 ${activeTab === "buy" ? "border-b-greenBorder bg-greenBackgroundTransparent" : "border-b-baseBorderMed hover:border-b-baseBorderFocus"}`}
      onClick={() => setActiveTab("buy")}
    >
      <p className="text-center text-lg font-semibold">Buy</p>
    </div>
  );
}

function SellButton({
  activeTab,
  setActiveTab,
}: {
  activeTab: string;
  setActiveTab: any;
}) {
  return (
    <div
      className={`flex flex-col mb-[-2px] flex-1 cursor-pointer justify-center border-b-2 p-4 ${activeTab === "sell" ? "border-b-redBorder bg-redBackgroundTransparent" : "border-b-baseBorderMed hover:border-b-baseBorderFocus"}`}
      onClick={() => setActiveTab("sell")}
    >
      <p className="text-center text-lg font-semibold">Sell</p>
    </div>
  );
}
