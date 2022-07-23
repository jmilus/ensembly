-- CreateEnum
CREATE TYPE "Role" AS ENUM ('Performer', 'Crew');

-- AlterTable
ALTER TABLE "EnsembleMembership" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'Performer',
ADD COLUMN     "sectionId" INTEGER;

-- CreateTable
CREATE TABLE "Section" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "roleType" "Role" NOT NULL DEFAULT 'Performer',
    "ensembleTypeId" INTEGER NOT NULL,

    CONSTRAINT "Section_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EnsembleMembership" ADD CONSTRAINT "EnsembleMembership_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "Section"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Section" ADD CONSTRAINT "Section_ensembleTypeId_fkey" FOREIGN KEY ("ensembleTypeId") REFERENCES "EnsembleType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
