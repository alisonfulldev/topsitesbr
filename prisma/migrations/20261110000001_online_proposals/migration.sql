-- Aditiva: propostas online (prospect → prévia → aprovação → contrato → pagamento)
CREATE TABLE IF NOT EXISTS "online_proposals" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "document" TEXT,
    "email" TEXT NOT NULL,
    "whatsapp" TEXT,
    "plan_key" TEXT NOT NULL,
    "plan_name" TEXT NOT NULL,
    "setup_price" DECIMAL(10,2) NOT NULL,
    "monthly_price" DECIMAL(10,2) NOT NULL,
    "extras" JSONB NOT NULL DEFAULT '[]',
    "selected_extras" JSONB NOT NULL DEFAULT '[]',
    "preview_url" TEXT,
    "preview_html" TEXT,
    "max_revisions" INTEGER NOT NULL DEFAULT 2,
    "revisions_used" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'prospect',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "preview_sent_at" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "signed_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "client_id" TEXT,
    "contract_version" TEXT,
    "contract_content" TEXT,
    "contract_hash" TEXT,
    "signer_name" TEXT,
    "signer_document" TEXT,
    "signer_ip" TEXT,
    "signer_user_agent" TEXT,
    "setup_charge_id" TEXT,
    "setup_payment_url" TEXT,
    "setup_payment_method" TEXT,
    "unsubscribed_at" TIMESTAMP(3),
    "sequence_paused" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "online_proposals_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "online_proposals_token_key" ON "online_proposals"("token");
CREATE INDEX IF NOT EXISTS "online_proposals_status_idx" ON "online_proposals"("status");

CREATE TABLE IF NOT EXISTS "online_proposal_events" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "detail" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "online_proposal_events_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "online_proposal_events_proposal_id_idx" ON "online_proposal_events"("proposal_id");

DO $$ BEGIN
  ALTER TABLE "online_proposals" ADD CONSTRAINT "online_proposals_client_id_fkey"
    FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "online_proposal_events" ADD CONSTRAINT "online_proposal_events_proposal_id_fkey"
    FOREIGN KEY ("proposal_id") REFERENCES "online_proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "online_proposal_emails" (
    "id" TEXT NOT NULL,
    "proposal_id" TEXT NOT NULL,
    "round" INTEGER NOT NULL DEFAULT 1,
    "step" INTEGER NOT NULL,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'agendado',
    "subject" TEXT,
    "sent_at" TIMESTAMP(3),
    "opened_at" TIMESTAMP(3),
    "clicked_at" TIMESTAMP(3),
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "online_proposal_emails_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "online_proposal_emails_proposal_id_round_step_key" ON "online_proposal_emails"("proposal_id", "round", "step");
CREATE INDEX IF NOT EXISTS "online_proposal_emails_status_scheduled_at_idx" ON "online_proposal_emails"("status", "scheduled_at");
DO $$ BEGIN
  ALTER TABLE "online_proposal_emails" ADD CONSTRAINT "online_proposal_emails_proposal_id_fkey"
    FOREIGN KEY ("proposal_id") REFERENCES "online_proposals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
