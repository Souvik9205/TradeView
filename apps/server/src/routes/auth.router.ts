import { Router } from "express";
import { verifyToken } from "../middleware";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { OtpSchema, SigninSchema, SignupSchema } from "../types";
import { JWT_SECRET } from "../config";
import nodemailer from "nodemailer";

export const authRouter = Router();
const client = new PrismaClient();
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.NODEMAILER_USER || "souvikmukhopadhyay4@gmail.com",
    pass: process.env.NODEMAILER_PASS || "ajpa cbms uvux alco",
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

    const existingOtpData = await client.otp.findUnique({
      where: {
        user: parseData.data.email,
      },
    });

    const emailHtmlContent = `
    <html>
      <body style="font-family: 'Arial', sans-serif; margin: 0; padding: 0; color: #e5e5e5;">
        <table role="presentation" style="width: 100%; padding: 40px 0;">
          <tr>
            <td style="text-align: center;">
              <div style="background-color: #1c1c1c; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);">
                <div style="background-color: #FACC15; color: #0f0f0f; padding: 20px; text-align: center;">
                  <h2 style="margin: 0; font-size: 24px; font-weight: bold;">MarketView</h2>
                </div>
                <div style="padding: 30px; text-align: center;">
                  <h1 style="font-size: 32px; color: #FACC15; margin-bottom: 10px;">Your OTP Code</h1>
                  <p style="font-size: 16px; color: #e5e5e5;">We just need to verify your email address. Use the OTP code below:</p>
                  <div style="background-color: #0f0f0f; border: 2px solid #FACC15; padding: 20px; border-radius: 5px; font-size: 24px; font-weight: bold; color: #ffc107; margin-top: 20px;">
                    <span>${otp}</span>
                  </div>
                  <p style="font-size: 14px; color: #888888; margin-top: 20px;">This code will expire in 5 minutes. Please use it quickly!</p>
                  <p style="font-size: 14px; color: #888888;">If you did not request this, you can ignore this email.</p>
                </div>
                <div style="background-color: #1c1c1c; padding: 20px; text-align: center;">
                  <p style="font-size: 12px; color: #888888; margin: 0;">© 2024 MarketView. All rights reserved.</p>
                </div>
              </div>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

    if (existingOtpData) {
      await client.otp.update({
        where: {
          user: parseData.data.email,
        },
        data: {
          otp: otp,
          expiresAt: otpExpiry,
        },
      });
    } else {
      const otpData = await client.otp.create({
        data: {
          user: parseData.data.email,
          otp: otp,
          expiresAt: otpExpiry,
        },
      });
    }

    await transporter.sendMail({
      from: "MarketView <no-reply@example.com>",
      to: parseData.data.email,
      subject: "Verify your email",
      html: emailHtmlContent,
    });

    res.status(200).json({ message: "OTP sent to your email" });
    return;
  } catch (e) {
    console.error("Error occurred: ", e);
    res.status(500).json({
      message: "Internal server error. Please try again later.",
      error: e,
    });
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

    const existingOtpData = await client.otp.findUnique({
      where: {
        user: parseData.data.email,
      },
    });

    const emailHtmlContent = `
    <html>
      <body style="font-family: 'Arial', sans-serif; background-color: #0f0f0f; margin: 0; padding: 0; color: #e5e5e5;">
        <table role="presentation" style="width: 100%; background-color: #0f0f0f; padding: 40px 0;">
          <tr>
            <td style="text-align: center;">
              <div style="background-color: #1c1c1c; max-width: 600px; margin: 0 auto; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);">
                <div style="background-color: #ffc107; color: #0f0f0f; padding: 20px; text-align: center;">
                  <h2 style="margin: 0; font-size: 24px; font-weight: bold;">MarketView</h2>
                </div>
                <div style="padding: 30px; text-align: center;">
                  <h1 style="font-size: 32px; color: #ffc107; margin-bottom: 10px;">Your OTP Code</h1>
                  <p style="font-size: 16px; color: #e5e5e5;">We just need to verify your email address. Use the OTP code below:</p>
                  <div style="background-color: #0f0f0f; border: 2px solid #ffc107; padding: 20px; border-radius: 5px; font-size: 24px; font-weight: bold; color: #ffc107; margin-top: 20px;">
                    <span>${otp}</span>
                  </div>
                  <p style="font-size: 14px; color: #888888; margin-top: 20px;">This code will expire in 5 minutes. Please use it quickly!</p>
                  <p style="font-size: 14px; color: #888888;">If you did not request this, you can ignore this email.</p>
                </div>
                <div style="background-color: #1c1c1c; padding: 20px; text-align: center;">
                  <p style="font-size: 12px; color: #888888; margin: 0;">© 2024 MarketView. All rights reserved.</p>
                </div>
              </div>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `;

    if (existingOtpData) {
      await client.otp.update({
        where: {
          user: parseData.data.email,
        },
        data: {
          otp: otp,
          expiresAt: otpExpiry,
        },
      });
    } else {
      const otpData = await client.otp.create({
        data: {
          user: parseData.data.email,
          otp: otp,
          expiresAt: otpExpiry,
        },
      });
    }

    await transporter.sendMail({
      from: "MarketView <no-reply@example.com>",
      to: parseData.data.email,
      subject: "Verify your email",
      html: emailHtmlContent,
    });

    res.status(200).json({ message: "OTP sent to your email" });
    return;
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
    res.status(200).json({
      message: token,
      success: true,
      id: user.id,
      user: usernameFromEmial(parseData.data.email),
      token: token,
    });
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
  }
});

authRouter.get("/user/:id", verifyToken, async (req, res) => {
  const username = req.params.id;
  try {
    const user = await client.user.findFirst({
      where: {
        username: username,
      },
    });
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ user });
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
  const userId = req.userId;
  const traderId = req.params.id;
  try {
    if (userId !== traderId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }
    const trades = await client.trade.findMany({
      where: {
        traderId: traderId,
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
