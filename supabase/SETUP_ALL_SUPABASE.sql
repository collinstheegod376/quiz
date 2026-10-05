-- ==============================================================================
-- QUIZ//ARENA: COMPLETE CONSOLIDATED SUPABASE PRODUCTION SETUP SCRIPT
-- Paste this entire script into your Supabase SQL Editor and click RUN.
--
-- This script sets up:
--   1. pgcrypto extension
--   2. realtime_rooms table + validation triggers (score injection guard)
--   3. user_profiles table + brute force lockout columns
--   4. user_sessions table + token hash indexing + RLS lockdown
--   5. Hardened RPC functions:
--      - register_fn (username format, 8+ char password, bcrypt, token issuance)
--      - login_fn (brute force lockout, bcrypt verification, timing mitigation, token issuance)
--      - restore_session_fn (SHA-256 session token lookup, expiry check)
--      - logout_fn (session revocation)
--      - update_own_profile_fn (current password check, session revocation on pw change)
--      - delete_own_account_fn (current password check, cascades user & sessions)
--      - increment_user_stat_fn (stat column whitelist + sensible rate caps)
--   6. Realtime publication subscriptions
--   7. Stale room cleanup
-- ==============================================================================

-- 0. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

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

-- Room state validation trigger (Sanity bounds on players & scores)
CREATE OR REPLACE FUNCTION validate_room_state_fn()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_state JSONB := NEW.state;
  v_status TEXT;
  v_valid_statuses TEXT[] := ARRAY[
    'LOBBY', 'QUESTION', 'REVEAL', 'NEXT_ROUND', 'FINAL_RESULTS', 'FINISHED'
  ];
  v_player_count INTEGER;
  v_player JSONB;
  v_player_score INTEGER;
  v_correct_answers INTEGER;
BEGIN
  v_status := v_state->>'status';
  IF v_status IS NOT NULL AND NOT (v_status = ANY(v_valid_statuses)) THEN
    RAISE EXCEPTION 'Invalid room status: %', v_status;
  END IF;

  v_player_count := jsonb_array_length(v_state->'players');
  IF v_player_count > COALESCE((v_state->>'maxPlayers')::INTEGER, 4) THEN
    RAISE EXCEPTION 'Player count % exceeds maxPlayers', v_player_count;
  END IF;

  FOR v_player IN SELECT * FROM jsonb_array_elements(v_state->'players') LOOP
    v_player_score := COALESCE((v_player->>'score')::INTEGER, 0);
    v_correct_answers := COALESCE((v_player->>'correctAnswers')::INTEGER, 0);

    IF v_player_score < 0 OR v_player_score > 500000 THEN
      RAISE EXCEPTION 'Player score % is out of valid bounds [0, 500000]', v_player_score;
    END IF;

    IF v_correct_answers < 0 OR v_correct_answers > 300 THEN
      RAISE EXCEPTION 'Player correct answers % is out of valid bounds [0, 300]', v_correct_answers;
    END IF;
  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_room_state ON realtime_rooms;
CREATE TRIGGER trg_validate_room_state
  BEFORE INSERT OR UPDATE ON realtime_rooms
  FOR EACH ROW
  EXECUTE FUNCTION validate_room_state_fn();


-- 2. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS user_profiles (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username              TEXT UNIQUE NOT NULL,
  password_hash         TEXT NOT NULL,
  avatar_url            TEXT NOT NULL,
  rooms_created         INTEGER DEFAULT 0,
  matches_played        INTEGER DEFAULT 0,
  wins                  INTEGER DEFAULT 0,
  total_score           INTEGER DEFAULT 0,
  correct_answers       INTEGER DEFAULT 0,
  total_answers         INTEGER DEFAULT 0,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until          TIMESTAMPTZ DEFAULT NULL,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ DEFAULT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_profiles_username_lower ON user_profiles(LOWER(username));
CREATE INDEX IF NOT EXISTS idx_user_profiles_total_score ON user_profiles(total_score DESC);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Allow reading public profiles for leaderboards, but prevent unauthorized direct edits/deletions
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_profiles' AND policyname = 'Anyone can read profiles') THEN
    CREATE POLICY "Anyone can read profiles" ON user_profiles FOR SELECT USING (true);
  END IF;
END $$;

-- Drop insecure legacy update/delete policies if they exist
DROP POLICY IF EXISTS "Anyone can update profile" ON user_profiles;
DROP POLICY IF EXISTS "Anyone can delete profile" ON user_profiles;
DROP POLICY IF EXISTS "Anyone can register" ON user_profiles;


-- 3. USER SESSIONS TABLE
CREATE TABLE IF NOT EXISTS user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  session_token_hash TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '30 days'),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_sessions_lookup 
  ON user_sessions(session_token_hash, expires_at);

