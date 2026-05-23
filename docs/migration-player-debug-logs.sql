-- Migration: Player debug logs.
-- Diagnostic table to reconstruct what happens to the audio player when
-- Android freezes the tab in background. The current "no avanza a la
-- siguiente canción" bug needs evidence (which event fired last? was play()
-- rejected? did `ended` ever fire?) that we can't get from devtools because
-- the phone is locked while the bug reproduces.
--
-- Run in Supabase SQL Editor.
-- Reverts at the bottom of this file.

-- ============================================================
-- 1. Table
-- ============================================================
CREATE TABLE IF NOT EXISTS public.player_debug_logs (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  -- UUID generated client-side at hook mount; lets us replay a single
  -- session's timeline by filtering on this column.
  session_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  song_id TEXT,
  song_index INT,
  -- Snapshot of the HTMLAudioElement state at the moment of the event.
  audio_paused BOOLEAN,
  audio_ended BOOLEAN,
  audio_ready_state INT,
  audio_network_state INT,
  audio_current_time REAL,
  audio_duration REAL,
  visibility_state TEXT,
  user_agent TEXT,
  payload JSONB
);

-- Composite index for the common query: timeline of one session.
CREATE INDEX IF NOT EXISTS idx_player_debug_logs_session
  ON public.player_debug_logs (session_id, created_at);

-- ============================================================
-- 2. RLS — anon may INSERT, no one may SELECT (read via service_role)
-- ============================================================
ALTER TABLE public.player_debug_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anyone can insert player debug logs" ON public.player_debug_logs;
CREATE POLICY "anyone can insert player debug logs"
  ON public.player_debug_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- No SELECT policy on purpose: read from the Supabase dashboard / SQL editor
-- (service_role bypasses RLS). Keeps random visitors from scraping logs.

-- ============================================================
-- REVERT (run if you need to roll this back)
-- ============================================================
-- DROP POLICY IF EXISTS "anyone can insert player debug logs" ON public.player_debug_logs;
-- DROP INDEX IF EXISTS idx_player_debug_logs_session;
-- DROP TABLE IF EXISTS public.player_debug_logs;
