-- Migration: Denormalize "last activity" onto profiles + capture draft events / profile edits.
-- Run in Supabase SQL Editor.
-- Reverts at the bottom of this file.

-- ============================================================
-- 1. Column on profiles
-- ============================================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- Backfill from existing activity_feed (latest entry per profile),
-- falling back to profile.updated_at when there's no feed history.
UPDATE profiles p
SET last_activity_at = COALESCE(
  (SELECT MAX(created_at) FROM activity_feed af WHERE af.profile_id = p.id),
  p.updated_at,
  p.created_at,
  NOW()
);

-- ============================================================
-- 2. Composite index for per-profile activity_feed lookups
-- (Existing index is global by created_at; this one helps any future
--  per-profile feed queries.)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_activity_feed_per_profile
  ON activity_feed(profile_id, created_at DESC)
  WHERE visible = TRUE;

-- ============================================================
-- 3. Cross-table bump: AFTER triggers on related tables update
--    profiles.last_activity_at when the user does *anything*.
-- ============================================================
CREATE OR REPLACE FUNCTION bump_profile_last_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_id UUID;
BEGIN
  IF TG_TABLE_NAME = 'events' THEN
    v_id := COALESCE(NEW.profile_id, OLD.profile_id);
  ELSIF TG_TABLE_NAME = 'song_proposals' THEN
    v_id := COALESCE(NEW.user_id, OLD.user_id);
  ELSIF TG_TABLE_NAME = 'interests' THEN
    v_id := COALESCE(NEW.from_profile_id, OLD.from_profile_id);
  ELSIF TG_TABLE_NAME = 'user_proposals' THEN
    v_id := COALESCE(NEW.from_profile_id, OLD.from_profile_id);
  END IF;

  IF v_id IS NOT NULL THEN
    UPDATE profiles SET last_activity_at = NOW() WHERE id = v_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS events_bump_activity ON events;
CREATE TRIGGER events_bump_activity
  AFTER INSERT OR UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION bump_profile_last_activity();

DROP TRIGGER IF EXISTS song_proposals_bump_activity ON song_proposals;
CREATE TRIGGER song_proposals_bump_activity
  AFTER INSERT ON song_proposals
  FOR EACH ROW EXECUTE FUNCTION bump_profile_last_activity();

DROP TRIGGER IF EXISTS interests_bump_activity ON interests;
CREATE TRIGGER interests_bump_activity
  AFTER INSERT ON interests
  FOR EACH ROW EXECUTE FUNCTION bump_profile_last_activity();

DROP TRIGGER IF EXISTS user_proposals_bump_activity ON user_proposals;
CREATE TRIGGER user_proposals_bump_activity
  AFTER INSERT ON user_proposals
  FOR EACH ROW EXECUTE FUNCTION bump_profile_last_activity();

-- ============================================================
-- 4. Self bump: BEFORE UPDATE on profiles bumps last_activity_at
--    on any change. No recursion risk (BEFORE trigger mutates NEW).
-- ============================================================
CREATE OR REPLACE FUNCTION profiles_self_bump_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW IS DISTINCT FROM OLD THEN
    NEW.last_activity_at := NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_self_bump_activity ON profiles;
CREATE TRIGGER profiles_self_bump_activity
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION profiles_self_bump_activity();

-- ============================================================
-- 5. Extend log_activity: also emit event_published on status
--    transition (UPDATE), not just on direct INSERT-as-published.
-- ============================================================
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'profiles' AND TG_OP = 'INSERT' THEN
    INSERT INTO activity_feed (type, profile_id, profile_name, profile_role)
    VALUES ('registration', NEW.id, NEW.display_name, NEW.role);
  END IF;

  IF TG_TABLE_NAME = 'interests' AND TG_OP = 'INSERT' THEN
    INSERT INTO activity_feed (type, profile_id, profile_name, profile_role, metadata)
    SELECT 'interest', NEW.from_profile_id, p1.display_name, p1.role,
      jsonb_build_object('to_profile_id', NEW.to_profile_id, 'to_profile_name', p2.display_name)
    FROM profiles p1, profiles p2
    WHERE p1.id = NEW.from_profile_id AND p2.id = NEW.to_profile_id;
  END IF;

  IF TG_TABLE_NAME = 'song_proposals' AND TG_OP = 'INSERT' THEN
    INSERT INTO activity_feed (type, profile_id, profile_name, profile_role, metadata)
    SELECT 'proposal', NEW.user_id, p.display_name, p.role,
      jsonb_build_object('title', NEW.title, 'artist', NEW.artist)
    FROM profiles p WHERE p.id = NEW.user_id;
  END IF;

  IF TG_TABLE_NAME = 'user_proposals' AND TG_OP = 'INSERT' THEN
    INSERT INTO activity_feed (type, profile_id, profile_name, profile_role, metadata)
    SELECT 'user_proposal', NEW.from_profile_id, p.display_name, p.role,
      jsonb_build_object('to_profile_id', NEW.to_profile_id, 'type', NEW.type, 'subject', NEW.subject)
    FROM profiles p WHERE p.id = NEW.from_profile_id;
  END IF;

  IF TG_TABLE_NAME = 'events' AND TG_OP = 'INSERT' AND NEW.status = 'published' THEN
    INSERT INTO activity_feed (type, profile_id, profile_name, profile_role, metadata)
    SELECT 'event_published', NEW.profile_id, p.display_name, p.role,
      jsonb_build_object('title', NEW.title, 'event_date', NEW.event_date, 'city', NEW.city)
    FROM profiles p WHERE p.id = NEW.profile_id;
  END IF;

  IF TG_TABLE_NAME = 'events' AND TG_OP = 'UPDATE'
     AND OLD.status IS DISTINCT FROM NEW.status
     AND NEW.status = 'published' THEN
    INSERT INTO activity_feed (type, profile_id, profile_name, profile_role, metadata)
    SELECT 'event_published', NEW.profile_id, p.display_name, p.role,
      jsonb_build_object('title', NEW.title, 'event_date', NEW.event_date, 'city', NEW.city)
    FROM profiles p WHERE p.id = NEW.profile_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS events_activity_update ON events;
CREATE TRIGGER events_activity_update
  AFTER UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION log_activity();

-- ============================================================
-- REVERT (run if you need to roll this back)
-- ============================================================
-- DROP TRIGGER IF EXISTS events_bump_activity ON events;
-- DROP TRIGGER IF EXISTS song_proposals_bump_activity ON song_proposals;
-- DROP TRIGGER IF EXISTS interests_bump_activity ON interests;
-- DROP TRIGGER IF EXISTS user_proposals_bump_activity ON user_proposals;
-- DROP TRIGGER IF EXISTS profiles_self_bump_activity ON profiles;
-- DROP TRIGGER IF EXISTS events_activity_update ON events;
-- DROP FUNCTION IF EXISTS bump_profile_last_activity();
-- DROP FUNCTION IF EXISTS profiles_self_bump_activity();
-- DROP INDEX IF EXISTS idx_activity_feed_per_profile;
-- ALTER TABLE profiles DROP COLUMN IF EXISTS last_activity_at;
-- (also restore the original log_activity body without the events UPDATE branch)
