/*
  Warnings:

  - A unique constraint covering the columns `[startTime,roomId,movieId]` on the table `schedules` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "schedules_startTime_roomId_movieId_key" ON "public"."schedules"("startTime", "roomId", "movieId");
