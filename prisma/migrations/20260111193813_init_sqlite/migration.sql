-- CreateTable
CREATE TABLE "bettors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "profileUrl" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "bets" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bettorId" TEXT NOT NULL,
    "placedAt" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "sport" TEXT,
    "oddsAmerican" INTEGER NOT NULL,
    "stakeUnits" REAL NOT NULL,
    "result" TEXT NOT NULL DEFAULT 'PENDING',
    "profitUnits" REAL NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "bets_bettorId_fkey" FOREIGN KEY ("bettorId") REFERENCES "bettors" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
