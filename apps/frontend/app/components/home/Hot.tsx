import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";

const CRYPTO_SYMBOLS = [
  "BTC_USDC",
  "ETH_USDC",
  "PYTH_USDC",
  "MOODENG_USDC",
  "SOL_USDC",
];

interface CryptoPageProps {
  user: string;
}

const CryptoPage: React.FC<CryptoPageProps> = ({ user }) => {
  const router = useRouter();
  const [cryptocurrencies, setCryptocurrencies] = useState<
    {
      name: string;
      fullName: string;
      lastPrice: string;
      priceChange: number;
      priceChangePercent: number;
      isPositive: boolean;
    }[]
  >([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchCryptocurrencyData = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:3129/api/v1/tickers"
        );
        const filteredData = CRYPTO_SYMBOLS.map((symbol) => {
          const coinData = data.find((item: any) => item.symbol === symbol);
          if (coinData) {
            const [name] = symbol.split("_");
            return {
              name,
              fullName: name.toUpperCase(),
              lastPrice: `$${parseFloat(coinData.lastPrice).toFixed(2)}`,
              priceChange: `${parseFloat(coinData.priceChange)}`,
              priceChangePercent: parseFloat(coinData.priceChangePercent),
              isPositive: parseFloat(coinData.priceChange) >= 0,
            };
          }
          return null;
        }).filter(Boolean); // Remove any null values
        setCryptocurrencies(filteredData as any[]);
      } catch (error) {
        console.error("Error fetching cryptocurrency data:", error);
      }
    };

    fetchCryptocurrencyData();
  }, []);

  return (
    <div className="text-white flex items-center justify-around px-4 gap-20 ">
      {user != "" ? (
        <section className="flex flex-col items-baseline gap-10 w-2/3 pl-10">
          <div className="text-left">
            <h1 className="text-xxxl font-bold leading-tight text-yellow-400">
              Welcome <br />
              {user as string}
            </h1>
          </div>
          <div className="text-left text-base tracking-tight text-white/70 pl-3">
            <p>
              Step into the future of finance! Unlock limitless opportunities,
              grow your wealth, and experience the thrill of crypto trading like
              never before. Your journey to financial freedom starts here!
            </p>
          </div>
        </section>
      ) : (
        <section className="flex flex-col items-baseline gap-8 w-2/3 pl-3 ">
          <div className="text-left">
            <h1 className="text-xxxl font-bold leading-tight text-yellow-400">
              Start <br />
              Trading Today
            </h1>
          </div>
          <div className="flex flex-col items-center pl-3">
            <div className="flex">
              <input
                type="text"
                placeholder="Email/Phone number"
                className="px-4 py-2 w-72 rounded-l-lg bg-gradient-to-tl from-neutral-700 to-neutral-900 text-white placeholder-gray-400 border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-yellow-400"
              />
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-gradient-to-br text-black/90 from-yellow-300/80 to-yellow-700/80 px-6 py-2 font-semibold rounded-r-lg hover:bg-yellow-500 transition duration-300"
              >
                Sign Up
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="w-1/3">
        <div className="bg-gradient-to-br from-neutral-700 to-neutral-900 border-2 border-neutral-600 mt-6 rounded-lg w-full p-6">
          <div className="w-full">
            <h2 className="text-lg font-semibold mb-4">Popular</h2>
            <div className="border-b-4 border-neutral-500 mb-4"></div>
            <ul>
              {cryptocurrencies.map((crypto, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between py-2 px-3 rounded-lg border-b border-gray-700 last:border-none cursor-pointer hover:bg-neutral-700"
                  onClick={() => {
                    router.push(`/trade/${crypto.fullName}_USDC`);
                  }}
                >
                  <div className="flex items-center gap-5">
                    <img
                      src={`./coins/${crypto.name.toLowerCase()}.png`}
                      alt={crypto.name}
                      className="h-8 w-8 rounded-full"
                    />
                    <div className="ml-2">
                      <h3 className="font-semibold">{crypto.name}</h3>
                      <p className="text-sm text-gray-400">{crypto.fullName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{crypto.lastPrice}</p>
                    <p
                      className={`text-sm ${
                        crypto.isPositive ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {(crypto.priceChangePercent * 100).toFixed(2)}%
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-neutral-800 text-white w-80 p-6 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Enter OTP</h2>
            <p className="text-sm text-gray-400 mb-4">
              We've sent a 6-digit OTP to your phone. Please enter it below to
              verify your account.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                // Add OTP validation logic here
                console.log("OTP submitted");
                setIsModalOpen(false);
              }}
              className="flex flex-col items-center gap-4"
            >
              <InputOTP maxLength={6}>
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                </InputOTPGroup>
                <InputOTPSeparator />
                <InputOTPGroup>
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
              <Button type="submit" className="w-full">
                Submit OTP
              </Button>
            </form>
            <button
              onClick={() => setIsModalOpen(false)}
              className="text-sm text-yellow-400 mt-4 hover:underline"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CryptoPage;
