import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, Alert, TextInput,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { useWorkoutStore } from '@/store/workoutStore';
import { ExerciseCard } from '@/components/workout/ExerciseCard';
import { RestTimer } from '@/components/workout/RestTimer';
import { ExerciseSearchModal } from '@/components/workout/ExerciseSearchModal';
import { Button } from '@/components/ui/Button';
import { ActiveSet, Exercise } from '@/types';
import { fetchExercises } from '@/services/supabase/exercises';
import { formatDurationShort } from '@/utils/formatters';
import { useRestTimer } from '@/hooks/useRestTimer';
import { useSettingsStore } from '@/store/settingsStore';

export default function ActiveWorkoutScreen() {
  const {
    sessionId, sessionName, isActive, exercises, elapsedSeconds,
    startWorkout, addExercise, addSet, updateSet, completeSet,
    removeSet, removeExercise, finishWorkout, discardWorkout, tickTimer,
  } = useWorkoutStore();

  const restTimerDefault = useSettingsStore((s) => s.restTimerDefault);
  const { remaining, isRunning: restRunning, start: startRest, stop: stopRest } = useRestTimer(restTimerDefault);

  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [finishing, setFinishing] = useState(false);
  const [workoutName, setWorkoutName] = useState(sessionName || 'Entreno');
  const bottomSheetRef = useRef<BottomSheet>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start workout if not active
  useEffect(() => {
    if (!isActive) {
      startWorkout(workoutName);
    }
  }, []);

  // Load exercise library
  useEffect(() => {
    fetchExercises().then(setAllExercises).catch(console.error);
  }, []);

  // Elapsed timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      tickTimer();
    }, 1000);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [tickTimer]);

  async function handleSetComplete(exerciseLocalId: string, setLocalId: string) {
    await completeSet(exerciseLocalId, setLocalId);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    startRest(restTimerDefault);
  }

  async function handleFinish() {
    if (exercises.length === 0) {
      Alert.alert('Sin ejercicios', '¿Seguro que quieres terminar sin registrar nada?', [
        { text: 'Cancelar' },
        { text: 'Descartar', style: 'destructive', onPress: () => { discardWorkout(); router.back(); } },
      ]);
      return;
    }

    setFinishing(true);
    try {
      const sid = await finishWorkout();
      router.replace(`/workout/complete?id=${sid}`);
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'No se pudo guardar el entreno');
    } finally {
      setFinishing(false);
    }
  }

  function handleDiscard() {
    Alert.alert('Descartar entreno', '¿Seguro? Se perderán los datos.', [
      { text: 'Cancelar' },
      {
        text: 'Descartar',
        style: 'destructive',
        onPress: () => { discardWorkout(); router.back(); },
      },
    ]);
  }

  function handleAddExercise(exercise: Exercise) {
    addExercise(exercise);
    // Auto-add first set
    setTimeout(() => {
      const { exercises: exs } = useWorkoutStore.getState();
      const newEx = exs[exs.length - 1];
      if (newEx) addSet(newEx.localId);
    }, 100);
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleDiscard} style={styles.discardBtn}>
          <Ionicons name="close" size={22} color={Colors.textSecondary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <TextInput
            style={styles.workoutName}
            value={workoutName}
            onChangeText={setWorkoutName}
            placeholder="Nombre del entreno"
            placeholderTextColor={Colors.textMuted}
          />
          <Text style={styles.timer}>{formatDurationShort(elapsedSeconds)}</Text>
        </View>
        <Button
          title="Terminar"
          size="sm"
          loading={finishing}
          onPress={handleFinish}
        />
      </View>

      {/* Rest timer banner */}
      {restRunning && (
        <View style={styles.restBanner}>
          <RestTimer
            remaining={remaining}
            total={restTimerDefault}
            onSkip={stopRest}
          />
        </View>
      )}

      {/* Exercises */}
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {exercises.length === 0 ? (
          <View style={styles.empty}>
            <Ionicons name="barbell-outline" size={48} color={Colors.textMuted} />
            <Text style={styles.emptyTitle}>Añade un ejercicio</Text>
            <Text style={styles.emptySub}>Toca el botón de abajo para agregar ejercicios</Text>
          </View>
        ) : (
          exercises.map((ex) => (
            <ExerciseCard
              key={ex.localId}
              exercise={ex}
              onAddSet={() => addSet(ex.localId)}
              onUpdateSet={(setId, updates) => updateSet(ex.localId, setId, updates)}
              onCompleteSet={(setId) => handleSetComplete(ex.localId, setId)}
              onRemoveSet={(setId) => removeSet(ex.localId, setId)}
              onRemoveExercise={() => removeExercise(ex.localId)}
            />
          ))
        )}

        <TouchableOpacity
          style={styles.addExBtn}
          onPress={() => bottomSheetRef.current?.expand()}
          activeOpacity={0.8}
        >
          <Ionicons name="add" size={20} color={Colors.primary} />
          <Text style={styles.addExText}>Añadir ejercicio</Text>
        </TouchableOpacity>
      </ScrollView>

      <ExerciseSearchModal
        bottomSheetRef={bottomSheetRef}
        exercises={allExercises}
        onSelect={handleAddExercise}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.md,
  },
  discardBtn: { padding: 4 },
  headerCenter: { flex: 1, alignItems: 'center', gap: 2 },
  workoutName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
  },
  timer: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.secondary,
    fontVariant: ['tabular-nums'],
  },
  restBanner: { paddingHorizontal: Spacing.lg, paddingTop: Spacing.sm },
  scroll: { padding: Spacing.lg, paddingBottom: 40, gap: 0 },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxxl, gap: Spacing.md },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: Colors.textSecondary },
  emptySub: { fontSize: 13, color: Colors.textMuted, textAlign: 'center' },
  addExBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    borderWidth: 1.5,
    borderColor: Colors.primary + '66',
    borderStyle: 'dashed',
    borderRadius: Radius.lg,
    paddingVertical: Spacing.lg,
    marginTop: Spacing.md,
  },
  addExText: { fontSize: 15, fontWeight: '600', color: Colors.primary },
});
