-- Migration: delete the oldest cassette and renumber the rest.
--
-- Removes "Cassete 1.0" (originally "Cassette Vol. 1") and all its songs, then
-- shifts the remaining cassette NAMES down by one (only the `name` column —
-- ids, dates and everything else stay put):
--     Cassete 2.0 -> Cassete 1.0
--     Cassete 3.0 -> Cassete 2.0
--     Cassete 4.0 -> Cassete 3.0
--
-- Notes:
--   - Songs are removed automatically via songs.cassette_id ON DELETE CASCADE.
--   - song_proposals.cassette_id references cassettes(id) with NO delete action,
--     so accepted proposals must be unlinked first or the DELETE is blocked. We
--     set them to NULL (the proposal record is kept, just detached).
--   - Matched by name, so verify the names below still match your data first.
--   - The DELETE is IRREVERSIBLE. Run once, in the Supabase SQL Editor.
--
-- If analytics tables (play/session events) have a FK to cassettes/songs with no
-- cascade, the DELETE will fail — the BEGIN/COMMIT wrapper rolls everything back
-- cleanly so nothing is half-applied.

BEGIN;

-- 1. Detach accepted proposals from the cassette being deleted.
UPDATE song_proposals
SET cassette_id = NULL
WHERE cassette_id = (SELECT id FROM cassettes WHERE name = 'Cassete 1.0');

-- 2. Delete the oldest cassette (its songs go via ON DELETE CASCADE).
DELETE FROM cassettes WHERE name = 'Cassete 1.0';

-- 3. Renumber the remaining names. Ascending order avoids any transient
--    collision if cassettes.name is unique.
UPDATE cassettes SET name = 'Cassete 1.0' WHERE name = 'Cassete 2.0';
UPDATE cassettes SET name = 'Cassete 2.0' WHERE name = 'Cassete 3.0';
UPDATE cassettes SET name = 'Cassete 3.0' WHERE name = 'Cassete 4.0';

-- 4. Verify before committing — expect Cassete 1.0 / 2.0 / 3.0, no Vol. 1.
SELECT name, active, start_date FROM cassettes ORDER BY start_date;

COMMIT;

-- REVERT (renames only — the deleted cassette and its songs cannot be restored):
-- UPDATE cassettes SET name = 'Cassete 4.0' WHERE name = 'Cassete 3.0';
-- UPDATE cassettes SET name = 'Cassete 3.0' WHERE name = 'Cassete 2.0';
-- UPDATE cassettes SET name = 'Cassete 2.0' WHERE name = 'Cassete 1.0';
