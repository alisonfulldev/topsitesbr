-- Add asaas_charge_id to invoices
ALTER TABLE "invoices" ADD COLUMN "asaas_charge_id" TEXT;

-- Create plan_change_history table
CREATE TABLE "plan_change_history" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "from_plan_id" TEXT NOT NULL,
    "to_plan_id" TEXT NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "was_manual_override" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "plan_change_history_pkey" PRIMARY KEY ("id")
);

-- Add foreign keys for plan_change_history
ALTER TABLE "plan_change_history" ADD CONSTRAINT "plan_change_history_client_id_fkey"
    FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "plan_change_history" ADD CONSTRAINT "plan_change_history_from_plan_id_fkey"
    FOREIGN KEY ("from_plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "plan_change_history" ADD CONSTRAINT "plan_change_history_to_plan_id_fkey"
    FOREIGN KEY ("to_plan_id") REFERENCES "plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
