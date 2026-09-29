-- QUIZ//ARENA: User Profiles & Leaderboard Table
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_url TEXT NOT NULL,
  rooms_created INTEGER DEFAULT 0,
  matches_played INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  total_score INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_answers INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for fast case-insensitive username lookup during login/register
CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_username_lower ON user_profiles(LOWER(username));

-- Index for fast leaderboard ranking by XP
CREATE INDEX IF NOT EXISTS idx_user_profiles_total_score ON user_profiles(total_score DESC);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for leaderboard and checking if username exists)
CREATE POLICY "Anyone can read profiles" ON user_profiles
  FOR SELECT USING (true);

-- Allow anyone to insert profile (Registration)
CREATE POLICY "Anyone can register" ON user_profiles
  FOR INSERT WITH CHECK (true);

-- Allow anyone to update their profile (XP gain, settings update)
CREATE POLICY "Anyone can update profile" ON user_profiles
  FOR UPDATE USING (true);

-- Allow anyone to delete their profile
CREATE POLICY "Anyone can delete profile" ON user_profiles
  FOR DELETE USING (true);

-- Enable Realtime for live leaderboard updates
ALTER PUBLICATION supabase_realtime ADD TABLE user_profiles;
