-- Aditiva: módulo de prospecção por e-mail (prospects, 5 e-mails por prospect, linha do tempo)
-- e motivo na lista de supressão global (email_opt_outs).

DO $$ BEGIN
  CREATE TYPE "ProspectStatus" AS ENUM ('rascunho', 'ativo', 'pausado', 'interessado', 'respondeu', 'descadastrado', 'invalido', 'finalizado');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ProspectEmailStatus" AS ENUM ('rascunho', 'agendado', 'enviando', 'enviado', 'cancelado', 'falhou');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE "email_opt_outs" ADD COLUMN IF NOT EXISTS "reason" TEXT;

CREATE TABLE IF NOT EXISTS "prospects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "business" TEXT NOT NULL,
    "segment" TEXT,
    "site" TEXT,
    "score" DOUBLE PRECISION,
    "status" "ProspectStatus" NOT NULL DEFAULT 'rascunho',
    "stop_reason" TEXT,
    "unsubscribe_token" TEXT NOT NULL,
    "activated_at" TIMESTAMP(3),
    "stopped_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "prospects_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "prospect_emails" (
    "id" TEXT NOT NULL,
    "prospect_id" TEXT NOT NULL,
    "step" INTEGER NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "ProspectEmailStatus" NOT NULL DEFAULT 'rascunho',
    "scheduled_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "resend_id" TEXT,
    "delivered_at" TIMESTAMP(3),
    "opened_at" TIMESTAMP(3),
    "clicked_at" TIMESTAMP(3),
    "bounced_at" TIMESTAMP(3),
    "complained_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "prospect_emails_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "prospect_events" (
    "id" TEXT NOT NULL,
    "prospect_id" TEXT NOT NULL,
    "email_id" TEXT,
    "type" TEXT NOT NULL,
    "detail" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "prospect_events_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "prospects_email_key" ON "prospects"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "prospects_unsubscribe_token_key" ON "prospects"("unsubscribe_token");
CREATE INDEX IF NOT EXISTS "prospects_status_idx" ON "prospects"("status");
CREATE UNIQUE INDEX IF NOT EXISTS "prospect_emails_resend_id_key" ON "prospect_emails"("resend_id");
CREATE INDEX IF NOT EXISTS "prospect_emails_status_scheduled_at_idx" ON "prospect_emails"("status", "scheduled_at");
CREATE UNIQUE INDEX IF NOT EXISTS "prospect_emails_prospect_id_step_key" ON "prospect_emails"("prospect_id", "step");
CREATE INDEX IF NOT EXISTS "prospect_events_prospect_id_created_at_idx" ON "prospect_events"("prospect_id", "created_at");

DO $$ BEGIN
  ALTER TABLE "prospect_emails" ADD CONSTRAINT "prospect_emails_prospect_id_fkey"
    FOREIGN KEY ("prospect_id") REFERENCES "prospects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "prospect_events" ADD CONSTRAINT "prospect_events_prospect_id_fkey"
    FOREIGN KEY ("prospect_id") REFERENCES "prospects"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
