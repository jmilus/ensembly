-- CreateEnum
CREATE TYPE "EyeColor" AS ENUM ('unspecified', 'brown', 'blue', 'green', 'hazel');

-- CreateEnum
CREATE TYPE "HairColor" AS ENUM ('unspecified', 'black', 'blonde', 'brown', 'red', 'gray', 'white', 'bald');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('unspecified', 'female', 'male');

-- CreateEnum
CREATE TYPE "Race" AS ENUM ('unspecified', 'Black', 'White', 'Hispanic', 'Asian', 'NativeAmerican');

-- CreateEnum
CREATE TYPE "MembershipStatus" AS ENUM ('Active', 'Suspended', 'Inactive');

-- CreateEnum
CREATE TYPE "EmailRank" AS ENUM ('Primary', 'Personal', 'Work', 'Secondary', 'Old');

-- CreateEnum
CREATE TYPE "AddressRank" AS ENUM ('Home', 'Work', 'Secondary', 'Temporary', 'Old');

-- CreateEnum
CREATE TYPE "PhoneRank" AS ENUM ('Home', 'Mobile', 'Work', 'Emergency', 'Secondary', 'Old');

-- CreateEnum
CREATE TYPE "Capacity" AS ENUM ('Performer', 'Crew', 'Staff');

-- CreateEnum
CREATE TYPE "Period" AS ENUM ('Week', 'Month');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('Present', 'Excused', 'Absent', 'Uncounted');