CREATE INDEX IF NOT EXISTS idx_user_sessions_user 
  ON user_sessions(user_id);

ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON user_sessions FROM anon;
REVOKE ALL ON user_sessions FROM authenticated;


-- 4. RPC FUNCTIONS

-- A. Increment User Stat (with column whitelist and sensible caps)
CREATE OR REPLACE FUNCTION increment_user_stat_fn(
  p_username TEXT,
  p_stat_col TEXT,
  p_amount   INTEGER DEFAULT 1
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_allowed_cols TEXT[] := ARRAY[
    'rooms_created', 'matches_played', 'wins',
    'total_score', 'correct_answers', 'total_answers'
  ];
  v_max_amount   INTEGER;
BEGIN
  IF NOT (p_stat_col = ANY(v_allowed_cols)) THEN
    RAISE EXCEPTION 'Invalid stat column: %', p_stat_col;
  END IF;

  v_max_amount := CASE p_stat_col
    WHEN 'total_score'     THEN 4000
    WHEN 'rooms_created'   THEN 5
    WHEN 'matches_played'  THEN 5
    WHEN 'wins'            THEN 5
    WHEN 'correct_answers' THEN 20
    WHEN 'total_answers'   THEN 20
    ELSE 1
  END;

  IF p_amount < 0 OR p_amount > v_max_amount THEN
    RAISE EXCEPTION 'Amount % exceeds cap for column %', p_amount, p_stat_col;
  END IF;

  EXECUTE format(
    'UPDATE user_profiles SET %I = %I + $1, updated_at = NOW() WHERE LOWER(username) = LOWER($2)',
    p_stat_col, p_stat_col
  ) USING p_amount, p_username;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION increment_user_stat_fn(TEXT, TEXT, INTEGER) TO anon;
GRANT EXECUTE ON FUNCTION increment_user_stat_fn(TEXT, TEXT, INTEGER) TO authenticated;


-- B. Secure Register
CREATE OR REPLACE FUNCTION register_fn(
  p_username   TEXT,
  p_password   TEXT,
  p_avatar_url TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_clean_user  TEXT;
  v_hashed      TEXT;
  v_avatar      TEXT;
  v_inserted    user_profiles%ROWTYPE;
  v_raw_token   TEXT;
  v_token_hash  TEXT;
BEGIN
  v_clean_user := TRIM(p_username);

  IF LENGTH(v_clean_user) < 3 OR LENGTH(v_clean_user) > 20 THEN
    RAISE EXCEPTION 'Username must be between 3 and 20 characters.';
  END IF;

  IF NOT (v_clean_user ~ '^[a-zA-Z0-9_-]+$') THEN
    RAISE EXCEPTION 'Username may only contain letters, numbers, underscores, and dashes.';
  END IF;

  IF LENGTH(p_password) < 8 THEN
    RAISE EXCEPTION 'Password must be at least 8 characters.';
  END IF;

  IF EXISTS (SELECT 1 FROM user_profiles WHERE LOWER(username) = LOWER(v_clean_user)) THEN
    RAISE EXCEPTION 'Username is already taken.';
  END IF;

  v_hashed := extensions.crypt(p_password, extensions.gen_salt('bf', 10));
  v_avatar  := COALESCE(
    p_avatar_url,
    'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=' || v_clean_user
  );

  INSERT INTO user_profiles (
    username, password_hash, avatar_url,
    rooms_created, matches_played, wins,
    total_score, correct_answers, total_answers
  )
  VALUES (
    v_clean_user, v_hashed, v_avatar,
    0, 0, 0,
    0, 0, 0
  )
  RETURNING * INTO v_inserted;

  v_raw_token := encode(extensions.gen_random_bytes(32), 'hex');
  v_token_hash := encode(extensions.digest(v_raw_token, 'sha256'), 'hex');

  INSERT INTO user_sessions (user_id, session_token_hash, expires_at)
  VALUES (v_inserted.id, v_token_hash, NOW() + INTERVAL '30 days');

  RETURN jsonb_build_object(
    'id',              v_inserted.id,
    'username',        v_inserted.username,
    'avatar_url',      v_inserted.avatar_url,
    'rooms_created',   v_inserted.rooms_created,
    'matches_played',  v_inserted.matches_played,
    'wins',            v_inserted.wins,
    'total_score',     v_inserted.total_score,
    'correct_answers', v_inserted.correct_answers,
    'total_answers',   v_inserted.total_answers,
    'created_at',      v_inserted.created_at,
    'session_token',   v_raw_token
  );
END;
$$;

GRANT EXECUTE ON FUNCTION register_fn(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION register_fn(TEXT, TEXT, TEXT) TO authenticated;


-- C. Secure Login
CREATE OR REPLACE FUNCTION login_fn(
  p_username TEXT,
  p_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_row         user_profiles%ROWTYPE;
  v_is_bcrypt   BOOLEAN;
  v_valid       BOOLEAN := FALSE;
  v_raw_token   TEXT;
  v_token_hash  TEXT;
BEGIN
  SELECT * INTO v_row
  FROM user_profiles
  WHERE LOWER(username) = LOWER(TRIM(p_username));

  IF NOT FOUND THEN
    PERFORM extensions.crypt('dummy_password_timing_mitigation', '$2b$10$' || repeat('x', 53));
    RAISE EXCEPTION 'Invalid username or password.';
  END IF;

  IF v_row.locked_until IS NOT NULL AND v_row.locked_until > NOW() THEN
    RAISE EXCEPTION 'Account temporarily locked. Please try again in % seconds.',
      GREATEST(1, EXTRACT(EPOCH FROM (v_row.locked_until - NOW()))::INTEGER);
  END IF;

  v_is_bcrypt := (v_row.password_hash LIKE '$2b$%' OR v_row.password_hash LIKE '$2a$%');

  IF v_is_bcrypt THEN
    v_valid := (extensions.crypt(p_password, v_row.password_hash) = v_row.password_hash);
  ELSE
    v_valid := (v_row.password_hash = p_password);
    IF v_valid THEN
      UPDATE user_profiles
      SET password_hash = extensions.crypt(p_password, extensions.gen_salt('bf', 10)),
          updated_at = NOW()
      WHERE id = v_row.id;
    END IF;
  END IF;

  IF NOT v_valid THEN
    UPDATE user_profiles
    SET failed_login_attempts = COALESCE(failed_login_attempts, 0) + 1,
        locked_until = CASE
          WHEN COALESCE(failed_login_attempts, 0) + 1 >= 5 THEN NOW() + INTERVAL '60 seconds'
          ELSE NULL
        END
    WHERE id = v_row.id;

    RAISE EXCEPTION 'Invalid username or password.';
  END IF;

  UPDATE user_profiles
  SET failed_login_attempts = 0,
      locked_until = NULL
  WHERE id = v_row.id;

  v_raw_token := encode(extensions.gen_random_bytes(32), 'hex');
  v_token_hash := encode(extensions.digest(v_raw_token, 'sha256'), 'hex');

  INSERT INTO user_sessions (user_id, session_token_hash, expires_at)
  VALUES (v_row.id, v_token_hash, NOW() + INTERVAL '30 days');

  RETURN jsonb_build_object(
    'id',              v_row.id,
    'username',        v_row.username,
    'avatar_url',      v_row.avatar_url,
    'rooms_created',   v_row.rooms_created,
    'matches_played',  v_row.matches_played,
    'wins',            v_row.wins,
    'total_score',     v_row.total_score,
    'correct_answers', v_row.correct_answers,
    'total_answers',   v_row.total_answers,
    'created_at',      v_row.created_at,
    'session_token',   v_raw_token
  );
END;
$$;

GRANT EXECUTE ON FUNCTION login_fn(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION login_fn(TEXT, TEXT) TO authenticated;


-- D. Secure Restore Session
CREATE OR REPLACE FUNCTION restore_session_fn(p_session_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_token_hash TEXT;
  v_session    user_sessions%ROWTYPE;
  v_row        user_profiles%ROWTYPE;
BEGIN
  IF p_session_token IS NULL OR LENGTH(p_session_token) < 16 THEN
    RETURN NULL;
  END IF;

  v_token_hash := encode(extensions.digest(p_session_token, 'sha256'), 'hex');

  SELECT * INTO v_session
  FROM user_sessions
  WHERE session_token_hash = v_token_hash
    AND expires_at > NOW();

  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT * INTO v_row
  FROM user_profiles
  WHERE id = v_session.user_id;

  IF NOT FOUND THEN
    DELETE FROM user_sessions WHERE id = v_session.id;
    RETURN NULL;
  END IF;

  UPDATE user_sessions
  SET last_active_at = NOW()
  WHERE id = v_session.id;

  RETURN jsonb_build_object(
    'id',              v_row.id,
    'username',        v_row.username,
    'avatar_url',      v_row.avatar_url,
    'rooms_created',   v_row.rooms_created,
    'matches_played',  v_row.matches_played,
    'wins',            v_row.wins,
    'total_score',     v_row.total_score,
    'correct_answers', v_row.correct_answers,
    'total_answers',   v_row.total_answers,
    'created_at',      v_row.created_at,
    'session_token',   p_session_token
  );
END;
$$;

GRANT EXECUTE ON FUNCTION restore_session_fn(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION restore_session_fn(TEXT) TO authenticated;


-- E. Secure Logout
CREATE OR REPLACE FUNCTION logout_fn(p_session_token TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_token_hash TEXT;
BEGIN
  IF p_session_token IS NOT NULL THEN
    v_token_hash := encode(extensions.digest(p_session_token, 'sha256'), 'hex');
    DELETE FROM user_sessions WHERE session_token_hash = v_token_hash;
  END IF;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION logout_fn(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION logout_fn(TEXT) TO authenticated;


-- F. Secure Update Profile
CREATE OR REPLACE FUNCTION update_own_profile_fn(
  p_username          TEXT,
  p_current_password  TEXT,
  p_new_username      TEXT DEFAULT NULL,
  p_new_password      TEXT DEFAULT NULL,
  p_new_avatar_url    TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_row         user_profiles%ROWTYPE;
  v_is_bcrypt   BOOLEAN;
  v_valid       BOOLEAN := FALSE;
  v_new_hash    TEXT;
  v_clean_user  TEXT;
BEGIN
  SELECT * INTO v_row
  FROM user_profiles
  WHERE LOWER(username) = LOWER(p_username);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account not found.';
  END IF;

  v_is_bcrypt := (v_row.password_hash LIKE '$2b$%' OR v_row.password_hash LIKE '$2a$%');

  IF v_is_bcrypt THEN
    v_valid := (extensions.crypt(p_current_password, v_row.password_hash) = v_row.password_hash);
  ELSE
    v_valid := (v_row.password_hash = p_current_password);
  END IF;

  IF NOT v_valid THEN
    RAISE EXCEPTION 'Unauthorized: incorrect current password.';
  END IF;

  IF p_new_username IS NOT NULL AND LOWER(p_new_username) != LOWER(p_username) THEN
    v_clean_user := TRIM(p_new_username);
    IF LENGTH(v_clean_user) < 3 OR LENGTH(v_clean_user) > 20 THEN
      RAISE EXCEPTION 'Username must be between 3 and 20 characters.';
    END IF;
    IF NOT (v_clean_user ~ '^[a-zA-Z0-9_-]+$') THEN
      RAISE EXCEPTION 'Username may only contain letters, numbers, underscores, and dashes.';
    END IF;
    IF EXISTS (SELECT 1 FROM user_profiles WHERE LOWER(username) = LOWER(v_clean_user)) THEN
      RAISE EXCEPTION 'Username already taken.';
    END IF;
  END IF;

  IF p_new_password IS NOT NULL THEN
    IF LENGTH(p_new_password) < 8 THEN
      RAISE EXCEPTION 'New password must be at least 8 characters.';
    END IF;
    v_new_hash := extensions.crypt(p_new_password, extensions.gen_salt('bf', 10));

    -- Revoke existing sessions on password change
    DELETE FROM user_sessions WHERE user_id = v_row.id;
  END IF;

  UPDATE user_profiles
  SET
    username      = COALESCE(v_clean_user, username),
    password_hash = COALESCE(v_new_hash, password_hash),
    avatar_url    = COALESCE(p_new_avatar_url, avatar_url),
    updated_at    = NOW()
  WHERE id = v_row.id;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION update_own_profile_fn(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION update_own_profile_fn(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;


-- G. Secure Delete Account
CREATE OR REPLACE FUNCTION delete_own_account_fn(
  p_username         TEXT,
  p_current_password TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $$
DECLARE
  v_row       user_profiles%ROWTYPE;
  v_is_bcrypt BOOLEAN;
  v_valid     BOOLEAN := FALSE;
BEGIN
  SELECT * INTO v_row
  FROM user_profiles
  WHERE LOWER(username) = LOWER(p_username);

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Account not found.';
  END IF;

  v_is_bcrypt := (v_row.password_hash LIKE '$2b$%' OR v_row.password_hash LIKE '$2a$%');

  IF v_is_bcrypt THEN
    v_valid := (extensions.crypt(p_current_password, v_row.password_hash) = v_row.password_hash);
  ELSE
    v_valid := (v_row.password_hash = p_current_password);
  END IF;

  IF NOT v_valid THEN
    RAISE EXCEPTION 'Unauthorized: incorrect current password.';
  END IF;

  DELETE FROM user_sessions WHERE user_id = v_row.id;
  DELETE FROM user_profiles WHERE id = v_row.id;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION delete_own_account_fn(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION delete_own_account_fn(TEXT, TEXT) TO authenticated;


-- 5. ENABLE SUPABASE REALTIME
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


-- 6. PURGE STALE ROOMS
DELETE FROM realtime_rooms 
WHERE updated_at < NOW() - INTERVAL '24 hours' 
   OR state->>'status' = 'FINISHED';
