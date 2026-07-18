-- AlterTable: RG deixa de ser obrigatório
ALTER TABLE "Person" ALTER COLUMN "idNumber" SET DEFAULT '';

-- AlterTable: nova pergunta "Como ficou sabendo da feira de saúde?"
ALTER TABLE "Person" ADD COLUMN "howHeard" TEXT NOT NULL DEFAULT '';

-- CreateTable: serviços gerenciáveis por grupo
CREATE TABLE "Service" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Service_groupId_name_key" ON "Service"("groupId", "name");
