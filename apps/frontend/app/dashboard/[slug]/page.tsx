"use client";

import React, { useEffect, useState } from "react";
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
import { getUser, getMonthlyStats } from "@/app/[utils]/serverClient";

import Coin from "@/app/components/user/Coins";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const { user, isAuthenticated } = useAuthStore();
  const logout = useAuthStore((state) => state.logout);
  const router = useRouter();
  const { toast } = useToast();

  const [client, setClient] = useState({
    avatar: "https://via.placeholder.com/150",
    name: "",
    email: "",
    walletBalance: 0,
  });
  const [monthlyProfitData, setMonthlyProfitData] = useState<
    { month: string; profit: number }[]
  >([]);

  useEffect(() => {
    if (user != null) {
      const fetchUserData = async () => {
        try {
          const userData = await getUser(user as string);
          setClient((prev) => ({
            ...prev,
            name: userData.user.username,
            email: userData.user.email,
          }));
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      };

      fetchUserData();
    }
  }, [user]);

  useEffect(() => {
    const fetchMonthlyStats = async () => {
      try {
        const stats = await getMonthlyStats();
        const formattedStats = stats.stats.map((stat: any) => ({
          month: new Date(stat.year, stat.month - 1).toLocaleString("default", {
            month: "short",
          }),
          profit: stat.profit,
        }));

        setMonthlyProfitData(formattedStats);
      } catch (error) {
        console.error("Error fetching monthly stats:", error);
      }
    };

    fetchMonthlyStats();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/");
    }
  }, []);

  const handleClaim = () => {
    toast({
      title: "Wallet",
      description: "Wallet is not yet implemented",
    });
  };
  const handleLogout = () => {
    logout();
    router.push("/");
  };

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
              className="bg-gradient-to-br p-1 rounded-md text-base font-semibold text-black/90 from-yellow-300/80 to-yellow-700/80 hover:bg-yellow-400"
              onClick={handleLogout}
            >
              Log out
            </button>
          </div>
        </header>

        <div className="space-y-6">
          <div className="bg-neutral-800/60 backdrop-blur-md rounded-xl shadow-2xl p-6">
            <div className="flex items-center space-x-4 mb-6">
              <img
                src={client.avatar}
                alt="User Avatar"
                className="w-16 h-16 rounded-full ring-4 ring-yellow-500/50"
              />
              <div>
                <h2 className="text-xl text-yellow-300">{client.name}</h2>
                <p className="text-sm text-gray-400">{client.email}</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                <Wallet size={20} className="text-yellow-400" />
                <h3 className="text-lg font-semibold">Wallet Balance</h3>
              </div>
              <div className="flex justify-between items-center p-4 bg-neutral-900/50 rounded-lg">
                <span className="text-2xl font-bold text-yellow-300">
                  ${client.walletBalance.toFixed(2)}
                </span>
                <button
                  onClick={handleClaim}
                  className="bg-gradient-to-br p-1 rounded-md text-base font-semibold text-black/90 from-yellow-300/80 to-yellow-700/80 hover:bg-yellow-400"
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
              <Coin />
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
              <h2 className="text-lg font-semibold">
                Monthly Profit Analytics
              </h2>
            </div>
            <div className="bg-neutral-900/50 p-4 rounded-lg">
              <LineChart data={monthlyProfitData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
