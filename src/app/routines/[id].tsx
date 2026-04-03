import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { fetchRoutine } from '@/services/supabase/routines';
import { Routine } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS } from '@/constants/exercises';
import { useWorkoutStore } from '@/store/workoutStore';

export default function RoutineDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [loading, setLoading] = useState(true);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);

  useEffect(() => {
    if (!id) return;
    fetchRoutine(id)
      .then(setRoutine)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleStart() {
    if (!routine) return;
    await startWorkout(routine.name, routine.id);
    router.push('/workout/active');
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (!routine) return null;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{routine.name}</Text>
            {routine.description && (
              <Text style={styles.description}>{routine.description}</Text>
            )}
            <View style={styles.meta}>
              <View style={styles.metaItem}>
                <Ionicons name="list-outline" size={14} color={Colors.textSecondary} />
                <Text style={styles.metaText}>{routine.routine_exercises?.length ?? 0} ejercicios</Text>
              </View>
              {routine.estimated_duration_minutes && (
                <View style={styles.metaItem}>
                  <Ionicons name="time-outline" size={14} color={Colors.textSecondary} />
                  <Text style={styles.metaText}>{routine.estimated_duration_minutes} min</Text>
                </View>
              )}
            </View>
          </View>
          <TouchableOpacity
            style={styles.editBtn}
            onPress={() => router.push(`/routines/create?id=${routine.id}`)}
          >
            <Ionicons name="pencil-outline" size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Exercises */}
        <Text style={styles.sectionTitle}>Ejercicios</Text>
        {(routine.routine_exercises ?? []).map((re, idx) => (
          <View key={re.id} style={styles.exCard}>
            <View style={styles.exNum}>
              <Text style={styles.exNumText}>{idx + 1}</Text>
            </View>
            <View style={styles.exInfo}>
              <Text style={styles.exName}>{re.exercise?.name}</Text>
              <View style={styles.exBadges}>
                {re.exercise && (
                  <Badge
                    label={MUSCLE_GROUP_LABELS[re.exercise.category]}
                    category={re.exercise.category}
                  />
                )}
              </View>
              <View style={styles.exTargets}>
                {re.target_sets && (
                  <Text style={styles.exTargetText}>{re.target_sets} series</Text>
                )}
                {re.target_reps && (
                  <Text style={styles.exTargetText}>× {re.target_reps} reps</Text>
                )}
                {re.rest_seconds && (
                  <Text style={styles.exTargetText}>• {re.rest_seconds}s descanso</Text>
                )}
              </View>
            </View>
          </View>
        ))}

        <TouchableOpacity style={styles.startBtn} onPress={handleStart} activeOpacity={0.85}>
          <Ionicons name="play" size={20} color={Colors.textOnPrimary} />
          <Text style={styles.startBtnText}>Empezar rutina</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.xl, gap: Spacing.lg, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  title: { fontSize: 24, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  description: { fontSize: 14, color: Colors.textSecondary, marginTop: 4 },
  meta: { flexDirection: 'row', gap: Spacing.lg, marginTop: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaText: { fontSize: 13, color: Colors.textSecondary, fontWeight: '500' },
  editBtn: { padding: 4, marginTop: 4 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  exCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exNum: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center', justifyContent: 'center',
  },
  exNumText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  exInfo: { flex: 1, gap: 6 },
  exName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  exBadges: { flexDirection: 'row', gap: Spacing.xs },
  exTargets: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap' },
  exTargetText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    marginTop: Spacing.md,
  },
  startBtnText: { fontSize: 16, fontWeight: '700', color: Colors.textOnPrimary },
});
