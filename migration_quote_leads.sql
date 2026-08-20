-- Run this in the Supabase SQL Editor
CREATE TABLE IF NOT EXISTS quote_leads (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT        NOT NULL,
  email        TEXT        NOT NULL,
  project_type TEXT        NOT NULL,
  page_count   INTEGER,
  segment      TEXT        NOT NULL,
  has_admin    BOOLEAN     NOT NULL DEFAULT FALSE,
  has_logo     BOOLEAN     NOT NULL DEFAULT TRUE,
  has_domain   BOOLEAN     NOT NULL DEFAULT TRUE,
  total_value  DECIMAL(10,2) NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
