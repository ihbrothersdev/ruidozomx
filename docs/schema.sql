-- ============================================
-- RUIDOZO MX — Full Database Schema
-- Supabase (PostgreSQL)
-- ============================================

-- ============================================
-- ENUMS
-- ============================================

CREATE TYPE profile_role AS ENUM (
  'fan', 'banda', 'manager', 'agente', 'promotor', 'proveedor', 'venue'
);

CREATE TYPE proposal_status AS ENUM (
  'pending', 'in_review', 'selected', 'rejected'
);

CREATE TYPE cassette_side AS ENUM ('A', 'B');

CREATE TYPE activity_type AS ENUM (
  'registration', 'interest', 'proposal', 'song_selected', 'event_published'
);

CREATE TYPE event_status AS ENUM ('draft', 'published', 'cancelled');

-- ============================================
-- PROFILES (base)
-- ============================================

CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role profile_role NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  photo_url TEXT,
  phone VARCHAR(20),
  contact_email VARCHAR(255),
  country VARCHAR(100) DEFAULT 'México',
  state VARCHAR(100),
  city VARCHAR(100),
  bio TEXT,
  social_links JSONB DEFAULT '{}',
  registration_source TEXT NOT NULL DEFAULT 'registro',
  onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
  verified BOOLEAN NOT NULL DEFAULT FALSE,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_profiles_city ON profiles(city);

-- ============================================
-- ROLE-SPECIFIC DETAIL TABLES
-- ============================================

CREATE TABLE band_profiles (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  band_name VARCHAR(200) NOT NULL,
  project_type VARCHAR(50),
  genre VARCHAR(100),
  project_link TEXT,
  available_live BOOLEAN NOT NULL DEFAULT FALSE,
  open_collabs BOOLEAN NOT NULL DEFAULT FALSE,
  available_tours BOOLEAN NOT NULL DEFAULT FALSE,
  willing_travel BOOLEAN NOT NULL DEFAULT FALSE,
  review TEXT CHECK (char_length(review) <= 600),
  publish_dates BOOLEAN NOT NULL DEFAULT FALSE,
  accept_proposals BOOLEAN NOT NULL DEFAULT FALSE,
  contact TEXT
);

