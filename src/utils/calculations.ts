/** Epley formula: estimated 1RM from weight and reps */
export function estimate1RM(weightKg: number, reps: number): number {
  if (reps <= 0 || weightKg <= 0) return 0;
  if (reps === 1) return weightKg;
  return parseFloat((weightKg * (1 + reps / 30)).toFixed(1));
}

/** Total volume = sum(weight * reps) for all non-warmup sets */
export function calculateVolume(
  sets: Array<{ weight_kg: number | null; reps: number | null; is_warmup: boolean }>
): number {
  return sets.reduce((acc, s) => {
    if (s.is_warmup || !s.weight_kg || !s.reps) return acc;
    return acc + s.weight_kg * s.reps;
  }, 0);
}

/** Returns percentage of weekly goal achieved */
export function weeklyGoalProgress(completed: number, goal: number): number {
  return Math.min(1, completed / goal);
}

/** Formats a 1RM estimate for display */
export function format1RM(value: number, unit: 'metric' | 'imperial'): string {
  const display = unit === 'imperial' ? value * 2.20462 : value;
  const suffix = unit === 'imperial' ? 'lb' : 'kg';
  return `${display.toFixed(1)} ${suffix}`;
}
