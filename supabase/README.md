# FitTrack — Supabase Setup

## Quick Start

### 1. Create a Supabase project
Go to [supabase.com](https://supabase.com) and create a new project.

### 2. Copy credentials
Copy your project URL and anon key to the `.env` file:

```
EXPO_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run migrations
In Supabase SQL Editor, run each migration in order:

1. `001_initial_schema.sql` — tables and indexes
2. `002_rls_policies.sql` — row-level security
3. `003_functions_and_triggers.sql` — functions, triggers, RPCs
4. `004_seed_exercises.sql` — global exercise library
5. `005_equipment_and_media.sql` — equipment table + media fields on exercises

### 4. Enable OAuth providers
In **Authentication > Providers**:
- Enable **Google** (add Web Client ID + Secret from Google Cloud Console)
- Enable **Apple** (requires Apple Developer account, Services ID, and key)

### 5. Configure redirect URLs
In **Authentication > URL Configuration**, add:
```
fittrack://auth/callback
```

### 4. Enable OAuth providers
In **Authentication > Providers**:
- Enable **Google** (add Web Client ID + Secret from Google Cloud Console)
- Enable **Apple** (requires Apple Developer account, Services ID, and key)

### 5. Configure redirect URLs
In **Authentication > URL Configuration**, add:
```
fittrack://auth/callback
```

### 6. Create Storage bucket for exercise media
In **Storage**, create a new bucket:
- **Name:** `exercise-media`
- **Public:** Yes (or use signed URLs for private)

Suggested folder structure inside the bucket:
```
exercise-media/
  images/       ← full-size demo image  ({exercise_id}.jpg)
  thumbnails/   ← small preview (~120×120) ({exercise_id}.jpg)
```

RLS policy for the bucket (paste in Storage > Policies):
```sql
-- Allow authenticated users to upload to their own exercise images
CREATE POLICY "exercise_media_upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'exercise-media' AND auth.role() = 'authenticated');

CREATE POLICY "exercise_media_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'exercise-media');
```

## Database Schema

| Table | Description |
|---|---|
| `profiles` | User profiles (extends auth.users) |
| `equipment` | Equipment catalogue (barbell, dumbbell, etc.) |
| `exercises` | Global + custom exercise library |
| `routines` | Reusable workout templates |
| `routine_exercises` | Exercises in a routine with targets |
| `workout_sessions` | Logged workout sessions |
| `workout_exercises` | Exercises performed in a session |
| `workout_sets` | Individual sets logged |
| `personal_records` | Auto-maintained PRs (via trigger) |

### Exercise media fields

| Column | Type | Description |
|---|---|---|
| `equipment_id` | UUID FK | Links to `equipment` table |
| `video_url` | TEXT | YouTube / Vimeo / direct mp4 URL |
| `image_url` | TEXT | Full-size demo image (Supabase Storage or external URL) |
| `thumbnail_url` | TEXT | Small preview shown in search list (~120×120) |

## RPCs

- `finalize_workout_session(p_session_id)` — computes duration + volume on finish
- `get_volume_by_period(...)` — aggregated volume for progress charts
