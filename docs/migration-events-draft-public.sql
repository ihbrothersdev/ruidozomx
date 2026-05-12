-- Migration: Allow public read of `draft` events (temporary)
-- Run in Supabase SQL Editor
-- Reverts: re-create the original policy with `status = 'published'` only.

DROP POLICY IF EXISTS "events_select_published" ON events;

CREATE POLICY "events_select_published"
  ON events FOR SELECT
  USING (status IN ('published', 'draft') OR auth.uid() = profile_id);


DROP POLICY "events_select_published" ON events;
CREATE POLICY "events_select_published"
  ON events FOR SELECT
  USING (status = 'published' OR auth.uid() = profile_id);