-- CreateTable
CREATE TABLE "EnsembleType" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "typeColor" JSONB,

    CONSTRAINT "EnsembleType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ensemble" (
    "id" TEXT NOT NULL,
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
    "suffix" VARCHAR(8),
    "aka" VARCHAR(204),
    "uniqueName" VARCHAR(204) NOT NULL,

    CONSTRAINT "Member_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MemberBio" (
    "id" TEXT NOT NULL,
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
CREATE TABLE "EnsembleMembership" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "ensembleId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "MembershipStatus",
    "statusDate" TIMESTAMP(3),
    "statusNote" VARCHAR(128),

    CONSTRAINT "EnsembleMembership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventModel" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "modStartDate" TIMESTAMPTZ(3) NOT NULL,
    "modEndDate" TIMESTAMPTZ(3) NOT NULL,
    "details" VARCHAR(1000),
    "typeId" INTEGER NOT NULL,
    "locationId" TEXT,
    "interval" SMALLINT,
    "period" "Period",
    "occurrence" JSONB,
    "recEndCount" SMALLINT,
    "recEndDate" TIMESTAMPTZ(3),

    CONSTRAINT "EventModel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "eventModelId" TEXT NOT NULL,
    "name" VARCHAR(64),
    "anchorDate" VARCHAR(10) NOT NULL,
    "startDate" TIMESTAMPTZ(3) NOT NULL,
    "endDate" TIMESTAMPTZ(3) NOT NULL,
    "exception" BOOLEAN NOT NULL DEFAULT false,
    "locationId" TEXT,
    "note" VARCHAR(1000),

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Schema" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ensembleId" TEXT NOT NULL,

    CONSTRAINT "Schema_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventSchemas" (
    "id" SERIAL NOT NULL,
    "eventId" TEXT NOT NULL,
    "schemaId" TEXT NOT NULL,

    CONSTRAINT "EventSchemas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchemaAssignment" (
    "id" SERIAL NOT NULL,
    "memberId" TEXT NOT NULL,
    "schemaId" TEXT NOT NULL,
    "capacity" "Capacity" NOT NULL,
    "divisionId" INTEGER NOT NULL,
    "title" VARCHAR(64) NOT NULL,

    CONSTRAINT "SchemaAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Division" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "alias" VARCHAR(64) NOT NULL,
    "capacity" "Capacity" NOT NULL,
    "ensembleTypeId" INTEGER,
    "parentId" INTEGER,

    CONSTRAINT "Division_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventProgram" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,

    CONSTRAINT "EventProgram_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Work" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "filepath" VARCHAR(64),

    CONSTRAINT "Work_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" SERIAL NOT NULL,
    "eventId" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'Uncounted',

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventType" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(64) NOT NULL,
    "color" JSONB,

    CONSTRAINT "EventType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventEnsemble" (
    "id" TEXT NOT NULL,
    "eventModelId" TEXT NOT NULL,
    "ensembleId" TEXT NOT NULL,

    CONSTRAINT "EventEnsemble_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PhotoSet" (
    "id" SERIAL NOT NULL,
    "memberId" TEXT NOT NULL,

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
    "street" VARCHAR(64),
    "street2" VARCHAR(64),
    "city" VARCHAR(32),
    "state" VARCHAR(2),
    "postalCode" VARCHAR(8),
    "country" VARCHAR(32),
    "poBox" VARCHAR(16),
    "rank" "AddressRank" NOT NULL DEFAULT 'Home',
    "memberId" TEXT,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Email" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(96) NOT NULL,
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

-- CreateTable
CREATE TABLE "Configuration" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "unitsystem" VARCHAR(3) NOT NULL,

    CONSTRAINT "Configuration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_EventProgramToWork" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "EnsembleType_name_key" ON "EnsembleType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Ensemble_name_key" ON "Ensemble"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Member_uniqueName_key" ON "Member"("uniqueName");

-- CreateIndex
CREATE UNIQUE INDEX "MemberBio_memberId_key" ON "MemberBio"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "EnsembleMembership_memberId_ensembleId_key" ON "EnsembleMembership"("memberId", "ensembleId");

-- CreateIndex
CREATE UNIQUE INDEX "EventModel_locationId_key" ON "EventModel"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "Event_locationId_key" ON "Event"("locationId");

-- CreateIndex
CREATE UNIQUE INDEX "Schema_name_key" ON "Schema"("name");

-- CreateIndex
CREATE UNIQUE INDEX "EventProgram_eventId_key" ON "EventProgram"("eventId");

-- CreateIndex
CREATE UNIQUE INDEX "PhotoSet_memberId_key" ON "PhotoSet"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "Photo_photoSetId_key" ON "Photo"("photoSetId");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneNumber_phonenumber_key" ON "PhoneNumber"("phonenumber");

-- CreateIndex
CREATE UNIQUE INDEX "PhoneNumber_memberId_key" ON "PhoneNumber"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "Email_email_key" ON "Email"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Email_memberId_key" ON "Email"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "User_login_key" ON "User"("login");

-- CreateIndex
CREATE UNIQUE INDEX "User_memberId_key" ON "User"("memberId");

-- CreateIndex
CREATE UNIQUE INDEX "_EventProgramToWork_AB_unique" ON "_EventProgramToWork"("A", "B");

-- CreateIndex
CREATE INDEX "_EventProgramToWork_B_index" ON "_EventProgramToWork"("B");

-- AddForeignKey
ALTER TABLE "Ensemble" ADD CONSTRAINT "Ensemble_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "EnsembleType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MemberBio" ADD CONSTRAINT "MemberBio_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnsembleMembership" ADD CONSTRAINT "EnsembleMembership_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EnsembleMembership" ADD CONSTRAINT "EnsembleMembership_ensembleId_fkey" FOREIGN KEY ("ensembleId") REFERENCES "Ensemble"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventModel" ADD CONSTRAINT "EventModel_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "EventType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventModel" ADD CONSTRAINT "EventModel_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_eventModelId_fkey" FOREIGN KEY ("eventModelId") REFERENCES "EventModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "Address"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Schema" ADD CONSTRAINT "Schema_ensembleId_fkey" FOREIGN KEY ("ensembleId") REFERENCES "Ensemble"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSchemas" ADD CONSTRAINT "EventSchemas_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventSchemas" ADD CONSTRAINT "EventSchemas_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "Schema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemaAssignment" ADD CONSTRAINT "SchemaAssignment_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemaAssignment" ADD CONSTRAINT "SchemaAssignment_schemaId_fkey" FOREIGN KEY ("schemaId") REFERENCES "Schema"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchemaAssignment" ADD CONSTRAINT "SchemaAssignment_divisionId_fkey" FOREIGN KEY ("divisionId") REFERENCES "Division"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Division" ADD CONSTRAINT "Division_ensembleTypeId_fkey" FOREIGN KEY ("ensembleTypeId") REFERENCES "EnsembleType"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Division" ADD CONSTRAINT "Division_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Division"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventProgram" ADD CONSTRAINT "EventProgram_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventEnsemble" ADD CONSTRAINT "EventEnsemble_eventModelId_fkey" FOREIGN KEY ("eventModelId") REFERENCES "EventModel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventEnsemble" ADD CONSTRAINT "EventEnsemble_ensembleId_fkey" FOREIGN KEY ("ensembleId") REFERENCES "Ensemble"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhotoSet" ADD CONSTRAINT "PhotoSet_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Photo" ADD CONSTRAINT "Photo_photoSetId_fkey" FOREIGN KEY ("photoSetId") REFERENCES "PhotoSet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PhoneNumber" ADD CONSTRAINT "PhoneNumber_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Email" ADD CONSTRAINT "Email_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventProgramToWork" ADD CONSTRAINT "_EventProgramToWork_A_fkey" FOREIGN KEY ("A") REFERENCES "EventProgram"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_EventProgramToWork" ADD CONSTRAINT "_EventProgramToWork_B_fkey" FOREIGN KEY ("B") REFERENCES "Work"("id") ON DELETE CASCADE ON UPDATE CASCADE;
