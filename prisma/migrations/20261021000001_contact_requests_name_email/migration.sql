-- Aditiva: o formulário de contato passa a pedir "Nome completo" + "E-mail".
-- Nome e sobrenome antigos são preservados (colunas legadas, agora opcionais).
ALTER TABLE "contact_requests" ADD COLUMN IF NOT EXISTS "name" TEXT NOT NULL DEFAULT '';
ALTER TABLE "contact_requests" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "contact_requests" ALTER COLUMN "first_name" DROP NOT NULL;
ALTER TABLE "contact_requests" ALTER COLUMN "last_name" DROP NOT NULL;
