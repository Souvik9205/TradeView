const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const app = express();

const targetUrl = "https://api.backpack.exchange";

app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://marketview-rust.vercel.app"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Expose-Headers", "Content-Length, Content-Range");
  next();
});

app.use(
  "/",
  createProxyMiddleware({
    target: targetUrl,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      proxyReq.setHeader("origin", "https://marketview-rust.vercel.app");
      proxyReq.setHeader("Authorization", "Bearer <your-api-token>");
    },
    onProxyRes: (proxyRes, req, res) => {
      console.log("Proxy Response Headers:", proxyRes.headers);
    },
  })
);

const port = 3129;
app.listen(port, () => {
  console.log(`Proxy server running on http://localhost:${port}`);
});