CREATE TABLE fan_profiles (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  alias VARCHAR(100) NOT NULL,
  favorite_genres TEXT[] NOT NULL DEFAULT '{}',
  notify_new_bands BOOLEAN NOT NULL DEFAULT FALSE,
  propose_fav_bands BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE manager_profiles (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  full_name VARCHAR(200) NOT NULL,
  web_link TEXT,
  role_type VARCHAR(20) NOT NULL DEFAULT 'manager',
  review TEXT CHECK (char_length(review) <= 600),
  represents_artists BOOLEAN NOT NULL DEFAULT FALSE,
  artists_represented TEXT,
  promote_bands_ruidozo BOOLEAN NOT NULL DEFAULT FALSE,
  seeks_emerging_talent BOOLEAN NOT NULL DEFAULT FALSE,
  accept_proposals BOOLEAN NOT NULL DEFAULT FALSE,
  contact TEXT
);

CREATE TABLE promoter_profiles (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  full_name VARCHAR(200) NOT NULL,
  web_link TEXT,
  role_type VARCHAR(20) NOT NULL DEFAULT 'promotor',
  review TEXT CHECK (char_length(review) <= 600),
  organizes_events BOOLEAN NOT NULL DEFAULT FALSE,
  territorial_reach TEXT[] NOT NULL DEFAULT '{}',
  event_types TEXT[] NOT NULL DEFAULT '{}',
  provide_events_ruidozo BOOLEAN NOT NULL DEFAULT FALSE,
  seeks_talent BOOLEAN NOT NULL DEFAULT FALSE,
  accept_proposals BOOLEAN NOT NULL DEFAULT FALSE,
  contact TEXT
);

CREATE TABLE agent_profiles (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  full_name VARCHAR(200) NOT NULL,
  web_link TEXT,
  role_type VARCHAR(20) NOT NULL DEFAULT 'agente',
  review TEXT CHECK (char_length(review) <= 600),
  represents_artists_live BOOLEAN NOT NULL DEFAULT FALSE,
  territorial_reach TEXT[] NOT NULL DEFAULT '{}',
  provide_events_ruidozo BOOLEAN NOT NULL DEFAULT FALSE,
  seeks_new_projects BOOLEAN NOT NULL DEFAULT FALSE,
  accept_proposals BOOLEAN NOT NULL DEFAULT FALSE,
  contact TEXT
);

CREATE TABLE provider_profiles (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  brand_name VARCHAR(200) NOT NULL,
  web_link TEXT,
  description TEXT CHECK (char_length(description) <= 600),
  territorial_reach TEXT[] NOT NULL DEFAULT '{}',
  service_types TEXT[] NOT NULL DEFAULT '{}',
  publish_services BOOLEAN NOT NULL DEFAULT FALSE,
  accept_proposals BOOLEAN NOT NULL DEFAULT FALSE,
  contact TEXT,
  works_emerging_projects BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE venue_profiles (
  profile_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  venue_name VARCHAR(200) NOT NULL,
  web_link TEXT,
  description TEXT CHECK (char_length(description) <= 600),
  capacity VARCHAR(20),
  venue_type TEXT[] NOT NULL DEFAULT '{}',
  has_audio BOOLEAN NOT NULL DEFAULT FALSE,
  has_lighting BOOLEAN NOT NULL DEFAULT FALSE,
  accepts_indie_proposals BOOLEAN NOT NULL DEFAULT FALSE,
  publish_calls_ruidozo BOOLEAN NOT NULL DEFAULT FALSE,
  contact TEXT
);

-- ============================================
-- CASSETTES
-- ============================================

CREATE TABLE cassettes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_minutes INTEGER DEFAULT 90,
  curator_id UUID REFERENCES profiles(id),
  curator_name VARCHAR(100),
  cover_image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT FALSE,
  archived BOOLEAN NOT NULL DEFAULT FALSE,
  total_plays INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_cassettes_single_active ON cassettes((TRUE)) WHERE active = TRUE;
CREATE INDEX idx_cassettes_archived ON cassettes(archived, start_date DESC);

-- ============================================
-- SONG PROPOSALS
-- ============================================

CREATE TABLE song_proposals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  artist VARCHAR(200) NOT NULL,
  genre VARCHAR(100),
  external_link TEXT,
  audio_file_path TEXT,
  contact_email VARCHAR(255),
  comment TEXT,
  status proposal_status NOT NULL DEFAULT 'pending',
  cassette_id UUID REFERENCES cassettes(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES profiles(id)
);

CREATE INDEX idx_proposals_user ON song_proposals(user_id, created_at DESC);
CREATE INDEX idx_proposals_status ON song_proposals(status);

-- ============================================
-- SONGS (tracks in a cassette)
-- ============================================

CREATE TABLE songs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cassette_id UUID NOT NULL REFERENCES cassettes(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  artist VARCHAR(200) NOT NULL,
  genre VARCHAR(100),
  duration_seconds INTEGER,
  side cassette_side NOT NULL,
  position INTEGER NOT NULL,
  audio_url TEXT,
  proposal_id UUID REFERENCES song_proposals(id),
  plays INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_songs_cassette ON songs(cassette_id, side, position);

-- ============================================
-- EVENTS
-- ============================================

CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  event_end_date TIMESTAMPTZ,
  venue_name VARCHAR(200),
  venue_profile_id UUID REFERENCES profiles(id),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  country VARCHAR(100) DEFAULT 'México',
  event_type VARCHAR(100),
  external_link TEXT,
  cover_image_url TEXT,
  status event_status NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_events_profile ON events(profile_id);
CREATE INDEX idx_events_date ON events(event_date DESC) WHERE status = 'published';
CREATE INDEX idx_events_city ON events(city) WHERE status = 'published';

-- ============================================
-- INTERESTS
-- ============================================

CREATE TABLE interests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  to_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(from_profile_id, to_profile_id)
);

CREATE INDEX idx_interests_from ON interests(from_profile_id);
CREATE INDEX idx_interests_to ON interests(to_profile_id);

-- ============================================
-- ACTIVITY FEED
-- ============================================

CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type activity_type NOT NULL,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  profile_name VARCHAR(100),
  profile_role profile_role,
  metadata JSONB DEFAULT '{}',
  visible BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_activity_feed_recent ON activity_feed(created_at DESC) WHERE visible = TRUE;

-- ============================================
-- SYSTEM CONFIG
-- ============================================

CREATE TABLE system_config (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO system_config (key, value) VALUES
  ('proposals_limit_per_week', '3'),
  ('cassette_duration_options', '[60, 90]');

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE band_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE fan_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE manager_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE promoter_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE venue_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cassettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE songs ENABLE ROW LEVEL SECURITY;
ALTER TABLE song_proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE interests ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_config ENABLE ROW LEVEL SECURITY;

-- PROFILES -------------------------------------------------------

CREATE POLICY "profiles_select_active"
  ON profiles FOR SELECT
  USING (active = TRUE);

CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- BAND ------------------------------------------------------------

CREATE POLICY "band_select_public"
  ON band_profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "band_insert_own"
  ON band_profiles FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "band_update_own"
  ON band_profiles FOR UPDATE
  USING (auth.uid() = profile_id);

-- FAN -------------------------------------------------------------

CREATE POLICY "fan_select_public"
  ON fan_profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "fan_insert_own"
  ON fan_profiles FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "fan_update_own"
  ON fan_profiles FOR UPDATE
  USING (auth.uid() = profile_id);

-- MANAGER ---------------------------------------------------------

CREATE POLICY "manager_select_public"
  ON manager_profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "manager_insert_own"
  ON manager_profiles FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "manager_update_own"
  ON manager_profiles FOR UPDATE
  USING (auth.uid() = profile_id);

-- PROMOTER --------------------------------------------------------

CREATE POLICY "promoter_select_public"
  ON promoter_profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "promoter_insert_own"
  ON promoter_profiles FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "promoter_update_own"
  ON promoter_profiles FOR UPDATE
  USING (auth.uid() = profile_id);

-- AGENT -----------------------------------------------------------

CREATE POLICY "agent_select_public"
  ON agent_profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "agent_insert_own"
  ON agent_profiles FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "agent_update_own"
  ON agent_profiles FOR UPDATE
  USING (auth.uid() = profile_id);

-- PROVIDER --------------------------------------------------------

CREATE POLICY "provider_select_public"
  ON provider_profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "provider_insert_own"
  ON provider_profiles FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "provider_update_own"
  ON provider_profiles FOR UPDATE
  USING (auth.uid() = profile_id);

-- VENUE -----------------------------------------------------------

CREATE POLICY "venue_select_public"
  ON venue_profiles FOR SELECT
  USING (TRUE);

CREATE POLICY "venue_insert_own"
  ON venue_profiles FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "venue_update_own"
  ON venue_profiles FOR UPDATE
  USING (auth.uid() = profile_id);

-- CASSETTES -------------------------------------------------------

CREATE POLICY "cassettes_select_public"
  ON cassettes FOR SELECT
  USING (TRUE);

-- SONGS -----------------------------------------------------------

CREATE POLICY "songs_select_public"
  ON songs FOR SELECT
  USING (TRUE);

-- SONG PROPOSALS --------------------------------------------------

CREATE POLICY "proposals_select_own"
  ON song_proposals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "proposals_insert_own"
  ON song_proposals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- INTERESTS -------------------------------------------------------

CREATE POLICY "interests_select_own"
  ON interests FOR SELECT
  USING (auth.uid() = from_profile_id OR auth.uid() = to_profile_id);

CREATE POLICY "interests_insert_own"
  ON interests FOR INSERT
  WITH CHECK (auth.uid() = from_profile_id);

-- EVENTS ----------------------------------------------------------

CREATE POLICY "events_select_published"
  ON events FOR SELECT
  USING (status = 'published' OR auth.uid() = profile_id);

CREATE POLICY "events_insert_own"
  ON events FOR INSERT
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "events_update_own"
  ON events FOR UPDATE
  USING (auth.uid() = profile_id);

CREATE POLICY "events_delete_own"
  ON events FOR DELETE
  USING (auth.uid() = profile_id);

-- ACTIVITY FEED ---------------------------------------------------

CREATE POLICY "activity_select_visible"
  ON activity_feed FOR SELECT
  USING (visible = TRUE);

-- SYSTEM CONFIG ---------------------------------------------------

CREATE POLICY "config_select_public"
  ON system_config FOR SELECT
  USING (TRUE);

-- ============================================
-- FUNCTIONS
-- ============================================

CREATE OR REPLACE FUNCTION can_view_contact(viewer_id UUID, target_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  IF viewer_id = target_id THEN
    RETURN TRUE;
  END IF;

  RETURN EXISTS (
    SELECT 1 FROM interests
    WHERE from_profile_id = viewer_id AND to_profile_id = target_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION count_weekly_proposals(p_user_id UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)::integer
    FROM song_proposals
    WHERE user_id = p_user_id
      AND created_at >= date_trunc('week', NOW())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER cassettes_updated_at
  BEFORE UPDATE ON cassettes
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER system_config_updated_at
  BEFORE UPDATE ON system_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'profiles' AND TG_OP = 'INSERT' THEN
    INSERT INTO activity_feed (type, profile_id, profile_name, profile_role)
    VALUES ('registration', NEW.id, NEW.display_name, NEW.role);
  END IF;

  IF TG_TABLE_NAME = 'interests' AND TG_OP = 'INSERT' THEN
    INSERT INTO activity_feed (type, profile_id, profile_name, profile_role, metadata)
    SELECT
      'interest',
      NEW.from_profile_id,
      p1.display_name,
      p1.role,
      jsonb_build_object('to_profile_id', NEW.to_profile_id, 'to_profile_name', p2.display_name)
    FROM profiles p1, profiles p2
    WHERE p1.id = NEW.from_profile_id AND p2.id = NEW.to_profile_id;
  END IF;

  IF TG_TABLE_NAME = 'song_proposals' AND TG_OP = 'INSERT' THEN
    INSERT INTO activity_feed (type, profile_id, profile_name, profile_role, metadata)
    SELECT
      'proposal',
      NEW.user_id,
      p.display_name,
      p.role,
      jsonb_build_object('title', NEW.title, 'artist', NEW.artist)
    FROM profiles p
    WHERE p.id = NEW.user_id;
  END IF;

  IF TG_TABLE_NAME = 'events' AND TG_OP = 'INSERT' THEN
    IF NEW.status = 'published' THEN
      INSERT INTO activity_feed (type, profile_id, profile_name, profile_role, metadata)
      SELECT
        'event_published',
        NEW.profile_id,
        p.display_name,
        p.role,
        jsonb_build_object('title', NEW.title, 'event_date', NEW.event_date, 'city', NEW.city)
      FROM profiles p
      WHERE p.id = NEW.profile_id;
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER profiles_activity
  AFTER INSERT ON profiles
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER interests_activity
  AFTER INSERT ON interests
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER proposals_activity
  AFTER INSERT ON song_proposals
  FOR EACH ROW EXECUTE FUNCTION log_activity();

CREATE TRIGGER events_activity
  AFTER INSERT ON events
  FOR EACH ROW EXECUTE FUNCTION log_activity();

-- ============================================
-- STORAGE BUCKETS (run in Supabase dashboard or via API)
-- ============================================
-- INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('audio', 'audio', false);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('cassette-art', 'cassette-art', true);
-- INSERT INTO storage.buckets (id, name, public) VALUES ('event-covers', 'event-covers', true);

-- ============================================
-- STORAGE POLICIES (run after creating buckets)
-- ============================================

-- Avatars: authenticated users upload/update their own folder, public read
-- CREATE POLICY "avatars_insert" ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "avatars_update" ON storage.objects FOR UPDATE
--   USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
-- CREATE POLICY "avatars_select" ON storage.objects FOR SELECT
--   USING (bucket_id = 'avatars');

-- Audio: authenticated users upload, public read for cassette tracks
-- CREATE POLICY "audio_insert" ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'audio' AND auth.uid() IS NOT NULL);
-- CREATE POLICY "audio_select" ON storage.objects FOR SELECT
--   USING (bucket_id = 'audio');

-- Event covers: authenticated users upload, public read
-- CREATE POLICY "event_covers_insert" ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'event-covers' AND auth.uid() IS NOT NULL);
-- CREATE POLICY "event_covers_select" ON storage.objects FOR SELECT
--   USING (bucket_id = 'event-covers');

-- ============================================
-- IMPORTANT NOTES
-- ============================================
-- * Admin operations (managing cassettes, songs, reviewing proposals,
--   updating system_config) should use a service_role client that
--   bypasses RLS entirely.
-- * The registration server action (registroSignup) needs a
--   service_role client to insert profiles before email confirmation.
-- * Create lib/supabase/service.ts with SUPABASE_SERVICE_ROLE_KEY
--   for these operations.
