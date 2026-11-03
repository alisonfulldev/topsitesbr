-- Aditiva: plano mensal sem taxa de criação (valor por cliente, Pix Automático, fidelidade)
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "monthly_price" DECIMAL(10,2);

ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "custom_price" DECIMAL(10,2);
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "pix_automatic_authorization_id" TEXT;
ALTER TABLE "subscriptions" ADD COLUMN IF NOT EXISTS "fidelity_ends_at" TIMESTAMP(3);

CREATE TABLE IF NOT EXISTS "contract_acceptances" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "accepted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "user_agent" TEXT,
    CONSTRAINT "contract_acceptances_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "contract_acceptances_client_id_idx" ON "contract_acceptances"("client_id");

DO $$ BEGIN
  ALTER TABLE "contract_acceptances" ADD CONSTRAINT "contract_acceptances_client_id_fkey"
    FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
