import { Router } from "express";
import { verifyToken } from "../middleware";
import client from "@repo/db/client";
import jwt from "jsonwebtoken";
import { OtpSchema, SigninSchema, SignupSchema } from "../types";
import { JWT_SECRET } from "../config";
import nodemailer from "nodemailer";

export const authRouter = Router();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_USER,
    pass: process.env.NODEMAILER_PASS,
  },
});

function generateOtp() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
function usernameFromEmial(email: string) {
  return email.split("@")[0];
}

authRouter.post("/signup", async (req, res) => {
  const parseData = SignupSchema.safeParse(req.body);
  if (!parseData.success) {
    res.status(400).json({ message: "Validation failed" });
    return;
  }

  try {
    const user = await client.user.findUnique({
      where: {
        email: parseData.data.email,
      },
    });
    if (user) {
      res.status(400).json({ message: "User already exists" });
      return;
    }
    const otp = generateOtp();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 5);

    const otpData = await client.otp.create({
      data: {
        user: parseData.data.email,
        otp: otp,
        expiresAt: otpExpiry,
      },
    });

    if (otpData) {
      await transporter.sendMail({
        from: "TradeView <no-reply@example.com>",
        to: parseData.data.email,
        subject: "Verify your email",
        text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
        html: `<p>Use the following OTP to verify your email :)</p>`,
      });
      res.status(200).json({ message: "OTP sent to your email" });
      return;
    }
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
  }
});

authRouter.post("/signin", async (req, res) => {
  const parseData = SigninSchema.safeParse(req.body);
  if (!parseData.success) {
    res.status(403).json({ message: "Validation failed" });
    return;
  }

  try {
    const user = await client.user.findUnique({
      where: {
        email: parseData.data.email,
      },
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    const otp = generateOtp();
    const otpExpiry = new Date();
    otpExpiry.setMinutes(otpExpiry.getMinutes() + 5);

    const otpData = await client.otp.create({
      data: {
        user: parseData.data.email,
        otp: otp,
        expiresAt: otpExpiry,
      },
    });

    if (otpData) {
      await transporter.sendMail({
        from: "TradeView <no-reply@example.com>",
        to: parseData.data.email,
        subject: "Verify your email",
        text: `Your OTP code is ${otp}. It will expire in 5 minutes.`,
        html: `<p>Use the following OTP to verify your email :)</p>`,
      });

      res.status(200).json({ message: "OTP sent to your email" });
      return;
    }
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
  }
});

authRouter.post("/verify-otp", async (req, res) => {
  const parseData = OtpSchema.safeParse(req.body);
  if (!parseData.success) {
    res.status(400).json({ message: "Validation failed" });
    return;
  }
  try {
    const verifiedOtp = await client.otp.findFirst({
      where: {
        user: parseData.data.email,
        otp: parseData.data.otp,
      },
    });
    if (!verifiedOtp) {
      res.status(400).json({ message: "Invalid Credentials" });
      return;
    }
    if (verifiedOtp.expiresAt < new Date()) {
      res.status(400).json({ message: "OTP expired" });
      return;
    }
    let user = await client.user.findUnique({
      where: {
        email: parseData.data.email,
      },
    });
    if (!user) {
      const username = usernameFromEmial(parseData.data.email);
      user = await client.user.create({
        data: {
          email: parseData.data.email,
          username: username,
        },
      });
    }
    await client.otp.deleteMany({
      where: {
        user: parseData.data.email,
      },
    });
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "5d",
    });
    res.status(200).json({ message: token, success: true });
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
  }
});

authRouter.get("/user/:id", verifyToken, async (req, res) => {
  const userId = req.params.id;
  try {
    const user = await client.user.findUnique({
      where: {
        id: userId,
      },
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ message: user, success: true });
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
  }
});

authRouter.get("/leaderboard", verifyToken, async (req, res) => {
  try {
    const user = await client.user.findMany();
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ message: user, success: true });
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
  }
});

authRouter.get("/user/trades/:id", verifyToken, async (req, res) => {
  const userId = req.params.id;
  try {
    const trades = await client.trade.findMany({
      where: {
        traderId: userId,
      },
    });
    if (!trades) {
      res.status(404).json({ message: "Trades not found" });
      return;
    }
    res.status(200).json({ message: trades, success: true });
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
  }
});