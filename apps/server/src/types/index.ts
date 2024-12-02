import z from "zod";
import "express";

export const SignupSchema = z.object({
  email: z.string().email(),
});
export const SigninSchema = z.object({
  email: z.string().email(),
});
export const OtpSchema = z.object({
  email: z.string().email(),
  otp: z.string(),
});
export const TradeSchema = z.object({
  traderId: z.string(),
  coin: z.string(),
  buyTime: z.date(),
  buyPrice: z.number(),
  volume: z.number(),
});
export const SellSchema = z.object({
  userId: z.string(),
  coin: z.string(),
  sellTime: z.date(),
  sellPrice: z.number(),
  volume: z.number(),
});

declare global {
  namespace Express {
    interface Request {
      userId?: string;
    }
  }
}
