-- Migration: Concatenated cassette audio + per-song offsets.
-- Adds two optional columns to `cassettes` so the player can switch from
-- "N separate audio files + JS-driven track switching" (fragile when Chrome
-- freezes the tab on Android background) to "one continuous audio file +
-- offset-driven UI" (browser keeps playing continuously, no JS needed for
-- transitions between songs).
--
-- This is purely additive: existing cassettes without these columns set
-- continue to work in the current N-file mode. Migration is reversible.
--
-- Run in Supabase SQL Editor.
-- Reverts at the bottom of this file.

-- ============================================================
-- 1. Columns on `cassettes`
-- ============================================================
ALTER TABLE cassettes
  ADD COLUMN IF NOT EXISTS concat_audio_url TEXT,
  ADD COLUMN IF NOT EXISTS song_offsets JSONB;

-- `concat_audio_url`:  Public URL of the single concatenated MP3 (all songs
--                      glued together via ffmpeg) hosted in the `audio`
--                      Storage bucket at `cassettes/<cassette_id>.mp3`.
--                      NULL = this cassette is still in legacy N-file mode.
--
-- `song_offsets`:      JSONB array describing where each song lives inside
--                      the concatenated file. Shape:
--                        [
--                          { "song_id": "...", "start": 0,      "end": 183.42 },
--                          { "song_id": "...", "start": 183.42, "end": 367.18 },
--                          ...
--                        ]
--                      `start` and `end` are seconds (floats, two decimals).
--                      Order matches the side+position order used by the
--                      `songs` query — the script computes them during concat.

COMMENT ON COLUMN cassettes.concat_audio_url IS
  'Public URL of the concatenated cassette audio file. NULL = legacy mode (N individual song URLs).';
COMMENT ON COLUMN cassettes.song_offsets IS
  'JSONB array of {song_id, start, end} seconds into concat_audio_url. NULL when concat_audio_url is NULL.';

-- ============================================================
-- 2. Storage
-- ============================================================
-- No new bucket / no new policies. We reuse the existing `audio` bucket:
--   - Songs:                 audio/<existing path>
--   - Concatenated cassette: audio/cassettes/<cassette_id>.mp3
--
-- The current `audio_select` policy already allows anonymous read on the
-- whole bucket (the player loads songs anon), so the concat file is readable
-- with no extra rule.
--
-- The build script writes with the service_role key, which bypasses RLS, so
-- no extra insert policy is needed either.

-- ============================================================
-- REVERT (run if you need to roll this back)
-- ============================================================
-- ALTER TABLE cassettes DROP COLUMN IF EXISTS concat_audio_url;
-- ALTER TABLE cassettes DROP COLUMN IF EXISTS song_offsets;
-- (Storage objects under audio/cassettes/* can be deleted manually from the
--  Supabase dashboard — they are not referenced by any other table.)
