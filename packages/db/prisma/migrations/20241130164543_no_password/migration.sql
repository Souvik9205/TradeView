/*
  Warnings:

  - You are about to drop the column `password` on the `Otp` table. All the data in the column will be lost.
  - You are about to drop the column `password` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Otp" DROP COLUMN "password";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "password";
