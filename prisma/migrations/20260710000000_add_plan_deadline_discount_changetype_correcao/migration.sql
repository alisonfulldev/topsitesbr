-- Add changeDeadlineDays and discountPercent columns to plans
ALTER TABLE "plans" ADD COLUMN "change_deadline_days" INTEGER NOT NULL DEFAULT 7;
ALTER TABLE "plans" ADD COLUMN "discount_percent" INTEGER NOT NULL DEFAULT 0;

-- Backfill correct values for existing plans
UPDATE "plans" SET "change_deadline_days" = 15, "discount_percent" = 0  WHERE "name" = 'Básico';
UPDATE "plans" SET "change_deadline_days" = 7,  "discount_percent" = 10 WHERE "name" = 'Plus';
UPDATE "plans" SET "change_deadline_days" = 3,  "discount_percent" = 20 WHERE "name" = 'Pro';

-- Add correcao value to ChangeType enum
ALTER TYPE "ChangeType" ADD VALUE 'correcao';
