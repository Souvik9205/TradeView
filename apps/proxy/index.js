const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const morgan = require("morgan");

const app = express();

const targetUrl = "https://api.backpack.exchange";

// List of allowed origins (your frontend origins)
const allowedOrigins = [
  "https://marketview-rust.vercel.app",
  "http://localhost:3000",
];

// CORS Middleware for browser <-> proxy
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
    allowedHeaders: ["Content-Type", "X-Requested-With", "Authorization"],
    credentials: true,
  })
);

app.use(morgan("dev"));

// Pick the exact origin string the Backpack API accepts.
// Try "http://localhost:3000" first; if you still get 403, try "http://localhost" (no port).
const SPOOF_ORIGIN_FOR_BACKPACK = "http://localhost:3000";

app.use(
  "/",
  createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true, // sets Host to target host
    onProxyReq: (proxyReq, req, res) => {
      // Set Origin with correct capitalization
      proxyReq.setHeader("Origin", SPOOF_ORIGIN_FOR_BACKPACK);

      // Some servers check Referer — set that too
      proxyReq.setHeader("Referer", SPOOF_ORIGIN_FOR_BACKPACK + "/");

      // Optional: forward client's authorization header if you have one
      if (req.headers.authorization) {
        proxyReq.setHeader("Authorization", req.headers.authorization);
      }

      // Debug: log proxied request headers (remove in prod)
      console.log("Proxying request to Backpack with headers:", {
        Origin: proxyReq.getHeader("Origin"),
        Referer: proxyReq.getHeader("Referer"),
        Host: proxyReq.getHeader("Host"),
      });
    },
    onProxyRes: (proxyRes, req, res) => {
      // Override/attach CORS headers so the browser accepts the response from *your proxy*
      const incomingOrigin =
        req.headers.origin || "https://marketview-rust.vercel.app";
      res.setHeader("Access-Control-Allow-Origin", incomingOrigin);
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, X-Requested-With, Authorization"
      );
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
      );

      // Optional: log upstream response status for debugging
      console.log(`Backpack responded with status ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
      console.error("Proxy Error:", err && err.message);
      // Ensure we send CORS headers on errors too so browser can read the response
      res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.status(502).send("Bad Gateway: Proxy encountered an error.");
    },
    // Optional: increase timeout if upstream is slow
    proxyTimeout: 10_000,
    timeout: 15_000,
  })
);

// Preflight handler (you already had this)
app.options("*", (req, res) => {
  res.sendStatus(204);
});

// Error handler
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
