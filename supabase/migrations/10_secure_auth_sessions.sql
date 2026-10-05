-- ==============================================================================
-- QUIZ//ARENA: MIGRATION 10 - SECURE TOKEN-BASED SESSIONS & RATE LIMITING
-- Migration: 10_secure_auth_sessions.sql
--
-- Fixes applied:
--   1. [BUG-01] Cryptographically random server-verified session tokens.
--      Eliminates trivial account takeover via forged localStorage username.
--   2. [BUG-04] Server-side brute-force lockout on failed login attempts.
--   3. [BUG-05] Server-side session revocation on logout and password change.
--   4. [BUG-08] Password minimum length upgraded to 8 characters with username format check.
--   5. [BUG-09] Explicit validation on new password in update_own_profile_fn.
--   6. [BUG-11] Cascade delete on account removal purges user_sessions.
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 1. Add lockout tracking columns to user_profiles if not present
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS locked_until TIMESTAMPTZ DEFAULT NULL;

-- 2. Create user_sessions table
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

-- Deny direct anon/authenticated manipulation of user_sessions table
REVOKE ALL ON user_sessions FROM anon;
REVOKE ALL ON user_sessions FROM authenticated;

-- 3. DROP old functions before re-creating
DROP FUNCTION IF EXISTS login_fn(TEXT, TEXT);
DROP FUNCTION IF EXISTS register_fn(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS restore_session_fn(TEXT);
DROP FUNCTION IF EXISTS logout_fn(TEXT);
DROP FUNCTION IF EXISTS update_own_profile_fn(TEXT, TEXT, TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS delete_own_account_fn(TEXT, TEXT);

-- 4. SECURE LOGIN FUNCTION
-- Server-side bcrypt verification, brute force lockout, and cryptographically secure session issuance
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
  -- Fetch user profile
  SELECT * INTO v_row
  FROM user_profiles
  WHERE LOWER(username) = LOWER(TRIM(p_username));

  IF NOT FOUND THEN
    -- Mitigate timing attacks
    PERFORM extensions.crypt('dummy_password_timing_mitigation', '$2b$10$' || repeat('x', 53));
    RAISE EXCEPTION 'Invalid username or password.';
  END IF;

  -- Check brute force lockout
  IF v_row.locked_until IS NOT NULL AND v_row.locked_until > NOW() THEN
    RAISE EXCEPTION 'Account temporarily locked. Please try again in % seconds.',
      GREATEST(1, EXTRACT(EPOCH FROM (v_row.locked_until - NOW()))::INTEGER);
  END IF;

  -- Detect hash format
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
    -- Increment failed attempts and apply 60-second lockout after 5 consecutive failures
    UPDATE user_profiles
    SET failed_login_attempts = COALESCE(failed_login_attempts, 0) + 1,
        locked_until = CASE
          WHEN COALESCE(failed_login_attempts, 0) + 1 >= 5 THEN NOW() + INTERVAL '60 seconds'
          ELSE NULL
        END
    WHERE id = v_row.id;

    RAISE EXCEPTION 'Invalid username or password.';
  END IF;

  -- Reset lockout on successful authentication
  UPDATE user_profiles
  SET failed_login_attempts = 0,
      locked_until = NULL
  WHERE id = v_row.id;

  -- Generate 256-bit cryptographically secure session token
  v_raw_token := encode(extensions.gen_random_bytes(32), 'hex');
  v_token_hash := encode(extensions.digest(v_raw_token, 'sha256'), 'hex');

  -- Store session token hash
  INSERT INTO user_sessions (user_id, session_token_hash, expires_at)
  VALUES (v_row.id, v_token_hash, NOW() + INTERVAL '30 days');

  -- Return sanitized account payload + raw session token for the client
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


-- 5. SECURE REGISTER FUNCTION
-- Enforces username format, minimum 8-char password, server-side bcrypt, and issues session token
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

  -- Validate username length and character set
  IF LENGTH(v_clean_user) < 3 OR LENGTH(v_clean_user) > 20 THEN
    RAISE EXCEPTION 'Username must be between 3 and 20 characters.';
  END IF;

  IF NOT (v_clean_user ~ '^[a-zA-Z0-9_-]+$') THEN
    RAISE EXCEPTION 'Username may only contain letters, numbers, underscores, and dashes.';
  END IF;

  -- Validate password policy (minimum 8 characters)
  IF LENGTH(p_password) < 8 THEN
    RAISE EXCEPTION 'Password must be at least 8 characters.';
  END IF;

  IF EXISTS (SELECT 1 FROM user_profiles WHERE LOWER(username) = LOWER(v_clean_user)) THEN
    RAISE EXCEPTION 'Username is already taken.';
  END IF;

  -- Hash server-side with bcrypt factor 10
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

  -- Issue session token immediately
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


-- 6. SECURE RESTORE SESSION FUNCTION
-- Cryptographically validates session token hash against user_sessions table
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

  -- Fetch user profile
  SELECT * INTO v_row
  FROM user_profiles
  WHERE id = v_session.user_id;

  IF NOT FOUND THEN
    DELETE FROM user_sessions WHERE id = v_session.id;
    RETURN NULL;
  END IF;

  -- Update activity timestamp
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


-- 7. SECURE LOGOUT FUNCTION
-- Invalidates the session token on the server
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


-- 8. SECURE UPDATE PROFILE FUNCTION
-- Validates current password, enforces minimum 8 chars for new password,
-- and revokes old sessions on password change
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

  -- Validate new username if provided
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

  -- Validate new password if provided
  IF p_new_password IS NOT NULL THEN
    IF LENGTH(p_new_password) < 8 THEN
      RAISE EXCEPTION 'New password must be at least 8 characters.';
    END IF;
    v_new_hash := extensions.crypt(p_new_password, extensions.gen_salt('bf', 10));

    -- Invalidate existing sessions on password change to secure the account
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


-- 9. SECURE DELETE ACCOUNT FUNCTION
-- Validates password and cascades deletion of user profile and all sessions
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

  -- Delete all active sessions
  DELETE FROM user_sessions WHERE user_id = v_row.id;

  -- Delete user profile
  DELETE FROM user_profiles WHERE id = v_row.id;

  RETURN jsonb_build_object('success', true);
END;
$$;

GRANT EXECUTE ON FUNCTION delete_own_account_fn(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION delete_own_account_fn(TEXT, TEXT) TO authenticated;


-- 10. GUEST DATA CLEANUP / STALE ROOMS FLUSH SCRIPT
DELETE FROM realtime_rooms 
WHERE updated_at < NOW() - INTERVAL '24 hours' 
   OR state->>'status' = 'FINISHED';
