export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'legs'
  | 'shoulders'
  | 'arms'
  | 'core'
  | 'cardio';

export type Equipment =
  | 'barbell'
  | 'dumbbell'
  | 'machine'
  | 'bodyweight'
  | 'cable'
  | 'kettlebell'
  | 'band'
  | 'other';

export interface SeedExercise {
  name: string;
  category: MuscleGroup;
  muscle_group: string[];
  equipment: Equipment;
  is_global: true;
}

export const SEED_EXERCISES: SeedExercise[] = [
  // CHEST
  { name: 'Bench Press', category: 'chest', muscle_group: ['pectoralis_major', 'triceps', 'anterior_deltoid'], equipment: 'barbell', is_global: true },
  { name: 'Incline Bench Press', category: 'chest', muscle_group: ['pectoralis_major', 'anterior_deltoid'], equipment: 'barbell', is_global: true },
  { name: 'Dumbbell Fly', category: 'chest', muscle_group: ['pectoralis_major'], equipment: 'dumbbell', is_global: true },
  { name: 'Push-Up', category: 'chest', muscle_group: ['pectoralis_major', 'triceps'], equipment: 'bodyweight', is_global: true },
  { name: 'Cable Crossover', category: 'chest', muscle_group: ['pectoralis_major'], equipment: 'cable', is_global: true },
  { name: 'Dumbbell Bench Press', category: 'chest', muscle_group: ['pectoralis_major', 'triceps'], equipment: 'dumbbell', is_global: true },

  // BACK
  { name: 'Pull-Up', category: 'back', muscle_group: ['latissimus_dorsi', 'biceps'], equipment: 'bodyweight', is_global: true },
  { name: 'Barbell Row', category: 'back', muscle_group: ['latissimus_dorsi', 'rhomboids', 'biceps'], equipment: 'barbell', is_global: true },
  { name: 'Lat Pulldown', category: 'back', muscle_group: ['latissimus_dorsi', 'biceps'], equipment: 'cable', is_global: true },
  { name: 'Seated Cable Row', category: 'back', muscle_group: ['rhomboids', 'latissimus_dorsi'], equipment: 'cable', is_global: true },
  { name: 'Deadlift', category: 'back', muscle_group: ['erector_spinae', 'glutes', 'hamstrings'], equipment: 'barbell', is_global: true },
  { name: 'Dumbbell Row', category: 'back', muscle_group: ['latissimus_dorsi', 'rhomboids'], equipment: 'dumbbell', is_global: true },
  { name: 'Face Pull', category: 'back', muscle_group: ['rear_deltoid', 'rhomboids'], equipment: 'cable', is_global: true },

  // LEGS
  { name: 'Squat', category: 'legs', muscle_group: ['quadriceps', 'glutes', 'hamstrings'], equipment: 'barbell', is_global: true },
  { name: 'Romanian Deadlift', category: 'legs', muscle_group: ['hamstrings', 'glutes'], equipment: 'barbell', is_global: true },
  { name: 'Leg Press', category: 'legs', muscle_group: ['quadriceps', 'glutes'], equipment: 'machine', is_global: true },
  { name: 'Leg Curl', category: 'legs', muscle_group: ['hamstrings'], equipment: 'machine', is_global: true },
  { name: 'Leg Extension', category: 'legs', muscle_group: ['quadriceps'], equipment: 'machine', is_global: true },
  { name: 'Lunge', category: 'legs', muscle_group: ['quadriceps', 'glutes'], equipment: 'bodyweight', is_global: true },
  { name: 'Calf Raise', category: 'legs', muscle_group: ['calves'], equipment: 'machine', is_global: true },
  { name: 'Hip Thrust', category: 'legs', muscle_group: ['glutes', 'hamstrings'], equipment: 'barbell', is_global: true },
  { name: 'Bulgarian Split Squat', category: 'legs', muscle_group: ['quadriceps', 'glutes'], equipment: 'dumbbell', is_global: true },

  // SHOULDERS
  { name: 'Overhead Press', category: 'shoulders', muscle_group: ['anterior_deltoid', 'lateral_deltoid', 'triceps'], equipment: 'barbell', is_global: true },
  { name: 'Dumbbell Shoulder Press', category: 'shoulders', muscle_group: ['anterior_deltoid', 'lateral_deltoid'], equipment: 'dumbbell', is_global: true },
  { name: 'Lateral Raise', category: 'shoulders', muscle_group: ['lateral_deltoid'], equipment: 'dumbbell', is_global: true },
  { name: 'Front Raise', category: 'shoulders', muscle_group: ['anterior_deltoid'], equipment: 'dumbbell', is_global: true },
  { name: 'Arnold Press', category: 'shoulders', muscle_group: ['anterior_deltoid', 'lateral_deltoid'], equipment: 'dumbbell', is_global: true },

  // ARMS
  { name: 'Barbell Curl', category: 'arms', muscle_group: ['biceps'], equipment: 'barbell', is_global: true },
  { name: 'Dumbbell Curl', category: 'arms', muscle_group: ['biceps'], equipment: 'dumbbell', is_global: true },
  { name: 'Hammer Curl', category: 'arms', muscle_group: ['biceps', 'brachioradialis'], equipment: 'dumbbell', is_global: true },
  { name: 'Tricep Pushdown', category: 'arms', muscle_group: ['triceps'], equipment: 'cable', is_global: true },
  { name: 'Skull Crusher', category: 'arms', muscle_group: ['triceps'], equipment: 'barbell', is_global: true },
  { name: 'Tricep Dip', category: 'arms', muscle_group: ['triceps', 'chest'], equipment: 'bodyweight', is_global: true },
  { name: 'Preacher Curl', category: 'arms', muscle_group: ['biceps'], equipment: 'machine', is_global: true },

  // CORE
  { name: 'Plank', category: 'core', muscle_group: ['transverse_abdominis', 'rectus_abdominis'], equipment: 'bodyweight', is_global: true },
  { name: 'Crunch', category: 'core', muscle_group: ['rectus_abdominis'], equipment: 'bodyweight', is_global: true },
  { name: 'Russian Twist', category: 'core', muscle_group: ['obliques'], equipment: 'bodyweight', is_global: true },
  { name: 'Leg Raise', category: 'core', muscle_group: ['rectus_abdominis', 'hip_flexors'], equipment: 'bodyweight', is_global: true },
  { name: 'Cable Crunch', category: 'core', muscle_group: ['rectus_abdominis'], equipment: 'cable', is_global: true },
  { name: 'Ab Wheel Rollout', category: 'core', muscle_group: ['transverse_abdominis', 'rectus_abdominis'], equipment: 'other', is_global: true },

  // CARDIO
  { name: 'Running', category: 'cardio', muscle_group: ['cardiovascular'], equipment: 'other', is_global: true },
  { name: 'Cycling', category: 'cardio', muscle_group: ['cardiovascular', 'quadriceps'], equipment: 'machine', is_global: true },
  { name: 'Rowing', category: 'cardio', muscle_group: ['cardiovascular', 'back', 'arms'], equipment: 'machine', is_global: true },
  { name: 'Jump Rope', category: 'cardio', muscle_group: ['cardiovascular', 'calves'], equipment: 'other', is_global: true },
  { name: 'Elliptical', category: 'cardio', muscle_group: ['cardiovascular'], equipment: 'machine', is_global: true },
];

export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: 'Pecho',
  back: 'Espalda',
  legs: 'Piernas',
  shoulders: 'Hombros',
  arms: 'Brazos',
  core: 'Core',
  cardio: 'Cardio',
};

export const EQUIPMENT_LABELS: Record<Equipment, string> = {
  barbell: 'Barra',
  dumbbell: 'Mancuernas',
  machine: 'Máquina',
  bodyweight: 'Peso corporal',
  cable: 'Cable',
  kettlebell: 'Kettlebell',
  band: 'Banda',
  other: 'Otro',
};
