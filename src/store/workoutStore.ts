import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ActiveExercise, ActiveSet, Exercise } from '@/types';
import {
  createWorkoutSession,
  addExerciseToSession,
  logSet,
  finalizeSession,
} from '@/services/supabase/workouts';

const STORAGE_KEY = 'fittrack_active_workout';

interface WorkoutState {
  sessionId: string | null;
  sessionName: string;
  routineId: string | null;
  startedAt: Date | null;
  exercises: ActiveExercise[];
  isActive: boolean;
  elapsedSeconds: number;

  // Actions
  startWorkout: (name: string, routineId?: string) => Promise<void>;
  addExercise: (exercise: Exercise) => Promise<void>;
  addSet: (exerciseLocalId: string) => void;
  updateSet: (exerciseLocalId: string, setLocalId: string, updates: Partial<ActiveSet>) => void;
  completeSet: (exerciseLocalId: string, setLocalId: string) => Promise<void>;
  removeSet: (exerciseLocalId: string, setLocalId: string) => void;
  removeExercise: (exerciseLocalId: string) => void;
  finishWorkout: () => Promise<string>; // returns sessionId
  discardWorkout: () => void;
  tickTimer: () => void;
  restoreFromStorage: () => Promise<void>;
}

function generateLocalId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export const useWorkoutStore = create<WorkoutState>((set, get) => ({
  sessionId: null,
  sessionName: '',
  routineId: null,
  startedAt: null,
  exercises: [],
  isActive: false,
  elapsedSeconds: 0,

  startWorkout: async (name, routineId) => {
    const session = await createWorkoutSession(name, routineId);
    const state = {
      sessionId: session.id,
      sessionName: name,
      routineId: routineId ?? null,
      startedAt: new Date(),
      exercises: [],
      isActive: true,
      elapsedSeconds: 0,
    };
    set(state);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },

  addExercise: async (exercise) => {
    const { sessionId, exercises } = get();
    if (!sessionId) return;

    const sortOrder = exercises.length;
    const dbExercise = await addExerciseToSession(sessionId, exercise.id, sortOrder);

    const newExercise: ActiveExercise = {
      localId: generateLocalId(),
      dbId: dbExercise.id,
      exercise,
      sets: [],
      sortOrder,
    };

    set((state) => ({ exercises: [...state.exercises, newExercise] }));
    get()._persist();
  },

  addSet: (exerciseLocalId) => {
    set((state) => ({
      exercises: state.exercises.map((ex) => {
        if (ex.localId !== exerciseLocalId) return ex;
        const setNumber = ex.sets.length + 1;
        const prevDone = ex.sets.filter((s) => s.isDone);
        const lastDone = prevDone[prevDone.length - 1];
        const newSet: ActiveSet = {
          localId: generateLocalId(),
          setNumber,
          reps: lastDone?.reps ?? '',
          weightKg: lastDone?.weightKg ?? '',
          isWarmup: false,
          isDone: false,
          isPersonalRecord: false,
        };
        return { ...ex, sets: [...ex.sets, newSet] };
      }),
    }));
    get()._persist();
  },

  updateSet: (exerciseLocalId, setLocalId, updates) => {
    set((state) => ({
      exercises: state.exercises.map((ex) => {
        if (ex.localId !== exerciseLocalId) return ex;
        return {
          ...ex,
          sets: ex.sets.map((s) =>
            s.localId === setLocalId ? { ...s, ...updates } : s
          ),
        };
      }),
    }));
  },

  completeSet: async (exerciseLocalId, setLocalId) => {
    const { exercises } = get();
    const ex = exercises.find((e) => e.localId === exerciseLocalId);
    const set_ = ex?.sets.find((s) => s.localId === setLocalId);
    if (!ex?.dbId || !set_) return;

    const dbSet = await logSet(
      ex.dbId,
      set_.setNumber,
      set_.reps ? parseInt(set_.reps) : null,
      set_.weightKg ? parseFloat(set_.weightKg) : null,
      set_.isWarmup
    );

    set((state) => ({
      exercises: state.exercises.map((e) => {
        if (e.localId !== exerciseLocalId) return e;
        return {
          ...e,
          sets: e.sets.map((s) =>
            s.localId === setLocalId
              ? { ...s, isDone: true, dbId: dbSet.id, isPersonalRecord: dbSet.is_personal_record }
              : s
          ),
        };
      }),
    }));
    get()._persist();
  },

  removeSet: (exerciseLocalId, setLocalId) => {
    set((state) => ({
      exercises: state.exercises.map((ex) => {
        if (ex.localId !== exerciseLocalId) return ex;
        const filtered = ex.sets.filter((s) => s.localId !== setLocalId);
        return { ...ex, sets: filtered.map((s, i) => ({ ...s, setNumber: i + 1 })) };
      }),
    }));
    get()._persist();
  },

  removeExercise: (exerciseLocalId) => {
    set((state) => ({
      exercises: state.exercises.filter((ex) => ex.localId !== exerciseLocalId),
    }));
    get()._persist();
  },

  finishWorkout: async () => {
    const { sessionId } = get();
    if (!sessionId) throw new Error('No active session');
    await finalizeSession(sessionId);
    const id = sessionId;
    set({
      sessionId: null,
      sessionName: '',
      routineId: null,
      startedAt: null,
      exercises: [],
      isActive: false,
      elapsedSeconds: 0,
    });
    await AsyncStorage.removeItem(STORAGE_KEY);
    return id;
  },

  discardWorkout: () => {
    set({
      sessionId: null,
      sessionName: '',
      routineId: null,
      startedAt: null,
      exercises: [],
      isActive: false,
      elapsedSeconds: 0,
    });
    AsyncStorage.removeItem(STORAGE_KEY);
  },

  tickTimer: () => {
    set((state) => ({ elapsedSeconds: state.elapsedSeconds + 1 }));
  },

  restoreFromStorage: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const saved = JSON.parse(raw);
      set({
        ...saved,
        startedAt: saved.startedAt ? new Date(saved.startedAt) : null,
        isActive: !!saved.sessionId,
      });
    } catch {
      await AsyncStorage.removeItem(STORAGE_KEY);
    }
  },

  // Internal persist helper
  _persist: () => {
    const { sessionId, sessionName, routineId, startedAt, exercises, elapsedSeconds } = get();
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ sessionId, sessionName, routineId, startedAt, exercises, elapsedSeconds })
    ).catch(console.error);
  },
} as WorkoutState & { _persist: () => void }));
