-- Update audio_url to point to Supabase Storage public URLs
-- Run in Supabase SQL Editor

UPDATE songs
SET audio_url = 'https://ccpjaihwrxgtpjxzotxn.supabase.co/storage/v1/object/public/songs/' || REPLACE(SUBSTRING(audio_url FROM '/songs/(.*)'), ' ', '%20')
WHERE audio_url LIKE '/songs/%';
