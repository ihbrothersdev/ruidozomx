-- Migration: Allow sender to delete their own interest ("Retirar conexión")
-- Run in Supabase SQL Editor
-- Reverts: DROP POLICY "interests_delete_sender" ON interests;

CREATE POLICY "interests_delete_sender"
  ON interests FOR DELETE
  USING (auth.uid() = from_profile_id);
