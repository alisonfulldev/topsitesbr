-- CreateTable
CREATE TABLE "allocation_fixed_costs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "allocation_fixed_costs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "allocation_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "percent" DECIMAL(5,2) NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#6b7280',
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "allocation_rules_pkey" PRIMARY KEY ("id")
);

-- Seed com os custos fixos do usuário
INSERT INTO "allocation_fixed_costs" ("id","name","amount","order") VALUES
  (gen_random_uuid(), 'Tráfego Pago', 600.00, 1),
  (gen_random_uuid(), 'Claude Code', 110.00, 2),
  (gen_random_uuid(), 'Outros (a nomear)', 35.00, 3),
  (gen_random_uuid(), 'Instagram Verificado', 53.00, 4);

-- Seed com as regras de distribuição
INSERT INTO "allocation_rules" ("id","name","percent","color","order") VALUES
  (gen_random_uuid(), 'Reinvestimento em Tráfego', 10.00, '#3b82f6', 1),
  (gen_random_uuid(), 'Caixa', 50.00, '#10b981', 2);
