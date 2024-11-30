/*
  Warnings:

  - Added the required column `password` to the `Otp` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Otp" ADD COLUMN     "password" TEXT NOT NULL;
