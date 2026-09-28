-- QUIZ//ARENA AUTHORITATIVE STORED PROCEDURES

-- 1. Start Game Procedure (Enforces player bounds, calculates length, inserts unique questions)
CREATE OR REPLACE FUNCTION start_game_fn(p_room_id UUID, p_host_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_player_count INT;
  v_calc_questions INT;
  v_topic_id TEXT;
  v_difficulty_level INT;
  v_room_status TEXT;
BEGIN
  -- Verify room and host
  SELECT status, topic_id, difficulty_level
  INTO v_room_status, v_topic_id, v_difficulty_level
  FROM rooms
  WHERE id = p_room_id AND host_id = p_host_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Room not found or unauthorized host.';
  END IF;

  IF v_room_status != 'LOBBY' THEN
    RAISE EXCEPTION 'Game can only be started from LOBBY state.';
  END IF;

  -- Count confirmed players
  SELECT COUNT(*) INTO v_player_count
  FROM room_players
  WHERE room_id = p_room_id;

  IF v_player_count < 2 THEN
    RAISE EXCEPTION 'Minimum 2 players required to commence the match.';
  END IF;

  IF v_player_count > 4 THEN
    RAISE EXCEPTION 'Maximum 4 players allowed in an arena.';
  END IF;

  -- Calculate match question count
  IF v_player_count = 2 THEN
    v_calc_questions := 10;
  ELSIF v_player_count = 3 THEN
    v_calc_questions := 12;
  ELSE
    v_calc_questions := 15;
  END IF;

  -- Clear any previous questions
  DELETE FROM game_questions WHERE room_id = p_room_id;

  -- Select and insert unique randomized questions
  INSERT INTO game_questions (room_id, question_id, question_order)
  SELECT p_room_id, q.id, ROW_NUMBER() OVER () - 1
  FROM (
    SELECT id
    FROM questions
    WHERE topic_id = v_topic_id AND level_number = v_difficulty_level
    ORDER BY RANDOM()
    LIMIT v_calc_questions
  ) q;

  -- Update room status
  UPDATE rooms
  SET
    status = 'QUESTION',
    player_count_at_start = v_player_count,
    calculated_question_count = v_calc_questions,
    current_question_index = 0,
    question_started_at = NOW(),
    updated_at = NOW()
  WHERE id = p_room_id;

  RETURN jsonb_build_object(
    'success', true,
    'player_count', v_player_count,
    'question_count', v_calc_questions
  );
END;
$$;

-- 2. Submit Answer Procedure (Atomic calculation, zero client trust)
CREATE OR REPLACE FUNCTION submit_answer_fn(
  p_room_id UUID,
  p_question_id UUID,
  p_player_id UUID,
  p_selected_option CHAR(1),
  p_response_time_ms INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_correct_opt CHAR(1);
  v_explanation TEXT;
  v_is_correct BOOLEAN;
  v_points INT := 0;
  v_time_bonus INT := 0;
  v_base_points INT := 1000;
  v_response_sec NUMERIC;
BEGIN
  -- Get correct answer from secure questions table
  SELECT correct_option, explanation
  INTO v_correct_opt, v_explanation
  FROM questions
  WHERE id = p_question_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Question not found.';
  END IF;

  v_is_correct := (p_selected_option = v_correct_opt);

  IF v_is_correct THEN
    v_response_sec := GREATEST(1, p_response_time_ms / 1000.0);
    v_time_bonus := GREATEST(0, FLOOR(500 - (v_response_sec * 20)));
    v_points := v_base_points + v_time_bonus;
  END IF;

  -- Record answer
  INSERT INTO answers (
    room_id,
    question_id,
    player_id,
    selected_option,
    is_correct,
    response_time_ms,
    points_awarded
  ) VALUES (
    p_room_id,
    p_question_id,
    p_player_id,
    p_selected_option,
    v_is_correct,
    p_response_time_ms,
    v_points
  );

  -- Update player score atomically
  UPDATE room_players
  SET
    score = score + v_points,
    correct_answers = correct_answers + (CASE WHEN v_is_correct THEN 1 ELSE 0 END),
    total_response_time_ms = total_response_time_ms + p_response_time_ms,
    last_seen_at = NOW()
  WHERE id = p_player_id;

  RETURN jsonb_build_object(
    'is_correct', v_is_correct,
    'correct_option', v_correct_opt,
    'points_awarded', v_points,
    'time_bonus', v_time_bonus,
    'explanation', v_explanation
  );
END;
$$;
