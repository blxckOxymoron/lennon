/*
  Warnings:

  - You are about to drop the column `gameChannelId` on the `Guild` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Guild" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "guildId" TEXT NOT NULL,
    "language" TEXT NOT NULL DEFAULT 'en-US'
);
INSERT INTO "new_Guild" ("guildId", "id", "language") SELECT "guildId", "id", "language" FROM "Guild";
DROP TABLE "Guild";
ALTER TABLE "new_Guild" RENAME TO "Guild";
CREATE UNIQUE INDEX "Guild_guildId_key" ON "Guild"("guildId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
