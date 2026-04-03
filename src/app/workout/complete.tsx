import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { fetchWorkoutSession } from '@/services/supabase/workouts';
import { syncWorkoutToHealthKit } from '@/services/healthkit/sync';
import { WorkoutSession } from '@/types';
import { formatDuration, formatVolume, formatDateFull } from '@/utils/formatters';
import { useSettingsStore } from '@/store/settingsStore';
import { StatCard } from '@/components/progress/StatCard';

export default function WorkoutCompleteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { unitSystem, healthkitEnabled } = useSettingsStore();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [hasPR, setHasPR] = useState(false);
  const [synced, setSynced] = useState(false);

  useEffect(() => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    async function load() {
      if (!id) return;
      const data = await fetchWorkoutSession(id);
      setSession(data);

      // Check for PRs
      const allSets = data.workout_exercises?.flatMap((we) => we.workout_sets ?? []) ?? [];
      if (allSets.some((s) => s.is_personal_record)) {
        setHasPR(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }

      // Sync to HealthKit
      if (healthkitEnabled && !data.healthkit_sync_id) {
        const hkId = await syncWorkoutToHealthKit(data);
        if (hkId) setSynced(true);
      }
    }
    load();
  }, [id, healthkitEnabled]);

  const exerciseCount = session?.workout_exercises?.length ?? 0;
  const totalSets = session?.workout_exercises?.reduce(
    (acc, we) => acc + (we.workout_sets?.filter((s) => !s.is_warmup).length ?? 0), 0
  ) ?? 0;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Top gradient glow */}
        <LinearGradient
          colors={[Colors.primary + '18', 'transparent']}
          style={styles.topGlow}
          pointerEvents="none"
        />

        {/* Icon */}
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark-circle" size={80} color={Colors.primary} />
        </View>

        <Text style={styles.title}>¡Entreno completado!</Text>
        {session && (
          <Text style={styles.subtitle}>{formatDateFull(session.started_at)}</Text>
        )}
        {hasPR && (
          <View style={styles.prBanner}>
            <Ionicons name="trophy" size={18} color={Colors.warning} />
            <Text style={styles.prBannerText}>¡Nuevo récord personal!</Text>
          </View>
        )}

        {/* Stats */}
        {session && (
          <View style={styles.statsGrid}>
            <StatCard
              label="Duración"
              value={session.duration_seconds ? formatDuration(session.duration_seconds) : '—'}
              icon="time-outline"
            />
            <StatCard
              label="Volumen"
              value={session.total_volume_kg
                ? formatVolume(session.total_volume_kg, unitSystem)
                : '—'}
              icon="barbell-outline"
              accent={Colors.secondary}
            />
            <StatCard
              label="Ejercicios"
              value={String(exerciseCount)}
              icon="list-outline"
              accent={Colors.info}
            />
            <StatCard
              label="Series"
              value={String(totalSets)}
              icon="repeat-outline"
              accent={Colors.accent}
            />
          </View>
        )}

        {/* Exercises summary */}
        {session?.workout_exercises && session.workout_exercises.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ejercicios</Text>
            {session.workout_exercises.map((we) => {
              const sets = we.workout_sets?.filter((s) => !s.is_warmup) ?? [];
              const maxWeight = Math.max(...sets.map((s) => s.weight_kg ?? 0), 0);
              return (
                <View key={we.id} style={styles.exRow}>
                  <Text style={styles.exName}>{we.exercise?.name}</Text>
                  <View style={styles.exMeta}>
                    <Text style={styles.exMetaText}>{sets.length} series</Text>
                    {maxWeight > 0 && (
                      <Text style={styles.exMetaText}>
                        max {unitSystem === 'imperial' ? `${(maxWeight * 2.20462).toFixed(1)} lb` : `${maxWeight} kg`}
                      </Text>
                    )}
                    {sets.some((s) => s.is_personal_record) && (
                      <Text style={styles.prTag}>PR</Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* Apple Health */}
        {(synced || session?.healthkit_sync_id) && (
          <View style={styles.hkBadge}>
            <Ionicons name="heart" size={16} color="#FF3B30" />
            <Text style={styles.hkText}>Guardado en Apple Health</Text>
          </View>
        )}

        <TouchableOpacity style={styles.doneBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.doneBtnText}>Volver al inicio</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.xl, alignItems: 'center', gap: Spacing.xl, paddingBottom: 40 },
  topGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 200 },
  iconWrap: { marginTop: Spacing.xxl },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 14, color: Colors.textSecondary, textTransform: 'capitalize' },
  prBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.warning + '22',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.warning + '55',
  },
  prBannerText: { fontSize: 14, fontWeight: '700', color: Colors.warning },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md, width: '100%' },
  section: { width: '100%', gap: Spacing.sm },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: Colors.text },
  exRow: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  exName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  exMeta: { flexDirection: 'row', gap: Spacing.md, alignItems: 'center' },
  exMetaText: { fontSize: 12, color: Colors.textSecondary },
  prTag: {
    fontSize: 10, fontWeight: '800', color: Colors.primary,
    backgroundColor: Colors.primary + '22',
    paddingHorizontal: 6, paddingVertical: 2,
    borderRadius: Radius.full,
  },
  hkBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: '#FF3B3015',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: '#FF3B3033',
  },
  hkText: { fontSize: 13, fontWeight: '600', color: '#FF3B30' },
  doneBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.md,
    paddingVertical: 14,
    paddingHorizontal: Spacing.xxl,
    width: '100%',
    alignItems: 'center',
  },
  doneBtnText: { fontSize: 16, fontWeight: '700', color: Colors.textOnPrimary },
});
