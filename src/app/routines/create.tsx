import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Alert, TextInput,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import BottomSheet from '@gorhom/bottom-sheet';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ExerciseSearchModal } from '@/components/workout/ExerciseSearchModal';
import { Badge } from '@/components/ui/Badge';
import { createRoutine, updateRoutine, upsertRoutineExercises, fetchRoutine } from '@/services/supabase/routines';
import { fetchExercises } from '@/services/supabase/exercises';
import { Exercise, RoutineExercise } from '@/types';
import { MUSCLE_GROUP_LABELS } from '@/constants/exercises';

interface DraftExercise {
  localId: string;
  exercise: Exercise;
  targetSets: string;
  targetReps: string;
  targetWeight: string;
  restSeconds: string;
}

function generateId() {
  return `${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

export default function CreateRoutineScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [exercises, setExercises] = useState<DraftExercise[]>([]);
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [saving, setSaving] = useState(false);
  const bottomSheetRef = useRef<BottomSheet>(null);

  useEffect(() => {
    fetchExercises().then(setAllExercises).catch(console.error);
    if (isEditing && id) {
      fetchRoutine(id).then((r) => {
        setName(r.name);
        setDescription(r.description ?? '');
        setDuration(r.estimated_duration_minutes?.toString() ?? '');
        setExercises(
          (r.routine_exercises ?? []).map((re) => ({
            localId: generateId(),
            exercise: re.exercise!,
            targetSets: re.target_sets?.toString() ?? '3',
            targetReps: re.target_reps?.toString() ?? '10',
            targetWeight: re.target_weight?.toString() ?? '',
            restSeconds: re.rest_seconds?.toString() ?? '90',
          }))
        );
      }).catch(console.error);
    }
  }, []);

  function addExercise(ex: Exercise) {
    setExercises((prev) => [
      ...prev,
      { localId: generateId(), exercise: ex, targetSets: '3', targetReps: '10', targetWeight: '', restSeconds: '90' },
    ]);
  }

  function removeExercise(localId: string) {
    setExercises((prev) => prev.filter((e) => e.localId !== localId));
  }

  function updateExercise(localId: string, updates: Partial<DraftExercise>) {
    setExercises((prev) =>
      prev.map((e) => (e.localId === localId ? { ...e, ...updates } : e))
    );
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'Ponle un nombre a tu rutina');
      return;
    }
    setSaving(true);
    try {
      let routineId = id;
      if (!isEditing) {
        const routine = await createRoutine(name.trim(), description.trim() || undefined, duration ? parseInt(duration) : undefined);
        routineId = routine.id;
      } else {
        await updateRoutine(routineId!, { name: name.trim(), description: description.trim() || undefined, estimated_duration_minutes: duration ? parseInt(duration) : undefined });
      }

      await upsertRoutineExercises(
        routineId!,
        exercises.map((e, idx) => ({
          routine_id: routineId!,
          exercise_id: e.exercise.id,
          sort_order: idx,
          target_sets: parseInt(e.targetSets) || null,
          target_reps: parseInt(e.targetReps) || null,
          target_weight: parseFloat(e.targetWeight) || null,
          rest_seconds: parseInt(e.restSeconds) || 90,
          notes: null,
        }))
      );
      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'No se pudo guardar la rutina');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Input label="Nombre de la rutina" value={name} onChangeText={setName} placeholder="Ej: Push A" />
        <Input label="Descripción (opcional)" value={description} onChangeText={setDescription} placeholder="Pecho, hombros y tríceps" multiline />
        <Input
          label="Duración estimada (min)"
          value={duration}
          onChangeText={setDuration}
          placeholder="60"
          keyboardType="number-pad"
        />

        <Text style={styles.sectionTitle}>Ejercicios</Text>

        {exercises.map((ex, idx) => (
          <View key={ex.localId} style={styles.exCard}>
            <View style={styles.exCardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.exName}>{ex.exercise.name}</Text>
                <Badge label={MUSCLE_GROUP_LABELS[ex.exercise.category]} category={ex.exercise.category} />
              </View>
              <TouchableOpacity onPress={() => removeExercise(ex.localId)}>
                <Ionicons name="close-circle-outline" size={22} color={Colors.textMuted} />
              </TouchableOpacity>
            </View>
            <View style={styles.exInputsRow}>
              <View style={styles.exInputGroup}>
                <Text style={styles.exInputLabel}>Series</Text>
                <TextInput
                  style={styles.exInput}
                  value={ex.targetSets}
                  onChangeText={(v) => updateExercise(ex.localId, { targetSets: v })}
                  keyboardType="number-pad"
                  placeholder="3"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={styles.exInputGroup}>
                <Text style={styles.exInputLabel}>Reps</Text>
                <TextInput
                  style={styles.exInput}
                  value={ex.targetReps}
                  onChangeText={(v) => updateExercise(ex.localId, { targetReps: v })}
                  keyboardType="number-pad"
                  placeholder="10"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={styles.exInputGroup}>
                <Text style={styles.exInputLabel}>Peso (kg)</Text>
                <TextInput
                  style={styles.exInput}
                  value={ex.targetWeight}
                  onChangeText={(v) => updateExercise(ex.localId, { targetWeight: v })}
                  keyboardType="decimal-pad"
                  placeholder="—"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
              <View style={styles.exInputGroup}>
                <Text style={styles.exInputLabel}>Descanso</Text>
                <TextInput
                  style={styles.exInput}
                  value={ex.restSeconds}
                  onChangeText={(v) => updateExercise(ex.localId, { restSeconds: v })}
                  keyboardType="number-pad"
                  placeholder="90"
                  placeholderTextColor={Colors.textMuted}
                />
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity
          style={styles.addExBtn}
          onPress={() => bottomSheetRef.current?.expand()}
        >
          <Ionicons name="add" size={18} color={Colors.primary} />
          <Text style={styles.addExText}>Añadir ejercicio</Text>
        </TouchableOpacity>

        <Button
          title={isEditing ? 'Guardar cambios' : 'Crear rutina'}
          size="lg"
          fullWidth
          loading={saving}
          onPress={handleSave}
        />
      </ScrollView>

      <ExerciseSearchModal
        bottomSheetRef={bottomSheetRef}
        exercises={allExercises}
        onSelect={addExercise}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.xl, gap: Spacing.lg, paddingBottom: 40 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text, marginTop: Spacing.sm },
  exCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  exCardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.sm },
  exName: { fontSize: 15, fontWeight: '700', color: Colors.text, marginBottom: 4 },
  exInputsRow: { flexDirection: 'row', gap: Spacing.sm },
  exInputGroup: { flex: 1, gap: 4 },
  exInputLabel: { fontSize: 10, fontWeight: '600', color: Colors.textMuted, textTransform: 'uppercase', textAlign: 'center' },
  exInput: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    padding: Spacing.sm,
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
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
  },
  addExText: { fontSize: 14, fontWeight: '600', color: Colors.primary },
});
