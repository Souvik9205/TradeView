import { Router } from "express";
import { verifyToken } from "../middleware";
import client from "@repo/db/client";
import { SellSchema, TradeSchema } from "../types";

export const tradeRouter = Router();

tradeRouter.post("/trade", verifyToken, async (req, res) => {
  const parseData = TradeSchema.safeParse(req.body);
  const userId = req.userId;
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
    if (existingTrade) {
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
      res.status(200).json({ message: "trade updated", trade: updateTrade });
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
    res.status(200).json({ message: "trade created", trade: newTrade });
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
  }
});

tradeRouter.post("/sell", verifyToken, async (req, res) => {
  const parseData = SellSchema.safeParse(req.body);
  const userId = req.userId;

  if (!parseData.success) {
    res.status(400).json({ message: "Validation failed" });
    return; // End handler execution
  }

  try {
    const existingTrade = await client.trade.findFirst({
      where: {
        traderId: userId,
        coin: parseData.data.coin,
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

    res
      .status(200)
      .json({ message: "Partial trade sold", trade: updatedTrade });
  } catch (e) {
    console.error("Error processing sell:", e);
    res.status(500).json({ message: "Internal server error" });
  }
});
