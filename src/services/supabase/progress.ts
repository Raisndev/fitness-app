import { supabase } from './client';
import { VolumeDataPoint, PersonalRecord, ProgressPeriod } from '@/types';
import dayjs from 'dayjs';

function getPeriodDates(period: ProgressPeriod): { start: string; end: string; interval: string } {
  const end = dayjs().toISOString();
  const intervalMap: Record<ProgressPeriod, { amount: number; unit: dayjs.ManipulateType; interval: string }> = {
    '1W': { amount: 1, unit: 'week', interval: 'day' },
    '1M': { amount: 1, unit: 'month', interval: 'week' },
    '3M': { amount: 3, unit: 'month', interval: 'week' },
    '1Y': { amount: 1, unit: 'year', interval: 'month' },
    'ALL': { amount: 10, unit: 'year', interval: 'month' },
  };
  const { amount, unit, interval } = intervalMap[period];
  return { start: dayjs().subtract(amount, unit).toISOString(), end, interval };
}

export async function fetchVolumeByPeriod(
  exerciseId: string,
  period: ProgressPeriod
): Promise<VolumeDataPoint[]> {
  const { start, end, interval } = getPeriodDates(period);
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase.rpc('get_volume_by_period', {
    p_user_id: user.id,
    p_exercise_id: exerciseId,
    p_start: start,
    p_end: end,
    p_interval: interval,
  });
  if (error) throw error;
  return data as VolumeDataPoint[];
}

export async function fetchPersonalRecords(): Promise<PersonalRecord[]> {
  const { data, error } = await supabase
    .from('personal_records')
    .select('*, exercise:exercises(*)')
    .eq('record_type', '1rm_estimated')
    .order('achieved_at', { ascending: false });
  if (error) throw error;
  return data as PersonalRecord[];
}

export async function fetchPersonalRecordForExercise(
  exerciseId: string
): Promise<PersonalRecord | null> {
  const { data, error } = await supabase
    .from('personal_records')
    .select('*')
    .eq('exercise_id', exerciseId)
    .eq('record_type', '1rm_estimated')
    .maybeSingle();
  if (error) throw error;
  return data as PersonalRecord | null;
}

export async function fetchWeeklyStats(): Promise<{
  sessionsThisWeek: number;
  totalVolumeThisWeek: number;
  streak: number;
}> {
  const weekStart = dayjs().startOf('week').toISOString();

  const { data, error } = await supabase
    .from('workout_sessions')
    .select('id, total_volume_kg, started_at')
    .not('finished_at', 'is', null)
    .gte('started_at', weekStart)
    .order('started_at', { ascending: false });

  if (error) throw error;

  const sessionsThisWeek = data.length;
  const totalVolumeThisWeek = data.reduce((acc, s) => acc + (s.total_volume_kg ?? 0), 0);

  // Simple streak: count consecutive days with at least one workout
  const { data: allSessions } = await supabase
    .from('workout_sessions')
    .select('started_at')
    .not('finished_at', 'is', null)
    .order('started_at', { ascending: false })
    .limit(90);

  let streak = 0;
  if (allSessions && allSessions.length > 0) {
    const days = new Set(allSessions.map((s) => dayjs(s.started_at).format('YYYY-MM-DD')));
    let current = dayjs();
    while (days.has(current.format('YYYY-MM-DD'))) {
      streak++;
      current = current.subtract(1, 'day');
    }
  }

  return { sessionsThisWeek, totalVolumeThisWeek, streak };
}
