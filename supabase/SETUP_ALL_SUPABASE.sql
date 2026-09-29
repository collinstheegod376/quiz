-- ==============================================================================
-- QUIZ//ARENA: COMPLETE SUPABASE SETUP SCRIPT
-- Paste this entire script into your Supabase SQL Editor and click RUN.
-- This sets up:
--   1. realtime_rooms (for multiplayer room sync and gameplay)
--   2. user_profiles (for signup, login, persistent stats, and global leaderboard)
--   3. Row Level Security policies
--   4. Realtime publication subscriptions
-- ==============================================================================

-- 1. REALTIME ROOMS TABLE
CREATE TABLE IF NOT EXISTS realtime_rooms (
  code        VARCHAR(6) PRIMARY KEY,
  state       JSONB NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_realtime_rooms_code ON realtime_rooms(code);

ALTER TABLE realtime_rooms ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'realtime_rooms' AND policyname = 'Anyone can read rooms') THEN
    CREATE POLICY "Anyone can read rooms" ON realtime_rooms FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'realtime_rooms' AND policyname = 'Anyone can create rooms') THEN
    CREATE POLICY "Anyone can create rooms" ON realtime_rooms FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'realtime_rooms' AND policyname = 'Anyone can update rooms') THEN
    CREATE POLICY "Anyone can update rooms" ON realtime_rooms FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'realtime_rooms' AND policyname = 'Anyone can delete rooms') THEN
    CREATE POLICY "Anyone can delete rooms" ON realtime_rooms FOR DELETE USING (true);
  END IF;
END $$;


-- 2. USER PROFILES TABLE (Authentication, Stats, Leaderboard)
CREATE TABLE IF NOT EXISTS user_profiles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username        TEXT UNIQUE NOT NULL,
  password_hash   TEXT NOT NULL,
  avatar_url      TEXT NOT NULL,
  rooms_created   INTEGER DEFAULT 0,
  matches_played  INTEGER DEFAULT 0,
  wins            INTEGER DEFAULT 0,
  total_score     INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_answers   INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_username_lower ON user_profiles(LOWER(username));
CREATE INDEX IF NOT EXISTS idx_user_profiles_total_score ON user_profiles(total_score DESC);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Anyone can read profiles') THEN
    CREATE POLICY "Anyone can read profiles" ON user_profiles FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Anyone can register') THEN
    CREATE POLICY "Anyone can register" ON user_profiles FOR INSERT WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Anyone can update profile') THEN
    CREATE POLICY "Anyone can update profile" ON user_profiles FOR UPDATE USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Anyone can delete profile') THEN
    CREATE POLICY "Anyone can delete profile" ON user_profiles FOR DELETE USING (true);
  END IF;
END $$;


-- 3. ENABLE SUPABASE REALTIME
DO $$ BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE realtime_rooms;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;

  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
  EXCEPTION WHEN duplicate_object THEN
    NULL;
  END;
END $$;
