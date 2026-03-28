-- Migration: Add admin role + RLS for song proposals
-- Run in Supabase SQL Editor

-- 1. Add admin to profile_role enum
ALTER TYPE profile_role ADD VALUE 'admin';

-- 2. Set admin users
UPDATE profiles SET role = 'admin'
WHERE id IN (
  SELECT id FROM auth.users
  WHERE email IN ('donadiexx@yahoo.com.mx', 'archundiah11@gmail.com', 'ivann.mgz@gmail.com')
);

-- 3. RLS: admins can read all song_proposals (users can read their own)
CREATE POLICY "admin_read_proposals" ON song_proposals
  FOR SELECT USING (
    auth.uid() = user_id
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 4. RLS: admins can update any song_proposal
CREATE POLICY "admin_update_proposals" ON song_proposals
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 5. RLS: admins can insert songs (for accepting proposals)
CREATE POLICY "admin_insert_songs" ON songs
  FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- 6. RLS: everyone can read songs (they're public on the player)
CREATE POLICY "public_read_songs" ON songs
  FOR SELECT USING (true);
