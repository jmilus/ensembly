-- CreateEnum
CREATE TYPE "EyeColor" AS ENUM ('unspecified', 'brown', 'blue', 'green', 'hazel');

-- CreateEnum
CREATE TYPE "HairColor" AS ENUM ('unspecified', 'black', 'blonde', 'brown', 'red', 'gray', 'white', 'bald');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('unspecified', 'female', 'male');

-- CreateEnum
CREATE TYPE "Race" AS ENUM ('unspecified', 'Black', 'White', 'Hispanic', 'Asian', 'NativeAmerican');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('Active', 'Suspended', 'Inactive');

-- CreateEnum
CREATE TYPE "EmailRank" AS ENUM ('Primary', 'Personal', 'Work', 'Secondary', 'Old');

-- CreateEnum
CREATE TYPE "AddressRank" AS ENUM ('Home', 'Work', 'Secondary', 'Temporary', 'Old');

-- CreateEnum
CREATE TYPE "PhoneRank" AS ENUM ('Home', 'Mobile', 'Work', 'Emergency', 'Secondary', 'Old');

-- CreateTable
CREATE TABLE "EnsembleType" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(64) NOT NULL,

    CONSTRAINT "EnsembleType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ensemble" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "typeId" INTEGER NOT NULL,

    CONSTRAINT "Ensemble_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL,
    "created" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstName" VARCHAR(64) NOT NULL,
    "middleName" VARCHAR(64),
    "lastName" VARCHAR(64) NOT NULL,
    "name" VARCHAR(128),

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EnsembleMembership" (
    "memberId" TEXT NOT NULL,
    "ensembleId" INTEGER NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "status" "Status" NOT NULL,

    CONSTRAINT "EnsembleMembership_pkey" PRIMARY KEY ("memberId","ensembleId")
);

-- CreateTable
CREATE TABLE "MemberBio" (
    "id" SERIAL NOT NULL,
    "birthday" DATE,
    "sex" "Sex" DEFAULT 'unspecified',
    "height" SMALLINT,
    "weight" SMALLINT,
    "race" "Race" DEFAULT 'unspecified',
    "ethnicity" VARCHAR(64),
    "hair" "HairColor" DEFAULT 'unspecified',
    "eyes" "EyeColor" DEFAULT 'unspecified',
    "memberId" TEXT NOT NULL,

    CONSTRAINT "MemberBio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhotoSet" (
    "id" SERIAL NOT NULL,
    "memberId" INTEGER NOT NULL,

    CONSTRAINT "PhotoSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Photo" (
    "id" SERIAL NOT NULL,
    "image" BYTEA NOT NULL,
    "photoSetId" INTEGER NOT NULL,

    CONSTRAINT "Photo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhoneNumber" (
    "id" TEXT NOT NULL,
    "prefix" VARCHAR(4),
    "phonenumber" VARCHAR(12) NOT NULL,
    "rank" "PhoneRank" NOT NULL DEFAULT 'Home',
    "memberId" TEXT NOT NULL,

    CONSTRAINT "PhoneNumber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" TEXT NOT NULL,
    "street" VARCHAR(64) NOT NULL,
    "street2" VARCHAR(64),
    "city" VARCHAR(32) NOT NULL,
    "state" VARCHAR(2) NOT NULL,
    "postalCode" VARCHAR(8) NOT NULL,
    "country" VARCHAR(32),
    "poBox" VARCHAR(16),
    "rank" "AddressRank" NOT NULL DEFAULT 'Home',
    "memberId" TEXT NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Email" (
    "id" TEXT NOT NULL,
    "address" VARCHAR(96) NOT NULL,
    "rank" "EmailRank" NOT NULL DEFAULT 'Primary',
    "memberId" TEXT NOT NULL,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "login" VARCHAR(32) NOT NULL,
    "password" VARCHAR(256) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "memberId" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MemberBio_memberId_key" ON "MemberBio"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "PhotoSet_memberId_key" ON "PhotoSet"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "Photo_photoSetId_key" ON "Photo"("photoSetId");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneNumber_phonenumber_key" ON "PhoneNumber"("phonenumber");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneNumber_memberId_key" ON "PhoneNumber"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "Address_memberId_key" ON "Address"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "Email_address_key" ON "Email"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Email_memberId_key" ON "Email"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- CreateIndex
CREATE UNIQUE INDEX "User_memberId_key" ON "User"("memberId");

-- AddForeignKey
ALTER TABLE "Ensemble" ADD CONSTRAINT "Ensemble_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "EnsembleType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnsembleMembership" ADD CONSTRAINT "EnsembleMembership_ensembleId_fkey" FOREIGN KEY ("ensembleId") REFERENCES "Ensemble"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnsembleMembership" ADD CONSTRAINT "EnsembleMembership_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberBio" ADD CONSTRAINT "MemberBio_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoSet" ADD CONSTRAINT "PhotoSet_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "MemberBio"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_photoSetId_fkey" FOREIGN KEY ("photoSetId") REFERENCES "PhotoSet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneNumber" ADD CONSTRAINT "PhoneNumber_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
