import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  ActivityIndicator, Alert, TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { fetchWorkoutSession, deleteWorkoutSession } from '@/services/supabase/workouts';
import { WorkoutSession } from '@/types';
import { formatDuration, formatDateFull, formatVolume } from '@/utils/formatters';
import { useSettingsStore } from '@/store/settingsStore';
import { Badge } from '@/components/ui/Badge';

export default function WorkoutDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const unitSystem = useSettingsStore((s) => s.unitSystem);
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchWorkoutSession(id)
      .then(setSession)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleDelete() {
    Alert.alert('Eliminar entreno', '¿Seguro? No se puede deshacer.', [
      { text: 'Cancelar' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: async () => {
          await deleteWorkoutSession(id!);
          router.back();
        },
      },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <ActivityIndicator color={Colors.primary} style={{ marginTop: 60 }} />
      </SafeAreaView>
    );
  }

  if (!session) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={{ color: Colors.textSecondary, textAlign: 'center', marginTop: 60 }}>
          Entreno no encontrado
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{session.name}</Text>
            <Text style={styles.date}>{formatDateFull(session.started_at)}</Text>
          </View>
          <TouchableOpacity onPress={handleDelete} style={styles.deleteBtn}>
            <Ionicons name="trash-outline" size={20} color={Colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {session.duration_seconds && (
            <View style={styles.stat}>
              <Ionicons name="time-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.statText}>{formatDuration(session.duration_seconds)}</Text>
            </View>
          )}
          {session.total_volume_kg && (
            <View style={styles.stat}>
              <Ionicons name="barbell-outline" size={16} color={Colors.textSecondary} />
              <Text style={styles.statText}>{formatVolume(session.total_volume_kg, unitSystem)}</Text>
            </View>
          )}
        </View>

        {/* Exercises */}
        {session.workout_exercises?.map((we) => (
          <View key={we.id} style={styles.exerciseCard}>
            <View style={styles.exHeader}>
              <Text style={styles.exName}>{we.exercise?.name}</Text>
              <Badge
                label={we.exercise?.category ?? ''}
                category={we.exercise?.category as any}
              />
            </View>

            {/* Set table header */}
            <View style={styles.setTableHeader}>
              <Text style={[styles.tableHead, { width: 28 }]}>Set</Text>
              <Text style={[styles.tableHead, { flex: 1 }]}>Peso</Text>
              <Text style={[styles.tableHead, { flex: 1 }]}>Reps</Text>
              <Text style={[styles.tableHead, { width: 40 }]}></Text>
            </View>

            {we.workout_sets?.map((set) => (
              <View key={set.id} style={styles.setRow}>
                <Text style={[styles.setCell, { width: 28 }]}>
                  {set.is_warmup ? 'W' : set.set_number}
                </Text>
                <Text style={[styles.setCell, { flex: 1 }]}>
                  {set.weight_kg
                    ? unitSystem === 'imperial'
                      ? `${(set.weight_kg * 2.20462).toFixed(1)} lb`
                      : `${set.weight_kg} kg`
                    : '—'}
                </Text>
                <Text style={[styles.setCell, { flex: 1 }]}>
                  {set.reps ?? '—'}
                </Text>
                <View style={{ width: 40, alignItems: 'center' }}>
                  {set.is_personal_record && (
                    <Text style={styles.prTag}>PR</Text>
                  )}
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.xl, gap: Spacing.lg, paddingBottom: 40 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  title: { fontSize: 22, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  date: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, textTransform: 'capitalize' },
  deleteBtn: { padding: 4, marginTop: 2 },
  statsRow: { flexDirection: 'row', gap: Spacing.xl },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statText: { fontSize: 14, fontWeight: '600', color: Colors.text },
  exerciseCard: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  exHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, flexWrap: 'wrap' },
  exName: { fontSize: 15, fontWeight: '700', color: Colors.text },
  setTableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: Spacing.xs,
    gap: Spacing.sm,
  },
  tableHead: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    gap: Spacing.sm,
  },
  setCell: { fontSize: 14, color: Colors.text, fontWeight: '500' },
  prTag: {
    fontSize: 9, fontWeight: '800', color: Colors.primary,
    backgroundColor: Colors.primary + '22',
    paddingHorizontal: 5, paddingVertical: 2,
    borderRadius: Radius.full,
  },
});
