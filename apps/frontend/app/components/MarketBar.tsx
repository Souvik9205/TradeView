"use client";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Ticker } from "@/app/[utils]/types";
import { getTickers } from "../[utils]/httpClient";

export const MarketBar = ({
  market,
  ticker,
}: {
  market: string;
  ticker: Ticker | null;
}) => {
  const [currentMarket, setCurrentMarket] = useState(market);

  return (
    <div>
      <div className="flex items-center flex-row relative w-full overflow-hidden border-b border-slate-800">
        <div className="flex items-center justify-between flex-row no-scrollbar overflow-auto pr-4">
          <Ticker market={currentMarket} onMarketChange={setCurrentMarket} />
          <div className="flex items-center flex-row space-x-8 pl-4 py-2">
            <div className="flex flex-col h-full justify-center">
              <p
                className={`font-medium tabular-nums text-greenText text-lg text-green-500`}
              >
                ${ticker?.lastPrice}
              </p>
              <p className="font-medium text-sm  tabular-nums">
                ${ticker?.lastPrice}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className={`font-medium text-neutral-400 text-sm`}>
                24H Change
              </p>
              <p
                className={` font-medium tabular-nums leading-5 text-base text-greenText ${Number(ticker?.priceChange) > 0 ? "text-green-500" : "text-red-500"}`}
              >
                {Number(ticker?.priceChange) > 0 ? "+" : ""}{" "}
                {ticker?.priceChange}{" "}
                {Number(ticker?.priceChangePercent)?.toFixed(2)}%
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-medium text-sm text-neutral-400">24H High</p>
              <p className="text-base font-medium tabular-nums leading-5 ">
                {ticker?.high}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-medium text-sm text-neutral-400">24H Low</p>
              <p className="text-base font-medium tabular-nums leading-5 ">
                {ticker?.low}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="font-medium text-sm text-neutral-400">
                24H Volume (USDC)
              </p>
              <p className="text-base font-medium tabular-nums leading-5 ">
                {ticker?.quoteVolume
                  ? parseFloat(ticker.quoteVolume).toFixed(2)
                  : "0.00"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function Ticker({
  market,
  onMarketChange,
}: {
  market: string;
  onMarketChange: (market: string) => void;
}) {
  const [markets, setMarkets] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const marketImg = market.split("_")[0].toLowerCase();
  useEffect(() => {
    getTickers().then((data) => {
      const marketSymbols = data.map((ticker: Ticker) => ticker.symbol);
      setMarkets(marketSymbols);
    });
  }, []);

  return (
    <div className="flex h-[60px] shrink-0 space-x-2  items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-[250px] h-full my-4 bg-neutral-700/60 transition duration-200 hover:bg-neutral-500/60 hover:text-white justify-between border border-neutral-600 text-white"
          >
            <div className="flex items-center h-full relative justify-center w-1/4">
              <img
                src={`/market/${marketImg}.webp`}
                alt="market"
                loading="lazy"
                decoding="async"
                data-nimg="1"
                className="z-10 rounded-full h-8 w-8 absolute right-4 outline-baseBackgroundL1"
              />
              <img
                src="/usdc.webp"
                alt="usdc"
                loading="lazy"
                decoding="async"
                data-nimg="1"
                className="h-8 w-8 rounded-full absolute left-5"
              />
            </div>
            <div className="flex items-center justify-between w-3/4">
              <p>{market.replace("_", " / ")}</p>{" "}
              <ChevronsUpDown className="opacity-80" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[250px] p-0 ">
          <Command className="bg-neutral-800 justify-between border border-neutral-600 text-white">
            <CommandInput
              placeholder="Search market..."
              className="h-9 text-white"
            />
            <CommandList>
              <CommandEmpty>No market found.</CommandEmpty>
              <CommandGroup>
                {markets.map((marketSymbol) => (
                  <CommandItem
                    key={marketSymbol}
                    value={marketSymbol}
                    className="text-white"
                    onSelect={() => {
                      onMarketChange(marketSymbol);
                      router.push(`/trade/${marketSymbol}`);
                      setOpen(false);
                    }}
                  >
                    <img
                      src={`/market/${marketSymbol.split("_")[0].toLowerCase()}.webp`}
                      alt=""
                      className="z-10 rounded-full h-6 w-6"
                    />
                    {marketSymbol.replace("_", " / ")}
                    <Check
                      className={cn(
                        "ml-auto",
                        market === marketSymbol ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
