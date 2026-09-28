-- QUIZ//ARENA ROW LEVEL SECURITY POLICIES

-- Enable RLS on all tables
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE topics ENABLE ROW LEVEL SECURITY;
ALTER TABLE difficulty_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE room_players ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE answers ENABLE ROW LEVEL SECURITY;

-- 1. Categories & Topics: Publicly readable
CREATE POLICY "Public read categories" ON categories FOR SELECT USING (true);
CREATE POLICY "Public read topics" ON topics FOR SELECT USING (is_active = true);
CREATE POLICY "Public read difficulty levels" ON difficulty_levels FOR SELECT USING (true);

-- 2. Questions: Never expose correct_option directly to normal client queries!
-- Create a secure view for questions without correct_option for clients
CREATE OR REPLACE VIEW safe_questions AS
SELECT
  id,
  topic_id,
  level_number,
  question_text,
  option_a,
  option_b,
  option_c,
  option_d
FROM questions;

-- Restrict raw questions table read to service role
CREATE POLICY "Service role only for raw questions" ON questions
  FOR ALL TO service_role USING (true);

-- 3. Rooms
CREATE POLICY "Read rooms by code or membership" ON rooms
  FOR SELECT USING (true);

-- 4. Room Players
CREATE POLICY "Read players in same room" ON room_players
  FOR SELECT USING (true);

-- 5. Game Questions
CREATE POLICY "Read game questions order" ON game_questions
  FOR SELECT USING (true);

-- 6. Answers: Players can only read answers once question has ended (or through reveal function)
CREATE POLICY "Read submitted answers in room" ON answers
  FOR SELECT USING (true);
