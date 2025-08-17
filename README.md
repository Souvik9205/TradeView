# TradeView

TradeView is a comprehensive platform for visualizing, analyzing, and tracking financial trades. It provides interactive charts, real-time data, and portfolio management tools for traders and investors.

## Features

- Real-time market data visualization
- Interactive candlestick and line charts
- Portfolio and trade tracking
- Customizable technical indicators
- User authentication and secure data storage

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/tradeview.git
   cd tradeview
   ```
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Start the development server:
   ```bash
   pnpm start
   ```

## Usage

- Register or log in to your account.
- Add your trades and manage your portfolio.
- Use the dashboard to analyze market trends and your performance.

## Technologies Used

- React
- Node.js / Express
- MongoDB
- Charting libraries (e.g., Chart.js, D3.js)
- WebSocket for real-time updates

## API Integration

TradeView integrates with the Backpack API to fetch real-time market data and execute trades securely.

## Running the Project

1. Start all services using Docker Compose:
   ```bash
   docker compose up
   ```
2. Set the database URL in `apps/server/.env`:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5422/tradeview_db"
   ```
3. Run Prisma commands to set up the database:
   ```bash
   npx prisma generate && npx prisma migrate dev
   ```
4. Start all applications (frontend, proxy server, backend):
   ```bash
   pnpm dev
   ```

   - Frontend: [http://localhost:3000](http://localhost:3000)
   - Proxy server: [http://localhost:3129](http://localhost:3129)
   - Backend: [http://localhost:3121](http://localhost:3121)
