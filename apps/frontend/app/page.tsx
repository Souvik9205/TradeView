"use client";

import React, { useState, useEffect } from "react";
import CryptoPage from "./components/home/Hot";
import coinNames from "./[data]/coin";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Ticker {
  firstPrice: string;
  high: string;
  lastPrice: string;
  low: string;
  priceChange: string;
  priceChangePercent: string;
  quoteVolume: string;
  symbol: string;
  trades: string;
  volume: string;
}

const getFullName = (shortName: string) => {
  const coin = coinNames.find((c) => c.shortName === shortName);
  return coin ? coin.fullName : shortName;
};

const formatNumber = (num: string | number, decimals = 2) => {
  const n = parseFloat(num as string);
  if (n >= 1e9) return `${(n / 1e9).toFixed(decimals)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(decimals)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(decimals)}k`;
  return n.toFixed(decimals);
};

const MarketsPage = () => {
  const [tickers, setTickers] = useState<Ticker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const router = useRouter();

  const totalPages = Math.ceil(tickers.length / itemsPerPage);

  const paginatedTickers = tickers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  useEffect(() => {
    const fetchTickers = async () => {
      try {
        const response = await fetch("http://localhost:3129/api/v1/tickers");
        if (!response.ok) {
          throw new Error("Failed to fetch tickers");
        }
        const data: Ticker[] = await response.json();
        const sortedData = data.sort(
          (a, b) => parseInt(b.trades) - parseInt(a.trades)
        );
        setTickers(sortedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchTickers();
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  if (loading) {
    return (
      <div className="min-h-screen mx-72 flex flex-col items-center">
        <div className="flex gap-2 h-3/5 w-full">
          <Skeleton className="w-2/3 h-full" />
          <Skeleton className="w-1/3 h-full" />
        </div>
        <Skeleton className="h-2/5 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-tl from-neutral-900 to-neutral-100 text-white flex items-center justify-center">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="">
        <div className="mx-72 flex gap-10 flex-col ">
          <section id="main" className="w-full mt-10">
            <CryptoPage />
          </section>

          <section
            id="markets"
            className="bg-gradient-to-br from-neutral-700 to-neutral-900 border border-gray-500 w-full min-h-screen rounded-xl p-6 mb-10"
          >
            <h2 className="text-3xl font-extrabold text-neutral-300 mb-4 text-lg">
              Markets
            </h2>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left border border-gray-500 text-white rounded-lg overflow-hidden shadow-lg">
                <thead className="bg-yellow-400 text-black border-2  border-gray-400">
                  <tr>
                    <th className="px-6 py-3 font-bold text-base uppercase tracking-wider">
                      Coin
                    </th>
                    <th className="px-6 py-3 font-bold text-base uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 font-bold text-base uppercase tracking-wider">
                      24h Trades
                    </th>
                    <th className="px-6 py-3 font-bold text-base uppercase tracking-wider">
                      24h Volume
                    </th>
                    <th className="px-6 py-3 font-bold text-base uppercase tracking-wider">
                      24h Change
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700 bg-neutral-800">
                  {paginatedTickers.map((ticker) => {
                    const coinName = ticker.symbol.split("_")[0];
                    const fullName = getFullName(coinName);
                    const logoPath = `/market/${coinName.toLowerCase()}.webp`;

                    return (
                      <tr
                        key={ticker.symbol}
                        className="hover:bg-neutral-700 transition-all duration-300 ease-in-out cursor-pointer"
                        onClick={() => {
                          router.push(`/trade/${ticker.symbol}`);
                        }}
                      >
                        <td className="px-6 py-4 flex items-center gap-3">
                          <img
                            src={logoPath}
                            alt={coinName}
                            className="w-8 h-8 rounded-full"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                "/market/default.png";
                            }}
                          />
                          <div className="ml-4">
                            <span className="block text-lg font-semibold text-white/75">
                              {fullName}
                            </span>
                            <span className="block text-sm text-gray-400/80 uppercase">
                              {coinName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">${ticker.lastPrice}</td>
                        <td className="px-6 py-4">{ticker.trades}</td>
                        <td className="px-6 py-4">
                          {formatNumber(ticker.quoteVolume)}
                        </td>
                        <td
                          className={`px-6 py-4 font-semibold ${
                            parseFloat(ticker.priceChangePercent) > 0
                              ? "text-green-400"
                              : "text-red-400"
                          }`}
                        >
                          {parseFloat(ticker.priceChangePercent) > 0 ? "+" : ""}
                          {(
                            parseFloat(ticker.priceChangePercent) * 100
                          ).toFixed(2)}
                          %
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex justify-center">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      href="#"
                      onClick={() =>
                        handlePageChange(Math.max(currentPage - 1, 1))
                      }
                    />
                  </PaginationItem>
                  {Array.from({ length: totalPages }).map((_, idx) => (
                    <PaginationItem key={idx}>
                      <PaginationLink
                        href="#"
                        isActive={currentPage === idx + 1}
                        onClick={() => handlePageChange(idx + 1)}
                      >
                        {idx + 1}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  <PaginationItem>
                    <PaginationEllipsis />
                  </PaginationItem>
                  <PaginationItem>
                    <PaginationNext
                      href="#"
                      onClick={() =>
                        handlePageChange(Math.min(currentPage + 1, totalPages))
                      }
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </section>
        </div>
      </div>
      <div
        className="absolute top-0 left-0 -z-10 w-full h-full bg-fixed bg-center bg-cover grayscale opacity-50"
        style={{ backgroundImage: "url('./bg.png')" }}
      ></div>
      <div className="absolute top-0 left-0 -z-20 w-full h-full bg-gradient-to-tr from-neutral-800 to-neutral-900"></div>
    </div>
  );
};

export default MarketsPage;
