ALTER TABLE presentation_proposals ADD COLUMN IF NOT EXISTS mode TEXT NOT NULL DEFAULT 'apresentacao';
ALTER TABLE presentation_proposals ADD COLUMN IF NOT EXISTS linked_proposal_id UUID UNIQUE;
ALTER TABLE presentation_proposals ADD COLUMN IF NOT EXISTS original_price DECIMAL(10,2);
ALTER TABLE presentation_proposals ADD COLUMN IF NOT EXISTS countdown_minutes INTEGER NOT NULL DEFAULT 60;
