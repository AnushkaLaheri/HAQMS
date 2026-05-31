/*
  Warnings:

  - A unique constraint covering the columns `[doctorId,tokenNumber,checkinDate]` on the table `QueueToken` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "QueueToken" ADD COLUMN     "checkinDate" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Patient_phoneNumber_idx" ON "Patient"("phoneNumber");

-- CreateIndex
CREATE UNIQUE INDEX "QueueToken_doctorId_tokenNumber_checkinDate_key" ON "QueueToken"("doctorId", "tokenNumber", "checkinDate");
