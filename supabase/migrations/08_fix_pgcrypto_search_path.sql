-- ==============================================================================
-- QUIZ//ARENA: SENTINEL EXTENSION SCHEMA FIX
-- Migration: 08_fix_pgcrypto_search_path.sql
--
-- ROOT CAUSE:
-- In Supabase, extensions like pgcrypto are installed in the `extensions` schema.
-- In migration 07, `SET search_path = public` excluded `extensions`, causing:
-- "function crypt(...) does not exist" and "function gen_salt(...) does not exist".
--
-- FIX:
-- Set `SET search_path = public, extensions;` on all security definer functions,
-- or explicitly qualify extension calls as `extensions.crypt(...)` and
-- `extensions.gen_salt(...)`.
--
-- RUN THIS IN SUPABASE SQL EDITOR TO INSTANTLY FIX LOGIN & REGISTER!
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- Drop function to allow parameter updates if needed
DROP FUNCTION IF EXISTS login_fn(TEXT, TEXT);

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
BEGIN
  -- 1. Fetch user profile row
  SELECT * INTO v_row
  FROM user_profiles
  WHERE LOWER(username) = LOWER(p_username);

  IF NOT FOUND THEN
    -- Mitigate timing analysis
    PERFORM extensions.crypt('dummy', '$2b$10$' || repeat('x', 53));
    RAISE EXCEPTION 'Invalid username or password.';
  END IF;

  -- 2. Determine hash format
  v_is_bcrypt := (v_row.password_hash LIKE '$2b$%' OR v_row.password_hash LIKE '$2a$%');

  IF v_is_bcrypt THEN
    v_valid := (extensions.crypt(p_password, v_row.password_hash) = v_row.password_hash);
  ELSE
    -- Legacy plaintext fallback
    v_valid := (v_row.password_hash = p_password);
    -- Rolling upgrade to bcrypt
    IF v_valid THEN
      UPDATE user_profiles
      SET password_hash = extensions.crypt(p_password, extensions.gen_salt('bf', 10)),
          updated_at = NOW()
      WHERE id = v_row.id;
    END IF;
  END IF;

  IF NOT v_valid THEN
    RAISE EXCEPTION 'Invalid username or password.';
  END IF;

  -- 3. Return sanitized account object
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
    'created_at',      v_row.created_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION login_fn(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION login_fn(TEXT, TEXT) TO authenticated;


-- Drop and recreate register_fn with qualified extensions
DROP FUNCTION IF EXISTS register_fn(TEXT, TEXT, TEXT);

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
  v_hashed    TEXT;
  v_avatar    TEXT;
  v_inserted  user_profiles%ROWTYPE;
BEGIN
  IF LENGTH(TRIM(p_username)) < 3 THEN
    RAISE EXCEPTION 'Username must be at least 3 characters.';
  END IF;
  IF LENGTH(p_password) < 4 THEN
    RAISE EXCEPTION 'Password must be at least 4 characters.';
  END IF;

  IF EXISTS (SELECT 1 FROM user_profiles WHERE LOWER(username) = LOWER(TRIM(p_username))) THEN
    RAISE EXCEPTION 'Username is already taken.';
  END IF;

  -- Hash using extensions schema
  v_hashed := extensions.crypt(p_password, extensions.gen_salt('bf', 10));
  v_avatar  := COALESCE(
    p_avatar_url,
    'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=' || TRIM(p_username)
  );

  INSERT INTO user_profiles (
    username, password_hash, avatar_url,
    rooms_created, matches_played, wins,
    total_score, correct_answers, total_answers
  )
  VALUES (
    TRIM(p_username), v_hashed, v_avatar,
    0, 0, 0,
    0, 0, 0
  )
  RETURNING * INTO v_inserted;

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
    'created_at',      v_inserted.created_at
  );
END;
$$;

GRANT EXECUTE ON FUNCTION register_fn(TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION register_fn(TEXT, TEXT, TEXT) TO authenticated;


-- Drop and recreate update_own_profile_fn with qualified extensions
DROP FUNCTION IF EXISTS update_own_profile_fn(TEXT, TEXT, TEXT, TEXT, TEXT);

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
    IF EXISTS (SELECT 1 FROM user_profiles WHERE LOWER(username) = LOWER(p_new_username)) THEN
      RAISE EXCEPTION 'Username already taken.';
    END IF;
  END IF;

  IF p_new_password IS NOT NULL AND LENGTH(p_new_password) >= 4 THEN
    v_new_hash := extensions.crypt(p_new_password, extensions.gen_salt('bf', 10));
  END IF;

  UPDATE user_profiles
  SET
    username      = COALESCE(p_new_username, username),
    password_hash = COALESCE(v_new_hash, password_hash),
    avatar_url    = COALESCE(p_new_avatar_url, avatar_url),
    updated_at    = NOW()
  WHERE id = v_row.id;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION update_own_profile_fn(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION update_own_profile_fn(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;


-- Drop and recreate delete_own_account_fn with qualified extensions
DROP FUNCTION IF EXISTS delete_own_account_fn(TEXT, TEXT);

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

  DELETE FROM user_profiles WHERE id = v_row.id;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION delete_own_account_fn(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION delete_own_account_fn(TEXT, TEXT) TO authenticated;
