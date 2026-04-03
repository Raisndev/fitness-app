-- ============================================================
-- FitTrack - Row Level Security Policies
-- ============================================================

ALTER TABLE public.profiles           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routines           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_exercises  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records   ENABLE ROW LEVEL SECURITY;

-- Profiles: own row only
CREATE POLICY "profiles_own"
  ON public.profiles FOR ALL
  USING (auth.uid() = id);

-- Exercises: global visible to all; custom only to owner
CREATE POLICY "exercises_select"
  ON public.exercises FOR SELECT
  USING (is_global = true OR created_by = auth.uid());

CREATE POLICY "exercises_insert"
  ON public.exercises FOR INSERT
  WITH CHECK (created_by = auth.uid() AND is_global = false);

CREATE POLICY "exercises_update"
  ON public.exercises FOR UPDATE
  USING (created_by = auth.uid() AND is_global = false);

CREATE POLICY "exercises_delete"
  ON public.exercises FOR DELETE
  USING (created_by = auth.uid() AND is_global = false);

-- Routines: strict ownership
CREATE POLICY "routines_own"
  ON public.routines FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Routine exercises: via parent routine ownership
CREATE POLICY "routine_exercises_own"
  ON public.routine_exercises FOR ALL
  USING (
    routine_id IN (SELECT id FROM public.routines WHERE user_id = auth.uid())
  )
  WITH CHECK (
    routine_id IN (SELECT id FROM public.routines WHERE user_id = auth.uid())
  );

-- Workout sessions: strict ownership
CREATE POLICY "workout_sessions_own"
  ON public.workout_sessions FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Workout exercises: via parent session ownership
CREATE POLICY "workout_exercises_own"
  ON public.workout_exercises FOR ALL
  USING (
    session_id IN (SELECT id FROM public.workout_sessions WHERE user_id = auth.uid())
  )
  WITH CHECK (
    session_id IN (SELECT id FROM public.workout_sessions WHERE user_id = auth.uid())
  );

-- Workout sets: via workout_exercise → session → user
CREATE POLICY "workout_sets_own"
  ON public.workout_sets FOR ALL
  USING (
    workout_exercise_id IN (
      SELECT we.id FROM public.workout_exercises we
      JOIN public.workout_sessions ws ON ws.id = we.session_id
      WHERE ws.user_id = auth.uid()
    )
  )
  WITH CHECK (
    workout_exercise_id IN (
      SELECT we.id FROM public.workout_exercises we
      JOIN public.workout_sessions ws ON ws.id = we.session_id
      WHERE ws.user_id = auth.uid()
    )
  );

-- Personal records: strict ownership
CREATE POLICY "personal_records_own"
  ON public.personal_records FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
