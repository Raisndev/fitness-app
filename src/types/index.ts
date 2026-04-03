import { MuscleGroup, Equipment } from '@/constants/exercises';

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  unit_system: 'metric' | 'imperial';
  healthkit_sync: boolean;
  weekly_goal: number;
  created_at: string;
  updated_at: string;
}

// ─── Exercise ────────────────────────────────────────────────────────────────

export interface Exercise {
  id: string;
  name: string;
  category: MuscleGroup;
  muscle_group: string[];
  equipment: Equipment | null;
  instructions: string | null;
  is_global: boolean;
  created_by: string | null;
  created_at: string;
}

// ─── Routine ─────────────────────────────────────────────────────────────────

export interface Routine {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  estimated_duration_minutes: number | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  routine_exercises?: RoutineExercise[];
}

export interface RoutineExercise {
  id: string;
  routine_id: string;
  exercise_id: string;
  sort_order: number;
  target_sets: number | null;
  target_reps: number | null;
  target_weight: number | null;
  rest_seconds: number;
  notes: string | null;
  exercise?: Exercise;
}

// ─── Workout Session ─────────────────────────────────────────────────────────

export interface WorkoutSession {
  id: string;
  user_id: string;
  routine_id: string | null;
  name: string;
  started_at: string;
  finished_at: string | null;
  duration_seconds: number | null;
  total_volume_kg: number | null;
  notes: string | null;
  healthkit_sync_id: string | null;
  created_at: string;
  workout_exercises?: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: string;
  session_id: string;
  exercise_id: string;
  sort_order: number;
  notes: string | null;
  exercise?: Exercise;
  workout_sets?: WorkoutSet[];
}

export interface WorkoutSet {
  id: string;
  workout_exercise_id: string;
  set_number: number;
  reps: number | null;
  weight_kg: number | null;
  duration_seconds: number | null;
  rpe: number | null;
  is_warmup: boolean;
  is_personal_record: boolean;
  completed_at: string;
}

// ─── Active Workout (local state) ────────────────────────────────────────────

export interface ActiveSet {
  localId: string;
  dbId?: string;
  setNumber: number;
  reps: string;
  weightKg: string;
  isWarmup: boolean;
  isDone: boolean;
  isPersonalRecord: boolean;
}

export interface ActiveExercise {
  localId: string;
  dbId?: string;
  exercise: Exercise;
  sets: ActiveSet[];
  sortOrder: number;
}

// ─── Progress ────────────────────────────────────────────────────────────────

export interface VolumeDataPoint {
  period: string;
  total_volume_kg: number;
  max_weight_kg: number;
  total_reps: number;
}

export interface PersonalRecord {
  id: string;
  user_id: string;
  exercise_id: string;
  record_type: '1rm_estimated' | 'max_weight' | 'max_reps' | 'max_volume';
  value: number;
  achieved_at: string;
  exercise?: Exercise;
}

export type ProgressPeriod = '1W' | '1M' | '3M' | '1Y' | 'ALL';
