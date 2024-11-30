"use client";
import { MarketBar } from "@/app/components/MarketBar";
import { SwapUI } from "@/app/components/SwapUI";
import { TradeView } from "@/app/components/TradeView";
import { Depth } from "@/app/components/depth/Depth";
import { useParams } from "next/navigation";

export default function Page() {
  const { market } = useParams();
  return (
    <div className="flex flex-row flex-1">
      <div className="flex flex-col flex-1 mx-10">
        <MarketBar market={market as string} />
        <div className="flex h-[80vh] border-y border-slate-800">
          <div className="flex flex-col flex-1 border border-slate-800 h-full">
            <TradeView market={market as string} />
          </div>
          <div className="flex flex-col w-[20vw] overflow-hidden">
            <Depth market={market as string} />
          </div>
          <div className="w-[10px] flex-col border-slate-800 border-l"></div>
          <div className="flex flex-col w-[15vw]">
            <SwapUI market={market as string} />
          </div>
        </div>
      </div>
    </div>
  );
}
