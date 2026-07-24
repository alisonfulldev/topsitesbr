-- AddColumn: terms acceptance on Client
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "terms_accepted_at" TIMESTAMP(3);
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "terms_version" TEXT;

-- AddColumn: overdue tracking on Invoice
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "overdue_day0_sent_at" TIMESTAMP(3);
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "overdue_day5_sent_at" TIMESTAMP(3);
ALTER TABLE "invoices" ADD COLUMN IF NOT EXISTS "overdue_day10_sent_at" TIMESTAMP(3);
