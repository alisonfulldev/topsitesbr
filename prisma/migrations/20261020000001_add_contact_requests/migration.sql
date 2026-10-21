-- Aditiva: cria a tabela dos pedidos do formulário de contato da home.
CREATE TABLE IF NOT EXISTS "contact_requests" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "site_type" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "contact_requests_created_at_idx" ON "contact_requests"("created_at");
