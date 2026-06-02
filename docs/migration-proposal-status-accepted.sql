-- Migration: proposal_status  'selected' → 'accepted'
--
-- The band-facing UI (app/perfil) only knows pending/accepted/rejected, but the
-- admin accept flow wrote 'selected' — which the UI can't render (crashes the
-- proposals module). This aligns the DB vocabulary on 'accepted' and removes
-- 'selected' entirely. 'in_review' is kept (still referenced by the admin UI).
--
-- Safe: 0 rows currently use 'selected' (all 79 proposals are 'pending'), and
-- `proposal_status` is used only by song_proposals.status. The dependent index
-- idx_proposals_status is rebuilt automatically by the column TYPE change.
--
-- Run in the Supabase SQL Editor.
--
-- NOTE: the RLS policy `proposals_select_public_active` (added in Supabase, not
-- in schema.sql) filters on `status` and references 'selected', so it blocks the
-- column type change. We drop it, migrate the type, and recreate it with
-- 'accepted'. Its original definition (from pg_policies) was:
--   FOR SELECT USING (status = ANY (ARRAY['pending','in_review','selected']::proposal_status[]))

BEGIN;

DROP POLICY IF EXISTS proposals_select_public_active ON song_proposals;

ALTER TYPE proposal_status RENAME TO proposal_status_old;

CREATE TYPE proposal_status AS ENUM ('pending', 'in_review', 'accepted', 'rejected');

ALTER TABLE song_proposals
  ALTER COLUMN status DROP DEFAULT,
  ALTER COLUMN status TYPE proposal_status
    USING (CASE status::text WHEN 'selected' THEN 'accepted' ELSE status::text END::proposal_status),
  ALTER COLUMN status SET DEFAULT 'pending';

DROP TYPE proposal_status_old;

-- Recreate the public-read policy (selected → accepted).
CREATE POLICY proposals_select_public_active ON song_proposals
  FOR SELECT
  USING (status = ANY (ARRAY['pending'::proposal_status, 'in_review'::proposal_status, 'accepted'::proposal_status]));

COMMIT;

-- REVERT (if ever needed):
-- BEGIN;
-- DROP POLICY IF EXISTS proposals_select_public_active ON song_proposals;
-- ALTER TYPE proposal_status RENAME TO proposal_status_old;
-- CREATE TYPE proposal_status AS ENUM ('pending', 'in_review', 'selected', 'rejected');
-- ALTER TABLE song_proposals
--   ALTER COLUMN status DROP DEFAULT,
--   ALTER COLUMN status TYPE proposal_status
--     USING (CASE status::text WHEN 'accepted' THEN 'selected' ELSE status::text END::proposal_status),
--   ALTER COLUMN status SET DEFAULT 'pending';
-- DROP TYPE proposal_status_old;
-- CREATE POLICY proposals_select_public_active ON song_proposals
--   FOR SELECT
--   USING (status = ANY (ARRAY['pending'::proposal_status, 'in_review'::proposal_status, 'selected'::proposal_status]));
-- COMMIT;
