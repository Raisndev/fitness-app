import { supabase } from './client';
import { Routine, RoutineExercise } from '@/types';

export async function fetchRoutines(): Promise<Routine[]> {
  const { data, error } = await supabase
    .from('routines')
    .select(`
      *,
      routine_exercises (
        *,
        exercise:exercises (*)
      )
    `)
    .order('sort_order')
    .order('sort_order', { referencedTable: 'routine_exercises' });
  if (error) throw error;
  return data as Routine[];
}

export async function fetchRoutine(id: string): Promise<Routine> {
  const { data, error } = await supabase
    .from('routines')
    .select(`
      *,
      routine_exercises (
        *,
        exercise:exercises (*)
      )
    `)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Routine;
}

export async function createRoutine(
  name: string,
  description?: string,
  estimatedDuration?: number
): Promise<Routine> {
  const { data, error } = await supabase
    .from('routines')
    .insert({ name, description, estimated_duration_minutes: estimatedDuration })
    .select()
    .single();
  if (error) throw error;
  return data as Routine;
}

export async function updateRoutine(
  id: string,
  updates: Partial<Pick<Routine, 'name' | 'description' | 'estimated_duration_minutes'>>
): Promise<Routine> {
  const { data, error } = await supabase
    .from('routines')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as Routine;
}

export async function deleteRoutine(id: string): Promise<void> {
  const { error } = await supabase.from('routines').delete().eq('id', id);
  if (error) throw error;
}

export async function upsertRoutineExercises(
  routineId: string,
  exercises: Array<Omit<RoutineExercise, 'id' | 'exercise'>>
): Promise<void> {
  // Delete existing and re-insert to simplify reordering
  await supabase.from('routine_exercises').delete().eq('routine_id', routineId);

  if (exercises.length === 0) return;

  const { error } = await supabase.from('routine_exercises').insert(
    exercises.map((ex, idx) => ({ ...ex, routine_id: routineId, sort_order: idx }))
  );
  if (error) throw error;
}
