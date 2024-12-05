"use client";
import { useEffect, useRef, useMemo } from "react";

export const AskTable = ({
  asks,
  onTotalChange,
}: {
  asks: [string, string][];
  onTotalChange: (total: number) => void;
}) => {
  const askWithTotal = useMemo(() => {
    let runningTotal = 0;
    const processedAsks = asks
      .filter(([_, quantity]) => Number(quantity) > 0.2) // Filter out small quantities
      .map(([price, quantity]) => {
        runningTotal += Number(quantity);
        return [price, quantity, runningTotal] as [string, string, number];
      });

    // Sort in descending order by total
    return processedAsks.sort((a, b) => b[2] - a[2]).slice(0, 12);
  }, [asks]);

  // Calculate the max total dynamically
  const maxTotal = useMemo(
    () => askWithTotal.reduce((acc, [, , total]) => Math.max(acc, total), 0),
    [askWithTotal]
  );

  const containerRef = useRef<HTMLDivElement>(null);

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
      {askWithTotal.map(([price, quantity, total]) => (
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
