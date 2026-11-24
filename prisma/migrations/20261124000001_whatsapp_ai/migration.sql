-- Aditiva: WhatsApp com IA (contatos, mensagens, campanhas)
-- CreateEnum
CREATE TYPE "WaCategory" AS ENUM ('nao_classificado', 'cliente', 'lead', 'pessoal', 'revisar');

-- CreateTable
CREATE TABLE "wa_contacts" (
    "id" TEXT NOT NULL,
    "wa_id" TEXT NOT NULL,
    "name" TEXT,
    "category" "WaCategory" NOT NULL DEFAULT 'nao_classificado',
    "category_by_admin" BOOLEAN NOT NULL DEFAULT false,
    "summary" TEXT,
    "interest" TEXT,
    "client_id" TEXT,
    "ai_paused" BOOLEAN NOT NULL DEFAULT false,
    "human_until" TIMESTAMP(3),
    "opted_out_at" TIMESTAMP(3),
    "last_inbound_at" TIMESTAMP(3),
    "last_outbound_at" TIMESTAMP(3),
    "last_message_at" TIMESTAMP(3),
    "awaiting_reply" BOOLEAN NOT NULL DEFAULT false,
    "follow_up_count" INTEGER NOT NULL DEFAULT 0,
    "last_offer_at" TIMESTAMP(3),
    "needs_analysis" BOOLEAN NOT NULL DEFAULT true,
    "analyzed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wa_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wa_messages" (
    "id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "wa_message_id" TEXT,
    "direction" TEXT NOT NULL,
    "author" TEXT NOT NULL,
    "kind" TEXT,
    "type" TEXT NOT NULL DEFAULT 'text',
    "body" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "ai_reason" TEXT,
    "campaign_id" TEXT,
    "sent_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wa_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wa_campaigns" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "offer" TEXT NOT NULL,
    "categories" "WaCategory"[],
    "template_name" TEXT,
    "template_language" TEXT NOT NULL DEFAULT 'pt_BR',
    "template_body" TEXT,
    "status" TEXT NOT NULL DEFAULT 'rascunho',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wa_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wa_campaign_sends" (
    "id" TEXT NOT NULL,
    "campaign_id" TEXT NOT NULL,
    "contact_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "reason" TEXT,
    "message_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wa_campaign_sends_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "wa_contacts_wa_id_key" ON "wa_contacts"("wa_id");

-- CreateIndex
CREATE INDEX "wa_contacts_category_idx" ON "wa_contacts"("category");

-- CreateIndex
CREATE INDEX "wa_contacts_awaiting_reply_idx" ON "wa_contacts"("awaiting_reply");

-- CreateIndex
CREATE INDEX "wa_contacts_needs_analysis_idx" ON "wa_contacts"("needs_analysis");

-- CreateIndex
CREATE INDEX "wa_contacts_last_message_at_idx" ON "wa_contacts"("last_message_at");

-- CreateIndex
CREATE UNIQUE INDEX "wa_messages_wa_message_id_key" ON "wa_messages"("wa_message_id");

-- CreateIndex
CREATE INDEX "wa_messages_contact_id_sent_at_idx" ON "wa_messages"("contact_id", "sent_at");

-- CreateIndex
CREATE INDEX "wa_messages_author_sent_at_idx" ON "wa_messages"("author", "sent_at");

-- CreateIndex
CREATE UNIQUE INDEX "wa_campaign_sends_campaign_id_contact_id_key" ON "wa_campaign_sends"("campaign_id", "contact_id");

-- AddForeignKey
ALTER TABLE "wa_contacts" ADD CONSTRAINT "wa_contacts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wa_messages" ADD CONSTRAINT "wa_messages_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "wa_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wa_campaign_sends" ADD CONSTRAINT "wa_campaign_sends_campaign_id_fkey" FOREIGN KEY ("campaign_id") REFERENCES "wa_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wa_campaign_sends" ADD CONSTRAINT "wa_campaign_sends_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "wa_contacts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

