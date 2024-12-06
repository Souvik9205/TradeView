import { Router } from "express";
import { verifyToken } from "../middleware";
import client from "@repo/db/client";
import { SellSchema, TradeSchema } from "../types";

export const tradeRouter = Router();
const currentMonth = new Date().getMonth() + 1;
const currentYear = new Date().getFullYear();

tradeRouter.post("/buy", verifyToken, async (req, res) => {
  const parseData = TradeSchema.safeParse(req.body);
  const userId = req.userId as string;
  if (!parseData.success) {
    res.status(400).json({ message: "Validation failed" });
    return;
  }
  try {
    const existingTrade = await client.trade.findFirst({
      where: {
        traderId: userId,
        coin: parseData.data.coin,
      },
    });
    if (existingTrade && existingTrade.volume > 0) {
      const totalVol = existingTrade.volume + parseData.data.volume;
      const weightedBuyPrice =
        (existingTrade.buyPrice * existingTrade.volume +
          parseData.data.buyPrice * parseData.data.volume) /
        totalVol;

      const updateTrade = await client.trade.update({
        where: {
          id: existingTrade.id,
        },
        data: {
          volume: totalVol,
          buyPrice: weightedBuyPrice,
          buyTime: parseData.data.buyTime,
        },
      });
      if (updateTrade) {
        const existingCurrency = await client.currency.findFirst({
          where: { traderId: userId, name: parseData.data.coin },
        });
        if (existingCurrency) {
          await client.currency.update({
            where: { id: existingCurrency.id },
            data: {
              volume: existingCurrency.volume + parseData.data.volume,
            },
          });
        } else {
          await client.currency.create({
            data: {
              traderId: userId,
              name: parseData.data.coin,
              volume: parseData.data.volume,
            },
          });
        }
      }
      res.status(200).json({ message: "trade updated", trade: updateTrade });
      return;
    }

    const newTrade = await client.trade.create({
      data: {
        traderId: userId,
        coin: parseData.data.coin,
        buyTime: parseData.data.buyTime,
        buyPrice: parseData.data.buyPrice,
        volume: parseData.data.volume,
      },
    });
    if (newTrade) {
      await client.currency.create({
        data: {
          traderId: userId,
          name: parseData.data.coin,
          volume: parseData.data.volume,
        },
      });
    }
    res.status(200).json({ message: "trade created", trade: newTrade });
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
  }
});

