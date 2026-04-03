-- ============================================================
-- FitTrack - Dedicated equipment table + exercise media fields
-- ============================================================

-- 1. Equipment catalogue
CREATE TABLE public.equipment (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug        TEXT NOT NULL UNIQUE,   -- 'barbell', 'dumbbell', etc.
  name        TEXT NOT NULL,          -- display name (localizable later)
  icon_name   TEXT                    -- Ionicons glyph name
);

INSERT INTO public.equipment (slug, name, icon_name) VALUES
  ('barbell',    'Barra',          'barbell-outline'),
  ('dumbbell',   'Mancuernas',     'fitness-outline'),
  ('machine',    'Máquina',        'hardware-chip-outline'),
  ('bodyweight', 'Peso corporal',  'body-outline'),
  ('cable',      'Cable',          'git-branch-outline'),
  ('kettlebell', 'Kettlebell',     'nuclear-outline'),
  ('band',       'Banda elástica', 'remove-outline'),
  ('other',      'Otro',           'ellipsis-horizontal-outline');

-- 2. Add equipment_id FK to exercises
ALTER TABLE public.exercises
  ADD COLUMN equipment_id UUID REFERENCES public.equipment(id) ON DELETE SET NULL;

-- 3. Migrate existing text slug → FK
UPDATE public.exercises e
SET equipment_id = eq.id
FROM public.equipment eq
WHERE e.equipment = eq.slug;

CREATE INDEX idx_exercises_equipment_id ON public.exercises(equipment_id);

-- 4. Add media fields
ALTER TABLE public.exercises
  ADD COLUMN video_url     TEXT,   -- YouTube / Vimeo URL or direct mp4
  ADD COLUMN image_url     TEXT,   -- full-size demo image
  ADD COLUMN thumbnail_url TEXT;   -- small preview (≈120×120)

-- 5. RLS: equipment is read-only for all authenticated users
ALTER TABLE public.equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "equipment_select_all"
  ON public.equipment FOR SELECT
  USING (true);

-- 6. Supabase Storage bucket (run manually in dashboard or via CLI)
-- Bucket name: exercise-media
-- Public: false (serve via signed URLs or RLS)
-- Suggested paths:
--   images/      {exercise_id}.jpg
--   thumbnails/  {exercise_id}.jpg
