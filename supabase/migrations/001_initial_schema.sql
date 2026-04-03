-- ============================================================
-- FitTrack - Initial Schema
-- ============================================================

-- Profiles (extends auth.users)
CREATE TABLE public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT UNIQUE,
  full_name       TEXT,
  avatar_url      TEXT,
  unit_system     TEXT NOT NULL DEFAULT 'metric' CHECK (unit_system IN ('metric', 'imperial')),
  healthkit_sync  BOOLEAN NOT NULL DEFAULT false,
  weekly_goal     INT NOT NULL DEFAULT 4,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Exercise library (global + user custom)
CREATE TABLE public.exercises (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  category        TEXT NOT NULL CHECK (category IN ('chest','back','legs','shoulders','arms','core','cardio')),
  muscle_group    TEXT[] NOT NULL DEFAULT '{}',
  equipment       TEXT CHECK (equipment IN ('barbell','dumbbell','machine','bodyweight','cable','kettlebell','band','other')),
  instructions    TEXT,
  is_global       BOOLEAN NOT NULL DEFAULT false,
  created_by      UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_exercises_category ON public.exercises(category);
CREATE INDEX idx_exercises_created_by ON public.exercises(created_by);
CREATE INDEX idx_exercises_name ON public.exercises(lower(name));

-- Routines
CREATE TABLE public.routines (
  id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name                        TEXT NOT NULL,
  description                 TEXT,
  estimated_duration_minutes  INT,
  sort_order                  INT NOT NULL DEFAULT 0,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_routines_user_id ON public.routines(user_id);

-- Exercises in a routine
CREATE TABLE public.routine_exercises (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  routine_id      UUID NOT NULL REFERENCES public.routines(id) ON DELETE CASCADE,
  exercise_id     UUID NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
  sort_order      INT NOT NULL DEFAULT 0,
  target_sets     INT,
  target_reps     INT,
  target_weight   NUMERIC(7,2),
  rest_seconds    INT NOT NULL DEFAULT 90,
  notes           TEXT
);

CREATE INDEX idx_routine_exercises_routine_id ON public.routine_exercises(routine_id);

-- Workout sessions
CREATE TABLE public.workout_sessions (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  routine_id          UUID REFERENCES public.routines(id) ON DELETE SET NULL,
  name                TEXT NOT NULL,
  started_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at         TIMESTAMPTZ,
  duration_seconds    INT,
  total_volume_kg     NUMERIC(10,2),
  notes               TEXT,
  healthkit_sync_id   TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_started_at ON public.workout_sessions(started_at DESC);

-- Exercises in a session
CREATE TABLE public.workout_exercises (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id      UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
  exercise_id     UUID NOT NULL REFERENCES public.exercises(id) ON DELETE RESTRICT,
  sort_order      INT NOT NULL DEFAULT 0,
  notes           TEXT
);

CREATE INDEX idx_workout_exercises_session_id ON public.workout_exercises(session_id);

-- Sets logged in a session
CREATE TABLE public.workout_sets (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_exercise_id     UUID NOT NULL REFERENCES public.workout_exercises(id) ON DELETE CASCADE,
  set_number              INT NOT NULL,
  reps                    INT,
  weight_kg               NUMERIC(7,2),
  duration_seconds        INT,
  rpe                     NUMERIC(3,1) CHECK (rpe BETWEEN 1 AND 10),
  is_warmup               BOOLEAN NOT NULL DEFAULT false,
  is_personal_record      BOOLEAN NOT NULL DEFAULT false,
  completed_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_workout_sets_workout_exercise_id ON public.workout_sets(workout_exercise_id);

-- Personal records (maintained by trigger)
CREATE TABLE public.personal_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id     UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
  record_type     TEXT NOT NULL CHECK (record_type IN ('1rm_estimated','max_weight','max_reps','max_volume')),
  value           NUMERIC(10,2) NOT NULL,
  achieved_at     TIMESTAMPTZ NOT NULL,
  set_id          UUID REFERENCES public.workout_sets(id) ON DELETE SET NULL,
  UNIQUE(user_id, exercise_id, record_type)
);

CREATE INDEX idx_personal_records_user_id ON public.personal_records(user_id);
CREATE INDEX idx_personal_records_exercise_id ON public.personal_records(exercise_id);
