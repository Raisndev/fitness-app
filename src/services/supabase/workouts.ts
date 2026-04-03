import { supabase } from './client';
import { WorkoutSession, WorkoutExercise, WorkoutSet, ActiveExercise } from '@/types';

export async function createWorkoutSession(
  name: string,
  routineId?: string
): Promise<WorkoutSession> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .insert({ name, routine_id: routineId ?? null, started_at: new Date().toISOString() })
    .select()
    .single();
  if (error) throw error;
  return data as WorkoutSession;
}

export async function addExerciseToSession(
  sessionId: string,
  exerciseId: string,
  sortOrder: number
): Promise<WorkoutExercise> {
  const { data, error } = await supabase
    .from('workout_exercises')
    .insert({ session_id: sessionId, exercise_id: exerciseId, sort_order: sortOrder })
    .select('*, exercise:exercises(*)')
    .single();
  if (error) throw error;
  return data as WorkoutExercise;
}

export async function logSet(
  workoutExerciseId: string,
  setNumber: number,
  reps: number | null,
  weightKg: number | null,
  isWarmup: boolean,
  durationSeconds?: number
): Promise<WorkoutSet> {
  const { data, error } = await supabase
    .from('workout_sets')
    .insert({
      workout_exercise_id: workoutExerciseId,
      set_number: setNumber,
      reps,
      weight_kg: weightKg,
      is_warmup: isWarmup,
      duration_seconds: durationSeconds ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return data as WorkoutSet;
}

export async function finalizeSession(sessionId: string): Promise<WorkoutSession> {
  const { error: rpcError } = await supabase.rpc('finalize_workout_session', {
    p_session_id: sessionId,
  });
  if (rpcError) throw rpcError;

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .eq('id', sessionId)
    .single();
  if (error) throw error;
  return data as WorkoutSession;
}

export async function updateSessionHealthKitId(
  sessionId: string,
  healthKitId: string
): Promise<void> {
  const { error } = await supabase
    .from('workout_sessions')
    .update({ healthkit_sync_id: healthKitId })
    .eq('id', sessionId);
  if (error) throw error;
}

export async function fetchWorkoutHistory(limit = 20, offset = 0): Promise<WorkoutSession[]> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select('*')
    .not('finished_at', 'is', null)
    .order('started_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data as WorkoutSession[];
}

export async function fetchWorkoutSession(id: string): Promise<WorkoutSession> {
  const { data, error } = await supabase
    .from('workout_sessions')
    .select(`
      *,
      workout_exercises (
        *,
        exercise:exercises (*),
        workout_sets (*)
      )
    `)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as WorkoutSession;
}

export async function deleteWorkoutSession(id: string): Promise<void> {
  const { error } = await supabase.from('workout_sessions').delete().eq('id', id);
  if (error) throw error;
}

/** Bulk sync active exercises to DB (used for crash recovery). */
export async function syncActiveExercises(
  sessionId: string,
  exercises: ActiveExercise[]
): Promise<void> {
  for (const ex of exercises) {
    if (!ex.dbId) continue;
    const doneSets = ex.sets.filter((s) => s.isDone && !s.dbId);
    for (const set of doneSets) {
      await logSet(
        ex.dbId,
        set.setNumber,
        set.reps ? parseInt(set.reps) : null,
        set.weightKg ? parseFloat(set.weightKg) : null,
        set.isWarmup
      );
    }
  }
}
