-- Migration: Allow public read of song proposals (excluding rejected) (temporary)
-- Run in Supabase SQL Editor
-- Owner & admin policies are unchanged (they keep seeing all statuses, including rejected).
-- Reverts: DROP POLICY "proposals_select_public_active" ON song_proposals;

CREATE POLICY "proposals_select_public_active"
  ON song_proposals FOR SELECT
  USING (status IN ('pending', 'in_review', 'selected'));
