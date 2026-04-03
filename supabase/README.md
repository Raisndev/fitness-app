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

### 4. Enable OAuth providers
In **Authentication > Providers**:
- Enable **Google** (add Web Client ID + Secret from Google Cloud Console)
- Enable **Apple** (requires Apple Developer account, Services ID, and key)

### 5. Configure redirect URLs
In **Authentication > URL Configuration**, add:
```
fittrack://auth/callback
```

## Database Schema

| Table | Description |
|---|---|
| `profiles` | User profiles (extends auth.users) |
| `exercises` | Global + custom exercise library |
| `routines` | Reusable workout templates |
| `routine_exercises` | Exercises in a routine with targets |
| `workout_sessions` | Logged workout sessions |
| `workout_exercises` | Exercises performed in a session |
| `workout_sets` | Individual sets logged |
| `personal_records` | Auto-maintained PRs (via trigger) |

## RPCs

- `finalize_workout_session(p_session_id)` — computes duration + volume on finish
- `get_volume_by_period(...)` — aggregated volume for progress charts
