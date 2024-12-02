import { authRouter } from "./routes/auth.router";
import { tradeRouter } from "./routes/trade.router";
import express from "express";
import cors from "cors";

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:3000";

app.use(
  cors({
    origin: FRONTEND_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());
const PORT = 3121;

app.get("/", (req, res) => {
  res.send("Hello from the server!");
});
app.use("/auth", authRouter);
app.use("/trade", tradeRouter);

app.listen(PORT, async () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