tradeRouter.post("/sell", verifyToken, async (req, res) => {
  const parseData = SellSchema.safeParse(req.body);
  const userId = req.userId as string;

  if (!parseData.success) {
    res.status(400).json({ message: "Validation failed" });
    return; // End handler execution
  }

  try {
    const existingTrade = await client.trade.findFirst({
      where: {
        traderId: userId,
        coin: parseData.data.coin,
        volume: { gt: 0 },
      },
    });

    if (!existingTrade) {
      res.status(404).json({ message: "Trade not found" });
      return; // End handler execution
    }

    if (existingTrade.volume < parseData.data.volume) {
      res.status(400).json({ message: "Not enough volume" });
      return; // End handler execution
    }

    if (parseData.data.volume === existingTrade.volume) {
      const gain =
        existingTrade.volume *
        (parseData.data.sellPrice - existingTrade.buyPrice);

      const updatedTrade = await client.trade.update({
        where: {
          id: existingTrade.id,
        },
        data: {
          volume: 0,
          sellPrice: parseData.data.sellPrice,
          sellTime: parseData.data.sellTime,
          gain,
        },
      });
      if (updatedTrade) {
        const currentMonth = new Date().getMonth() + 1; // Get current month (1-12)
        const currentYear = new Date().getFullYear(); // Get current year

        let monthlyProfit = await client.monthlyProfit.findFirst({
          where: {
            traderId: userId,
            month: currentMonth,
            year: currentYear,
          },
        });

        if (monthlyProfit) {
          await client.monthlyProfit.update({
            where: { id: monthlyProfit.id },
            data: {
              profit: monthlyProfit.profit + gain,
            },
          });
        } else {
          await client.monthlyProfit.create({
            data: {
              traderId: userId,
              month: currentMonth,
              year: currentYear,
              profit: gain,
            },
          });
        }

        // Update Currency Table: Delete or update the coin volume
        const existingCurrency = await client.currency.findFirst({
          where: {
            traderId: userId,
            name: parseData.data.coin,
          },
        });

        if (!existingCurrency) {
          res.status(400).json({ message: "No currency found" });
          return;
        }
        await client.currency.delete({
          where: {
            id: existingCurrency.id,
          },
        });
      }
      res.status(200).json({ message: "Trade updated", trade: updatedTrade });
      return; // End handler execution
    }

    const remainingVolume = existingTrade.volume - parseData.data.volume;
    const newBuyPrice =
      (existingTrade.buyPrice * existingTrade.volume -
        parseData.data.volume * parseData.data.sellPrice) /
      remainingVolume;

    const updatedTrade = await client.trade.update({
      where: {
        id: existingTrade.id,
      },
      data: {
        volume: remainingVolume,
        buyPrice: newBuyPrice,
      },
    });

    if (updatedTrade) {
      const existingCurrency = await client.currency.findFirst({
        where: {
          traderId: userId,
          name: parseData.data.coin,
        },
      });

      if (!existingCurrency) {
        res.status(400).json({ message: "No currency found" });
        return;
      }
      await client.currency.update({
        where: {
          id: existingCurrency.id,
        },
        data: {
          volume: remainingVolume,
        },
      });
    }

    res
      .status(200)
      .json({ message: "Partial trade sold", trade: updatedTrade });
  } catch (e) {
    console.error("Error processing sell:", e);
    res.status(500).json({ message: "Internal server error" });
  }
});

tradeRouter.get("/portfolio", verifyToken, async (req, res) => {
  const userId = req.userId;

  try {
    const portfolio = await client.currency.findMany({
      where: {
        traderId: userId,
      },
      select: {
        name: true,
        volume: true,
      },
    });

    if (!portfolio) {
      res.status(404).json({ message: "No currencies found in portfolio" });
      return;
    }

    res
      .status(200)
      .json({ message: "Portfolio fetched successfully", portfolio });
  } catch (e) {
    console.error("Error fetching portfolio:", e);
    res.status(500).json({ message: "Internal server error" });
  }
});

tradeRouter.get("/current-profit", verifyToken, async (req, res) => {
  const userId = req.userId;
  try {
    const currentProfit = await client.monthlyProfit.findFirst({
      where: {
        traderId: userId,
        month: currentMonth,
        year: currentYear,
      },
    });

    if (!currentProfit) {
      res.status(404).json({ message: "No profit data for the current month" });
      return;
    }

    res.status(200).json({
      message: "Current profit fetched successfully",
      profit: currentProfit.profit,
    });
  } catch (e) {
    console.error("Error fetching current profit:", e);
    res.status(500).json({ message: "Internal server error" });
  }
});

tradeRouter.get("/monthlystat", verifyToken, async (req, res) => {
  const userId = req.userId;
  try {
    const monthlyStats = [];
    for (let i = 4; i >= 0; i--) {
      const date = new Date(currentYear, currentMonth - i - 1);
      const month = date.getMonth() + 1;
      const year = date.getFullYear();

      // Fetch the profit data
      const profitData = await client.monthlyProfit.findFirst({
        where: {
          traderId: userId,
          month,
          year,
        },
      });

      monthlyStats.push({
        month,
        year,
        profit: profitData ? profitData.profit : 0,
      });
    }

    res.status(200).json({
      message: "Monthly profit stats fetched successfully",
      stats: monthlyStats,
    });
  } catch (e) {
    console.error("Error fetching monthly stats:", e);
    res.status(500).json({ message: "Internal server error" });
  }
});
