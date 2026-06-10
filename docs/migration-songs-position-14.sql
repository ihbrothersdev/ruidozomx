-- Migration: allow up to 14 songs per cassette side.
--
-- Cassette 3 has 14 songs on Lado A. A CHECK constraint `songs_position_range`
-- (added directly in Supabase, not in schema.sql) capped `position` at 1..13 and
-- rejected the 14th insert. Relax it to 1..14.
--
-- Drop + re-add is complete on its own: `songs_position_range` only constrains
-- the position range, so recreating it as 1..14 is the full desired behavior.
-- All existing rows are already within 1..14, so the new constraint validates.
--
-- Run in the Supabase SQL Editor.

ALTER TABLE songs DROP CONSTRAINT songs_position_range;
ALTER TABLE songs ADD CONSTRAINT songs_position_range CHECK (position >= 1 AND position <= 14);

-- REVERT:
-- ALTER TABLE songs DROP CONSTRAINT songs_position_range;
-- ALTER TABLE songs ADD CONSTRAINT songs_position_range CHECK (position >= 1 AND position <= 13);
