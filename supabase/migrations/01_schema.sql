-- QUIZ//ARENA PRODUCTION DATABASE SCHEMA

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  tagline TEXT,
  description TEXT,
  accent_color TEXT DEFAULT '#E50914',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Topics Table
CREATE TABLE IF NOT EXISTS topics (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  question_count INTEGER DEFAULT 0,
  popularity_rank INTEGER DEFAULT 1,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Difficulty Levels Table (1-10)
CREATE TABLE IF NOT EXISTS difficulty_levels (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id TEXT REFERENCES topics(id) ON DELETE CASCADE,
  level_number INTEGER NOT NULL CHECK (level_number BETWEEN 1 AND 10),
  name TEXT NOT NULL,
  description TEXT,
  UNIQUE(topic_id, level_number)
);

-- 5. Questions Pool Table
CREATE TABLE IF NOT EXISTS questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  topic_id TEXT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  level_number INTEGER NOT NULL CHECK (level_number BETWEEN 1 AND 10),
  question_text TEXT NOT NULL,
  option_a TEXT NOT NULL,
  option_b TEXT NOT NULL,
  option_c TEXT NOT NULL,
  option_d TEXT NOT NULL,
  correct_option CHAR(1) NOT NULL CHECK (correct_option IN ('A', 'B', 'C', 'D')),
  explanation TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(6) UNIQUE NOT NULL,
  host_id UUID NOT NULL,
  category_id TEXT NOT NULL REFERENCES categories(id),
  topic_id TEXT NOT NULL REFERENCES topics(id),
  difficulty_level INTEGER NOT NULL CHECK (difficulty_level BETWEEN 1 AND 10),
  status TEXT NOT NULL DEFAULT 'LOBBY' CHECK (status IN ('LOBBY', 'QUESTION', 'REVEAL', 'LEADERBOARD', 'FINAL_RESULTS', 'FINISHED')),
  player_count_at_start INTEGER,
  calculated_question_count INTEGER,
  time_per_question INTEGER DEFAULT 20,
  current_question_index INTEGER DEFAULT 0,
  question_started_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Room Players Table (2-4 players per room)
CREATE TABLE IF NOT EXISTS room_players (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  is_host BOOLEAN DEFAULT false,
  score INTEGER DEFAULT 0,
  correct_answers INTEGER DEFAULT 0,
  total_response_time_ms BIGINT DEFAULT 0,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, user_id)
);

-- 8. Game Questions Table (Prevents question duplication in match)
CREATE TABLE IF NOT EXISTS game_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  question_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, question_order),
  UNIQUE(room_id, question_id)
);

-- 9. Answers Table (Authoritative submission records)
CREATE TABLE IF NOT EXISTS answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES room_players(id) ON DELETE CASCADE,
  selected_option CHAR(1) NOT NULL CHECK (selected_option IN ('A', 'B', 'C', 'D')),
  is_correct BOOLEAN NOT NULL,
  response_time_ms INTEGER NOT NULL,
  points_awarded INTEGER NOT NULL,
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(room_id, question_id, player_id)
);

-- Indexes for lightning fast queries
CREATE INDEX IF NOT EXISTS idx_rooms_code ON rooms(code);
CREATE INDEX IF NOT EXISTS idx_room_players_room ON room_players(room_id);
CREATE INDEX IF NOT EXISTS idx_questions_topic_level ON questions(topic_id, level_number);
CREATE INDEX IF NOT EXISTS idx_game_questions_room ON game_questions(room_id, question_order);
CREATE INDEX IF NOT EXISTS idx_answers_lookup ON answers(room_id, question_id);
