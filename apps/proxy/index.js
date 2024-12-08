const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

const targetUrl = "https://api.backpack.exchange";

// List of allowed origins
const allowedOrigins = [
  "https://marketview-rust.vercel.app",
  "http://localhost:3000",
];

// CORS Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "X-Requested-With"],
    credentials: true,
  })
);

app.use(morgan("dev"));

app.use(
  "/",
  createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      proxyReq.setHeader("origin", "https://marketview-rust.vercel.app");
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log("Proxy Response Headers:", proxyRes.headers);
    },
    onError: (err, req, res) => {
      console.error("Proxy Error:", err.message);
      res.status(502).send("Bad Gateway: Proxy encountered an error.");
    },
  })
);

app.options("*", (req, res) => {
  res.sendStatus(204);
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({
    error: "Something went wrong with the proxy server!",
    details: err.message,
  });
});

const port = 3129;
app.listen(port, () => {
  console.log(`Proxy server running on http://localhost:${port}`);
});
