"use client";
import { useEffect, useMemo } from "react";

export const BidTable = ({
  bids,
  onTotalChange,
}: {
  bids: [string, string][];
  onTotalChange: (total: number) => void;
}) => {
  const bidsWithTotal = useMemo(() => {
    let runningTotal = 0;
    return bids
      .filter(([_, quantity]) => Number(quantity) > 0.2)
      .slice(0, 12)
      .map(([price, quantity]) => {
        runningTotal += Number(quantity);
        return [price, quantity, runningTotal] as [string, string, number];
      });
  }, [bids]);

  // Calculate the max total dynamically
  const maxTotal = useMemo(
    () => bidsWithTotal.reduce((acc, [, , total]) => Math.max(acc, total), 0),
    [bidsWithTotal]
  );
  useEffect(() => {
    onTotalChange(maxTotal);
  }, [maxTotal, onTotalChange]);

  return (
    <div className="max-h-[25vh] overflow-y-scroll overflow-x-hidden hidden-scrollbar">
      {bidsWithTotal?.map(([price, quantity, total]) => (
        <Bid
          maxTotal={maxTotal}
          total={total}
          key={price}
          price={price}
          quantity={quantity}
        />
      ))}
    </div>
  );
};

function Bid({
  price,
  quantity,
  total,
  maxTotal,
}: {
  price: string;
  quantity: string;
  total: number;
  maxTotal: number;
}) {
  return (
    <div
      style={{
        display: "flex",
        position: "relative",
        width: "100%",
        backgroundColor: "transparent",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          width: `${(60 / maxTotal) * total}%`,
          height: "100%",
          background: "rgba(1, 167, 129, 0.18)",
          transition: "width 0.3s ease-in-out",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: `${(60 / maxTotal) * Number(quantity)}%`,
            height: "100%",
            background: "rgba(1, 180, 129, 0.4)",
            transition: "width 0.3s ease-in-out",
          }}
        />
      </div>
      <div className={`flex justify-between text-sm w-full`}>
        <div className="text-green-600">{price}</div>
        <div>{quantity}</div>
        <div>{total.toFixed(2)}</div>
      </div>
    </div>
  );
}
