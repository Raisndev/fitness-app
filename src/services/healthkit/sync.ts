import { Platform } from 'react-native';
import { WorkoutSession } from '@/types';
import { updateSessionHealthKitId } from '@/services/supabase/workouts';

let AppleHealthKit: any = null;
if (Platform.OS === 'ios') {
  try {
    AppleHealthKit = require('react-native-health').default;
  } catch {
    // Not available in Expo Go
  }
}

// Maps to react-native-health workout types
const WORKOUT_TYPE = 'HKWorkoutActivityTypeTraditionalStrengthTraining';

export async function syncWorkoutToHealthKit(session: WorkoutSession): Promise<string | null> {
  if (!AppleHealthKit || Platform.OS !== 'ios') return null;
  if (!session.finished_at || !session.duration_seconds) return null;

  const options = {
    type: WORKOUT_TYPE,
    startDate: session.started_at,
    endDate: session.finished_at,
    duration: session.duration_seconds,
    energyBurned: estimateCalories(session.duration_seconds, session.total_volume_kg ?? 0),
    energyBurnedUnit: 'kilocalorie',
  };

  return new Promise((resolve) => {
    AppleHealthKit.saveWorkout(options, (err: Error, result: { sourceId?: string }) => {
      if (err) {
        console.error('HealthKit sync error:', err);
        resolve(null);
        return;
      }
      const healthKitId = result?.sourceId ?? null;
      if (healthKitId) {
        updateSessionHealthKitId(session.id, healthKitId).catch(console.error);
      }
      resolve(healthKitId);
    });
  });
}

/** Simple calorie estimate: ~5 kcal/min base + volume factor */
function estimateCalories(durationSeconds: number, totalVolumeKg: number): number {
  const minutes = durationSeconds / 60;
  const base = minutes * 5;
  const volumeFactor = totalVolumeKg * 0.01;
  return Math.round(base + volumeFactor);
}
