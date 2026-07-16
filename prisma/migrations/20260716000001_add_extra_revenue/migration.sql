-- CreateEnum
CREATE TYPE "ExtraRevenueCategory" AS ENUM ('servico_avulso', 'consultoria', 'venda_site', 'outro');

-- CreateTable
CREATE TABLE "extra_revenues" (
    "id" TEXT NOT NULL,
    "category" "ExtraRevenueCategory" NOT NULL,
    "description" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "revenue_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "extra_revenues_pkey" PRIMARY KEY ("id")
);
