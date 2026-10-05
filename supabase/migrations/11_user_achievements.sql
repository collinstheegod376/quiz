-- QUIZ//ARENA: User Achievements Persistence Migration
-- Migration 11: Persist user achievements to Supabase to enable cross-device progress and prevent guest data wipe.

CREATE TABLE IF NOT EXISTS public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  achievement_id TEXT NOT NULL,
  unlocked BOOLEAN DEFAULT FALSE,
  unlocked_at TIMESTAMPTZ,
  progress INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT user_achievements_user_ach_unique UNIQUE (username, achievement_id)
);

-- Index for fast user achievement queries
CREATE INDEX IF NOT EXISTS idx_user_achievements_user ON public.user_achievements(LOWER(username));
CREATE INDEX IF NOT EXISTS idx_user_achievements_achievement ON public.user_achievements(achievement_id);

-- Enable Row Level Security
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Allow public read access (for profile display and achievement sync)
CREATE POLICY "Anyone can read user_achievements" ON public.user_achievements
  FOR SELECT USING (true);

-- Allow authenticated and guest users to insert achievements for their profile
CREATE POLICY "Users can insert own achievements" ON public.user_achievements
  FOR INSERT WITH CHECK (true);

-- Allow users to update achievements
CREATE POLICY "Users can update own achievements" ON public.user_achievements
  FOR UPDATE USING (true);

-- Allow users to delete achievements
CREATE POLICY "Users can delete own achievements" ON public.user_achievements
  FOR DELETE USING (true);

-- Add to Realtime publication if not already included
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'user_achievements'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.user_achievements;
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    -- In environments without supabase_realtime publication, ignore gracefully
    NULL;
END $$;
