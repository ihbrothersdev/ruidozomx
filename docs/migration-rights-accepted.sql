-- Migration: Add rights_accepted column to song_proposals
-- Run in Supabase SQL Editor
-- Audit trail for the "soy titular de los derechos" confirmation that bandas accept when proposing their own songs.
-- Nullable: bandas that accept set it to true; other roles (venue, fan, etc.) don't see the checkbox and store null.
-- Reverts: ALTER TABLE song_proposals DROP COLUMN rights_accepted;

ALTER TABLE song_proposals
  ADD COLUMN rights_accepted BOOLEAN;
