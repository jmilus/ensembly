/*
  Warnings:

  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_memberId_fkey";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "userEmail" VARCHAR(96) NOT NULL,
    "permissionsId" TEXT NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permissions" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "security" JSONB NOT NULL,

    CONSTRAINT "Permissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Permissions_name_key" ON "Permissions"("name");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_permissionsId_fkey" FOREIGN KEY ("permissionsId") REFERENCES "Permissions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
