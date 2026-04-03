import { supabase } from './client';
import { Exercise } from '@/types';

export async function fetchExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .order('name');
  if (error) throw error;
  return data as Exercise[];
}

export async function searchExercises(query: string): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .ilike('name', `%${query}%`)
    .order('name')
    .limit(30);
  if (error) throw error;
  return data as Exercise[];
}

export async function fetchExercisesByCategory(category: string): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select('*')
    .eq('category', category)
    .order('name');
  if (error) throw error;
  return data as Exercise[];
}

export async function createCustomExercise(
  exercise: Omit<Exercise, 'id' | 'created_at' | 'is_global' | 'created_by'>
): Promise<Exercise> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('exercises')
    .insert({ ...exercise, is_global: false, created_by: user.id })
    .select()
    .single();
  if (error) throw error;
  return data as Exercise;
}
