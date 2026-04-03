import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, FlatList,
} from 'react-native';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { PeriodSelector } from '@/components/progress/PeriodSelector';
import { VolumeChart } from '@/components/progress/VolumeChart';
import { StatCard } from '@/components/progress/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { fetchVolumeByPeriod, fetchPersonalRecords, fetchWeeklyStats } from '@/services/supabase/progress';
import { fetchExercises } from '@/services/supabase/exercises';
import { Exercise, PersonalRecord, ProgressPeriod, VolumeDataPoint } from '@/types';
import { formatVolume, formatDate } from '@/utils/formatters';
import { useSettingsStore } from '@/store/settingsStore';
import { estimate1RM } from '@/utils/calculations';
import { Ionicons } from '@expo/vector-icons';

export default function ProgressScreen() {
  const unitSystem = useSettingsStore((s) => s.unitSystem);
  const [period, setPeriod] = useState<ProgressPeriod>('1M');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const [chartData, setChartData] = useState<VolumeDataPoint[]>([]);
  const [prs, setPRs] = useState<PersonalRecord[]>([]);
  const [stats, setStats] = useState({ sessionsThisWeek: 0, totalVolumeThisWeek: 0, streak: 0 });
  const [chartLoading, setChartLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const [exData, prData, statsData] = await Promise.all([
          fetchExercises(),
          fetchPersonalRecords(),
          fetchWeeklyStats(),
        ]);
        setExercises(exData);
        setPRs(prData);
        setStats(statsData);
        if (exData.length > 0) setSelectedExercise(exData[0]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!selectedExercise) return;
    setChartLoading(true);
    fetchVolumeByPeriod(selectedExercise.id, period)
      .then(setChartData)
      .catch(console.error)
      .finally(() => setChartLoading(false));
  }, [selectedExercise, period]);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Progreso</Text>

        {/* Summary stats */}
        <View style={styles.statsRow}>
          <StatCard
            label="Entrenos semana"
            value={String(stats.sessionsThisWeek)}
            icon="calendar-outline"
          />
          <StatCard
            label="Volumen semana"
            value={formatVolume(stats.totalVolumeThisWeek, unitSystem)}
            icon="barbell-outline"
            accent={Colors.secondary}
          />
          <StatCard
            label="Racha días"
            value={`${stats.streak}`}
            icon="flame-outline"
            accent={Colors.accent}
          />
        </View>

        {/* Volume chart */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Volumen por ejercicio</Text>
          </View>
          <PeriodSelector selected={period} onChange={setPeriod} />

          {/* Exercise selector */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.exerciseScroll}>
            <View style={styles.exerciseRow}>
              {exercises.slice(0, 15).map((ex) => (
                <TouchableOpacity
                  key={ex.id}
                  style={[
                    styles.exPill,
                    selectedExercise?.id === ex.id && styles.exPillActive,
                  ]}
                  onPress={() => setSelectedExercise(ex)}
                >
                  <Text
                    style={[
                      styles.exPillText,
                      selectedExercise?.id === ex.id && styles.exPillTextActive,
                    ]}
                  >
                    {ex.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <VolumeChart data={chartData} loading={chartLoading} />
        </View>

        {/* Personal records */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Récords personales</Text>
          {loading ? (
            <Skeleton height={60} />
          ) : prs.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>Completa entrenos para ver tus PRs</Text>
            </View>
          ) : (
            prs.map((pr) => (
              <View key={pr.id} style={styles.prRow}>
                <View style={styles.prLeft}>
                  <Ionicons name="trophy-outline" size={18} color={Colors.warning} />
                  <View>
                    <Text style={styles.prExercise}>{pr.exercise?.name ?? '—'}</Text>
                    <Text style={styles.prDate}>{formatDate(pr.achieved_at)}</Text>
                  </View>
                </View>
                <Text style={styles.prValue}>
                  {unitSystem === 'imperial'
                    ? `${(pr.value * 2.20462).toFixed(1)} lb`
                    : `${pr.value.toFixed(1)} kg`}
                </Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.xl, gap: Spacing.xl, paddingBottom: 32 },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  statsRow: { flexDirection: 'row', gap: Spacing.md },
  section: { gap: Spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  exerciseScroll: { marginHorizontal: -Spacing.xl },
  exerciseRow: { flexDirection: 'row', paddingHorizontal: Spacing.xl, gap: Spacing.sm, paddingBottom: Spacing.sm },
  exPill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exPillActive: { backgroundColor: Colors.primary + '22', borderColor: Colors.primary },
  exPillText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  exPillTextActive: { color: Colors.primary, fontWeight: '700' },
  empty: { padding: Spacing.xl, alignItems: 'center' },
  emptyText: { color: Colors.textSecondary, fontSize: 14 },
  prRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  prLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  prExercise: { fontSize: 14, fontWeight: '600', color: Colors.text },
  prDate: { fontSize: 11, color: Colors.textSecondary, marginTop: 2 },
  prValue: { fontSize: 16, fontWeight: '800', color: Colors.primary },
});
