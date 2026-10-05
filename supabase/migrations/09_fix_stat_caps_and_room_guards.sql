-- ==============================================================================
-- QUIZ//ARENA: STAT CAPS & REALTIME ROOM INTEGRITY HARDENING
-- Migration: 09_fix_stat_caps_and_room_guards.sql
--
-- FIXES APPLIED:
--   1. [BUG-02] Raise per-call total_score cap in increment_user_stat_fn from
--               1,600 to 4,000 to accommodate legitimate Tier 10 question XP
--               (which can reach up to 3,800 XP per question).
--   2. [BUG-04] Harden validate_room_state_fn on realtime_rooms to enforce
--               strict score bounds ([0, 500000]) and correct answer bounds ([0, 300])
--               on all players, preventing client-side score injection attacks.
--
-- HOW TO RUN:
--   Paste this into your Supabase SQL Editor and click RUN.
-- ==============================================================================

-- ─── 1. Update increment_user_stat_fn with 4,000 XP cap ─────────────────────
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
  -- Whitelist column
  IF NOT (p_stat_col = ANY(v_allowed_cols)) THEN
    RAISE EXCEPTION 'Invalid stat column: %', p_stat_col;
  END IF;

  -- Cap per-call amount to sane maximums (Bug 2 fix: 4000 max XP per question)
  v_max_amount := CASE p_stat_col
    WHEN 'total_score'     THEN 4000   -- max base (1000) + time bonus (500) + streak (500) * 1.9 multiplier = 3800 XP
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


-- ─── 2. Harden validate_room_state_fn on realtime_rooms ─────────────────────
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
  -- 1. Validate status field
  v_status := v_state->>'status';
  IF v_status IS NOT NULL AND NOT (v_status = ANY(v_valid_statuses)) THEN
    RAISE EXCEPTION 'Invalid room status: %', v_status;
  END IF;

  -- 2. Validate player count bounds
  v_player_count := jsonb_array_length(v_state->'players');
  IF v_player_count > COALESCE((v_state->>'maxPlayers')::INTEGER, 4) THEN
    RAISE EXCEPTION 'Player count % exceeds maxPlayers', v_player_count;
  END IF;

  -- 3. Validate sanity bounds on all players in the room (Bug 4 fix: prevent score injection)
  FOR v_player IN SELECT * FROM jsonb_array_elements(v_state->'players') LOOP
    v_player_score := COALESCE((v_player->>'score')::INTEGER, 0);
    v_correct_answers := COALESCE((v_player->>'correctAnswers')::INTEGER, 0);

    -- Reject negative scores or outrageous fabricated scores (> 500,000)
    IF v_player_score < 0 OR v_player_score > 500000 THEN
      RAISE EXCEPTION 'Player score % is out of valid bounds [0, 500000]', v_player_score;
    END IF;

    -- Reject invalid correct answers count
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
