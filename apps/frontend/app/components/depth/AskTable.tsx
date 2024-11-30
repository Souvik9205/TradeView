"use client";
import { useEffect, useRef } from "react";

export const AskTable = ({
  asks,
  onTotalChange,
}: {
  asks: [string, string][];
  onTotalChange: (total: number) => void;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  let currentTotal = 0;
  const relevantAsks = asks.slice(0, 12);

  const asksWithTotal: [string, string, number][] = relevantAsks.map(
    ([price, quantity]) => [price, quantity, (currentTotal += Number(quantity))]
  );
  const maxTotal = relevantAsks.reduce(
    (acc, [_, quantity]) => acc + Number(quantity),
    0
  );
  asksWithTotal.reverse();

  useEffect(() => {
    onTotalChange(maxTotal);
  }, [maxTotal, onTotalChange]);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  return (
    <div
      ref={containerRef}
      className="max-h-[25vh] overflow-y-scroll hidden-scrollbar overflow-x-hidden"
    >
      {asksWithTotal.map(([price, quantity, total]) => (
        <Ask
          maxTotal={maxTotal}
          key={price}
          price={price}
          quantity={quantity}
          total={total}
        />
      ))}
    </div>
  );
};

function Ask({
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
          background: "rgba(220, 38, 38, 0.18)",
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
            background: "rgba(220, 38, 38, 0.4)",
            transition: "width 0.3s ease-in-out",
          }}
        />
      </div>
      <div className="flex text-center justify-between text-sm w-full relative">
        <div className="text-red-600">{price}</div>
        <div>{quantity}</div>
        <div>{total.toFixed(2)}</div>
      </div>
    </div>
  );
}
