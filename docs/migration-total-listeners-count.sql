-- Migration: exact, stable count of distinct people who started a cassette session.
-- Run in Supabase SQL Editor.
--
-- getTotalListeners() used to `.select('user_id, session_id')` and count distinct
-- identities in JS. PostgREST caps responses at 1000 rows by default, and without
-- an ORDER BY the truncated window is non-deterministic, so once song_events holds
-- more than 1000 cassette_session_start rows the home counter drifts (586 -> 585 ->
-- 586...) and understates the real total. This RPC counts in Postgres over the
-- whole table instead, matching the same identity rule (user_id, else session_id).

BEGIN;

CREATE OR REPLACE FUNCTION public.total_listeners()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT count(DISTINCT coalesce(user_id::text, session_id))::int
    FROM public.song_events
   WHERE type = 'cassette_session_start';
$function$;

COMMIT;

-- REVERT:
-- DROP FUNCTION IF EXISTS public.total_listeners();
