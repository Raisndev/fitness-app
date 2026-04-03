import { supabase } from './client';
import { Exercise, EquipmentRecord } from '@/types';

// ─── Equipment ───────────────────────────────────────────────────────────────

export async function fetchEquipment(): Promise<EquipmentRecord[]> {
  const { data, error } = await supabase
    .from('equipment')
    .select('*')
    .order('name');
  if (error) throw error;
  return data as EquipmentRecord[];
}

// ─── Exercises ───────────────────────────────────────────────────────────────

const EXERCISE_SELECT = `
  *,
  equipment_record:equipment(id, slug, name, icon_name)
`;

export async function fetchExercises(): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select(EXERCISE_SELECT)
    .order('name');
  if (error) throw error;
  return data as Exercise[];
}

export async function fetchExercise(id: string): Promise<Exercise> {
  const { data, error } = await supabase
    .from('exercises')
    .select(EXERCISE_SELECT)
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as Exercise;
}

export async function searchExercises(query: string): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select(EXERCISE_SELECT)
    .ilike('name', `%${query}%`)
    .order('name')
    .limit(30);
  if (error) throw error;
  return data as Exercise[];
}

export async function fetchExercisesByCategory(category: string): Promise<Exercise[]> {
  const { data, error } = await supabase
    .from('exercises')
    .select(EXERCISE_SELECT)
    .eq('category', category)
    .order('name');
  if (error) throw error;
  return data as Exercise[];
}

export async function createCustomExercise(
  exercise: Omit<Exercise, 'id' | 'created_at' | 'is_global' | 'created_by' | 'equipment_record'>
): Promise<Exercise> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('exercises')
    .insert({ ...exercise, is_global: false, created_by: user.id })
    .select(EXERCISE_SELECT)
    .single();
  if (error) throw error;
  return data as Exercise;
}

export async function updateExercise(
  id: string,
  updates: Partial<Pick<
    Exercise,
    'name' | 'category' | 'muscle_group' | 'equipment' | 'equipment_id' |
    'instructions' | 'video_url' | 'image_url' | 'thumbnail_url'
  >>
): Promise<Exercise> {
  const { data, error } = await supabase
    .from('exercises')
    .update(updates)
    .eq('id', id)
    .select(EXERCISE_SELECT)
    .single();
  if (error) throw error;
  return data as Exercise;
}

// ─── Storage helpers ──────────────────────────────────────────────────────────

const BUCKET = 'exercise-media';

/** Upload an image file and return its public URL. */
export async function uploadExerciseImage(
  exerciseId: string,
  type: 'images' | 'thumbnails',
  fileUri: string,
  mimeType: string = 'image/jpeg'
): Promise<string> {
  const path = `${type}/${exerciseId}.jpg`;
  const response = await fetch(fileUri);
  const blob = await response.blob();

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: mimeType, upsert: true });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
