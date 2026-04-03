-- ============================================================
-- FitTrack - Functions and Triggers
-- ============================================================

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Finalize workout session: compute duration + total volume
CREATE OR REPLACE FUNCTION public.finalize_workout_session(p_session_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE public.workout_sessions
  SET
    finished_at      = NOW(),
    duration_seconds = EXTRACT(EPOCH FROM (NOW() - started_at))::INT,
    total_volume_kg  = (
      SELECT COALESCE(SUM(ws.weight_kg * ws.reps), 0)
      FROM public.workout_sets ws
      JOIN public.workout_exercises we ON we.id = ws.workout_exercise_id
      WHERE we.session_id = p_session_id
        AND ws.is_warmup = false
        AND ws.weight_kg IS NOT NULL
        AND ws.reps IS NOT NULL
    )
  WHERE id = p_session_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PR detection: update personal_records on set insert/update
CREATE OR REPLACE FUNCTION public.check_and_update_pr()
RETURNS TRIGGER AS $$
DECLARE
  v_user_id       UUID;
  v_exercise_id   UUID;
  v_estimated_1rm NUMERIC;
  v_current_pr    NUMERIC;
BEGIN
  -- Resolve user and exercise from parent tables
  SELECT ws.user_id, we.exercise_id
  INTO v_user_id, v_exercise_id
  FROM public.workout_exercises we
  JOIN public.workout_sessions ws ON ws.id = we.session_id
  WHERE we.id = NEW.workout_exercise_id;

  -- Skip warmup sets or sets without weight/reps
  IF NEW.is_warmup OR NEW.weight_kg IS NULL OR NEW.reps IS NULL OR NEW.reps <= 0 THEN
    RETURN NEW;
  END IF;

  -- Epley formula: estimated 1RM = weight × (1 + reps/30)
  v_estimated_1rm := NEW.weight_kg * (1 + NEW.reps::NUMERIC / 30);

  SELECT value INTO v_current_pr
  FROM public.personal_records
  WHERE user_id = v_user_id
    AND exercise_id = v_exercise_id
    AND record_type = '1rm_estimated';

  IF v_current_pr IS NULL OR v_estimated_1rm > v_current_pr THEN
    INSERT INTO public.personal_records
      (user_id, exercise_id, record_type, value, achieved_at, set_id)
    VALUES
      (v_user_id, v_exercise_id, '1rm_estimated', v_estimated_1rm, NOW(), NEW.id)
    ON CONFLICT (user_id, exercise_id, record_type)
    DO UPDATE SET
      value       = EXCLUDED.value,
      achieved_at = EXCLUDED.achieved_at,
      set_id      = EXCLUDED.set_id;

    NEW.is_personal_record := true;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_set_inserted_or_updated
  BEFORE INSERT OR UPDATE ON public.workout_sets
  FOR EACH ROW EXECUTE FUNCTION public.check_and_update_pr();

-- Progress aggregation RPC
CREATE OR REPLACE FUNCTION public.get_volume_by_period(
  p_user_id    UUID,
  p_exercise_id UUID,
  p_start      TIMESTAMPTZ,
  p_end        TIMESTAMPTZ,
  p_interval   TEXT DEFAULT 'week'
)
RETURNS TABLE (
  period          TIMESTAMPTZ,
  total_volume_kg NUMERIC,
  max_weight_kg   NUMERIC,
  total_reps      INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    DATE_TRUNC(p_interval, ws.started_at)         AS period,
    COALESCE(SUM(wset.weight_kg * wset.reps), 0)  AS total_volume_kg,
    COALESCE(MAX(wset.weight_kg), 0)               AS max_weight_kg,
    COALESCE(SUM(wset.reps), 0)::INT               AS total_reps
  FROM public.workout_sets wset
  JOIN public.workout_exercises we ON we.id = wset.workout_exercise_id
  JOIN public.workout_sessions ws  ON ws.id = we.session_id
  WHERE ws.user_id       = p_user_id
    AND we.exercise_id   = p_exercise_id
    AND ws.started_at    BETWEEN p_start AND p_end
    AND wset.is_warmup   = false
    AND wset.weight_kg   IS NOT NULL
    AND wset.reps        IS NOT NULL
  GROUP BY DATE_TRUNC(p_interval, ws.started_at)
  ORDER BY period;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- Updated_at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER routines_set_updated_at
  BEFORE UPDATE ON public.routines
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
