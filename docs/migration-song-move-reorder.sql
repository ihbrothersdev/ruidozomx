-- Migration: enable drag-and-drop reordering of songs within a cassette.
--
-- The admin cassette page now lets you drag a song to any slot, on the same
-- side or the other one. Dropping on an occupied slot swaps the two songs;
-- dropping on an empty slot just moves it.
--
-- Two pieces:
--   1. Make the (cassette_id, side, position) unique constraint DEFERRABLE so a
--      single multi-row UPDATE can swap two songs' slots — the constraint is
--      then checked at statement end instead of per-row, so the transient
--      overlap mid-swap is allowed. Single-row inserts still fail fast with
--      23505 (INITIALLY IMMEDIATE), so the existing "slot ocupado" handling in
--      acceptProposal / validateNewSongSlot is unchanged.
--   2. move_song(): atomic swap/move RPC called from the moveSong server action.
--
-- Note: reordering desyncs the concatenated player audio (song_offsets is stored
-- in side/position order). The publish gate (isCassetteConcatReady) detects the
-- stale order and blocks publishing until `npm run build-cassette <id>` is rerun.

BEGIN;

ALTER TABLE public.songs DROP CONSTRAINT songs_unique_slot;
ALTER TABLE public.songs
  ADD CONSTRAINT songs_unique_slot UNIQUE (cassette_id, side, position)
  DEFERRABLE INITIALLY IMMEDIATE;

CREATE OR REPLACE FUNCTION public.move_song(
  p_song_id uuid,
  p_to_side text,
  p_to_position int
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_cassette uuid;
  v_from_side cassette_side;
  v_from_position int;
  v_to_side cassette_side;
  v_other uuid;
begin
  if p_to_side not in ('A', 'B') then
    raise exception 'invalid side: %', p_to_side;
  end if;
  v_to_side := p_to_side::cassette_side;

  if p_to_position < 1 or p_to_position > 14 then
    raise exception 'position out of range: %', p_to_position;
  end if;

  select cassette_id, side, position
    into v_cassette, v_from_side, v_from_position
    from public.songs
   where id = p_song_id
   for update;

  if v_cassette is null then
    raise exception 'song not found: %', p_song_id;
  end if;

  -- Dropped on its own slot: nothing to do.
  if v_from_side = v_to_side and v_from_position = p_to_position then
    return;
  end if;

  select id into v_other
    from public.songs
   where cassette_id = v_cassette and side = v_to_side and position = p_to_position
   for update;

  if v_other is null then
    -- Empty target: just move.
    update public.songs set side = v_to_side, position = p_to_position where id = p_song_id;
  else
    -- Occupied target: swap both rows in one statement. The deferrable unique
    -- constraint is checked once at statement end, so the transient overlap is fine.
    update public.songs as s
       set side = case when s.id = p_song_id then v_to_side else v_from_side end,
           position = case when s.id = p_song_id then p_to_position else v_from_position end
     where s.id in (p_song_id, v_other);
  end if;
end;
$function$;

COMMIT;

-- REVERT:
-- DROP FUNCTION IF EXISTS public.move_song(uuid, text, int);
-- ALTER TABLE public.songs DROP CONSTRAINT songs_unique_slot;
-- ALTER TABLE public.songs ADD CONSTRAINT songs_unique_slot UNIQUE (cassette_id, side, position);
