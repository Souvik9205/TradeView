"use client";

import React, { useState } from "react";
import {
  TrendingUp,
  BarChart2,
  History,
  UserCircle2,
  Wallet,
} from "lucide-react";
import AllTrades from "@/app/components/user/AllTrades";
import LineChart from "@/app/components/user/ProfitChart";
import { useAuthStore } from "@/app/[utils]/AuthStore";

const Dashboard = () => {
  const [user, setUser] = useState({
    avatar: "https://via.placeholder.com/150",
    name: "John Doe",
    email: "john.doe@example.com",
    walletBalance: 120.5,
    coins: [
      { name: "Bitcoin", symbol: "BTC", amount: 0.0023, color: "#F7931A" },
      { name: "Ethereum", symbol: "ETH", amount: 0.15, color: "#627EEA" },
      { name: "Litecoin", symbol: "LTC", amount: 2.5, color: "#345D9D" },
    ],
  });

  const monthlyProfitData = [
    { month: "Jan", profit: 3000 },
    { month: "Feb", profit: 4000 },
    { month: "Mar", profit: 2500 },
    { month: "Apr", profit: 5000 },
    { month: "May", profit: 6200 },
    { month: "Jun", profit: 4900 },
    { month: "Jul", profit: 7000 },
    { month: "Aug", profit: 7500 },
    { month: "Sep", profit: 6700 },
    { month: "Oct", profit: 8000 },
  ];
  const handleClaim = () => {
    setUser((prev) => ({
      ...prev,
      walletBalance: prev.walletBalance + 10,
    }));
    alert("Claimed $10 successfully!");
  };
  const logout = useAuthStore((state) => state.logout);

  return (
    <div className="relative bg-gradient-to-br from-neutral-900 to-neutral-800 text-white min-h-screen p-4 md:p-8">
      <div
        className="absolute inset-0 bg-fixed bg-cover opacity-50 grayscale pointer-events-none"
        style={{ backgroundImage: "url('./bg.png')" }}
      ></div>
      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        <header className="flex justify-between items-center bg-neutral-800/60 backdrop-blur-md rounded-xl p-4 md:p-6 shadow-2xl">
          <div className="flex items-center space-x-4">
            <UserCircle2 size={40} className="text-yellow-400" />
            <h1 className="text-2xl md:text-3xl font-extrabold text-yellow-300">
              Dashboard
            </h1>
            <button
              className="p-2 bg-yellow-400 text-black rounded-lg"
              onClick={logout}
            >
              Log out
            </button>
          </div>
        </header>

        <div className="space-y-6">
          <div className="bg-neutral-800/60 backdrop-blur-md rounded-xl shadow-2xl p-6">
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={user.avatar}
                alt="User Avatar"
                className="w-16 h-16 rounded-full ring-4 ring-yellow-500/50"
              />
              <div>
                <h2 className="text-xl text-yellow-300">{user.name}</h2>
                <p className="text-sm text-gray-400">{user.email}</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <Wallet size={20} className="text-yellow-400" />
                <h3 className="text-lg font-semibold">Wallet Balance</h3>
              </div>
              <div className="flex justify-between items-center p-4 bg-neutral-900/50 rounded-lg">
                <span className="text-2xl font-bold text-yellow-300">
                  ${user.walletBalance.toFixed(2)}
                </span>
                <button
                  onClick={handleClaim}
                  className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded-md transition-all"
                >
                  Claim $10
                </button>
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2 mb-4">
                <TrendingUp size={20} className="text-yellow-400" />
                <h3 className="text-lg font-semibold">Coins</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full bg-neutral-900/50 rounded-lg">
                  <thead>
                    <tr className="border-b border-yellow-500/20">
                      <th className="p-3 text-left">Name</th>
                      <th className="p-3 text-left">Symbol</th>
                      <th className="p-3 text-left">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user.coins.map((coin, idx) => (
                      <tr
                        key={idx}
                        className="hover:bg-neutral-800/50 transition-colors"
                      >
                        <td className="p-3 flex items-center space-x-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: coin.color }}
                          />
                          <span>{coin.name}</span>
                        </td>
                        <td className="p-3">{coin.symbol}</td>
                        <td className="p-3">{coin.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-neutral-800/60 backdrop-blur-md rounded-xl shadow-2xl p-6">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <History size={20} className="text-yellow-400" />
                <h3 className="text-lg font-semibold">All Trades</h3>
              </div>
              <div className="overflow-x-auto">
                <AllTrades userId="123" />
              </div>
            </div>
          </div>

          <div className="bg-neutral-800/60 backdrop-blur-md p-6 rounded-xl shadow-2xl">
            <div className="flex items-center space-x-2 mb-4">
              <BarChart2 size={24} className="text-yellow-400" />
              <h2 className="text-lg font-semibold text-yellow-300">
                Monthly Profit Analytics
              </h2>
            </div>
            <div className="bg-neutral-900/50 p-4 rounded-lg">
              {/* <p className="text-center text-gray-400">
                Chart visualization is temporarily unavailable
              </p> */}
              <LineChart data={monthlyProfitData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
