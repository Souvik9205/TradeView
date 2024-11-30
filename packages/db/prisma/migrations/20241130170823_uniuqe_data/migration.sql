/*
  Warnings:

  - A unique constraint covering the columns `[user]` on the table `Otp` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Otp_user_key" ON "Otp"("user");
