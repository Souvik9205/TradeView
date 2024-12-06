import React, { useEffect, useState } from "react";
import { getCoins } from "../../[utils]/serverClient";
import coinNames from "@/app/[data]/coin";

type Coin = {
  name: string;
  volume: number;
};

const getFullName = (shortName: string) => {
  const coin = coinNames.find((c) => c.shortName === shortName);
  return coin ? coin.fullName : shortName;
};

const Coin: React.FC = () => {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        setLoading(true);
        const response = await getCoins();
        setCoins(response.portfolio || []);
      } catch (err: any) {
        console.error("Error fetching coins:", err);
        setError("Failed to fetch coins. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, []);

  if (loading) {
    return <p className="text-gray-400">Loading...</p>;
  }

  if (error) {
    return <p className="text-red-400">{error}</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full bg-neutral-900/50 rounded-lg">
        <thead>
          <tr className="border-b border-yellow-500/20">
            <th className="p-3 text-left">Name</th>
            <th className="p-3 text-left">Symbol</th>
            <th className="p-3 text-left">Amount</th>
          </tr>
        </thead>
        <tbody className="bg-neutral-700/50 border border-yellow-500/20">
          {coins.length === 0 ? (
            <tr>
              <td colSpan={3} className="p-5 text-center">
                <p className="text-gray-400">No coins available</p>
              </td>
            </tr>
          ) : (
            coins.map((coin, idx) => {
              const coinName = coin.name.split("_")[0];
              const fullName = getFullName(coinName);

              return (
                <tr
                  key={idx}
                  className="hover:bg-neutral-800/50 transition-colors"
                >
                  <td className="p-3">{fullName}</td> {/* Render full name */}
                  <td className="p-3">{coinName}</td> {/* Render coin name */}
                  <td className="p-3">{coin.volume}</td> {/* Render volume */}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Coin;
