-- CreateEnum
CREATE TYPE "Stage" AS ENUM ('APLICADO', 'TRIAGEM', 'TESTE_TECNICO', 'DINAMICA', 'ENTREVISTA', 'OFERTA', 'REJEITADO', 'DESISTIU');

-- CreateEnum
CREATE TYPE "WorkMode" AS ENUM ('REMOTO', 'PRESENCIAL', 'HIBRIDO');

-- CreateTable
CREATE TABLE "company" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "site" TEXT,
    "sector" TEXT,
    "description" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "statusEvent" (
    "id" TEXT NOT NULL,
    "status" "Stage" NOT NULL,
    "note" TEXT,
    "applicationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "statusEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application" (
    "id" TEXT NOT NULL,
    "vancancy" TEXT NOT NULL,
    "stage" "Stage" NOT NULL DEFAULT 'APLICADO',
    "url" TEXT,
    "workMode" "WorkMode",
    "salary" TEXT,
    "notes" TEXT,
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "company_userId_idx" ON "company"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "company_userId_name_key" ON "company"("userId", "name");

-- CreateIndex
CREATE INDEX "statusEvent_applicationId_idx" ON "statusEvent"("applicationId");

-- CreateIndex
CREATE INDEX "application_userId_idx" ON "application"("userId");

-- CreateIndex
CREATE INDEX "application_userId_stage_idx" ON "application"("userId", "stage");

-- AddForeignKey
ALTER TABLE "company" ADD CONSTRAINT "company_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "statusEvent" ADD CONSTRAINT "statusEvent_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "application"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application" ADD CONSTRAINT "application_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
