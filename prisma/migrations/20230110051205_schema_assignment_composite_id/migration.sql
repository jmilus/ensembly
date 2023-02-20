/*
  Warnings:

  - You are about to alter the column `name` on the `Schema` table. The data in that column could be lost. The data in that column will be cast from `Text` to `VarChar(64)`.
  - The primary key for the `SchemaAssignment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `SchemaAssignment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Schema" ALTER COLUMN "name" SET DATA TYPE VARCHAR(64);

-- AlterTable
ALTER TABLE "SchemaAssignment" DROP CONSTRAINT "SchemaAssignment_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "SchemaAssignment_pkey" PRIMARY KEY ("membershipId", "schemaId", "divisionId");
