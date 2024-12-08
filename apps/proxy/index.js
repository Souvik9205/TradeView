const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const app = express();

const targetUrl = "https://api.backpack.exchange";

// Middleware to handle CORS
app.use((req, res, next) => {
  // Allow all origins
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, X-Requested-With");
  res.header("Access-Control-Allow-Credentials", "true");

  // Handle preflight OPTIONS requests
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

// Proxy Middleware
app.use(
  "/",
  createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      // Mimic requests from a specific origin if needed
      proxyReq.setHeader("origin", req.headers.origin || "");
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

const port = 3129;
app.listen(port, () => {
  console.log(`Proxy server running on http://localhost:${port}`);
});
