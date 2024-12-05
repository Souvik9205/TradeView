-- CreateTable
CREATE TABLE "Currency" (
    "id" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "volume" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Currency_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MonthlyProfit" (
    "id" TEXT NOT NULL,
    "traderId" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "year" INTEGER NOT NULL,
    "profit" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "MonthlyProfit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Currency_id_key" ON "Currency"("id");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyProfit_id_key" ON "MonthlyProfit"("id");

-- AddForeignKey
ALTER TABLE "Currency" ADD CONSTRAINT "Currency_traderId_fkey" FOREIGN KEY ("traderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MonthlyProfit" ADD CONSTRAINT "MonthlyProfit_traderId_fkey" FOREIGN KEY ("traderId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
