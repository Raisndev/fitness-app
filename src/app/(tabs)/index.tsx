import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView,
  TouchableOpacity, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { WeeklyGoalRing } from '@/components/dashboard/WeeklyGoalRing';
import { StatCard } from '@/components/progress/StatCard';
import { WorkoutHistoryCard } from '@/components/workout/WorkoutHistoryCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { fetchWorkoutHistory } from '@/services/supabase/workouts';
import { fetchWeeklyStats } from '@/services/supabase/progress';
import { WorkoutSession } from '@/types';
import { formatVolume } from '@/utils/formatters';
import { useSettingsStore } from '@/store/settingsStore';
import dayjs from 'dayjs';

export default function DashboardScreen() {
  const { profile } = useAuthStore();
  const unitSystem = useSettingsStore((s) => s.unitSystem);

  const [recentSessions, setRecentSessions] = useState<WorkoutSession[]>([]);
  const [stats, setStats] = useState({ sessionsThisWeek: 0, totalVolumeThisWeek: 0, streak: 0 });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const weeklyGoal = profile?.weekly_goal ?? 4;
  const greeting = getGreeting();
  const firstName = profile?.full_name?.split(' ')[0] ?? 'Atleta';

  async function loadData() {
    try {
      const [sessions, weekStats] = await Promise.all([
        fetchWorkoutHistory(5),
        fetchWeeklyStats(),
      ]);
      setRecentSessions(sessions);
      setStats(weekStats);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { loadData(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}</Text>
            <Text style={styles.name}>{firstName}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/(tabs)/profile')} style={styles.avatarBtn}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {firstName.charAt(0).toUpperCase()}
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Weekly overview */}
        <View style={styles.weeklySection}>
          <WeeklyGoalRing completed={stats.sessionsThisWeek} goal={weeklyGoal} />
          <View style={styles.weeklyStats}>
            <StatCard
              label="Volumen"
              value={formatVolume(stats.totalVolumeThisWeek, unitSystem)}
              icon="barbell-outline"
              accent={Colors.secondary}
            />
            <StatCard
              label="Racha"
              value={`${stats.streak}d`}
              icon="flame-outline"
              accent={Colors.accent}
            />
          </View>
        </View>

        {/* Quick start */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Empezar entreno</Text>
          <TouchableOpacity
            style={styles.quickStart}
            onPress={() => router.push('/workout/active')}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={28} color={Colors.primary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.quickStartTitle}>Entreno vacío</Text>
              <Text style={styles.quickStartSub}>Comienza sin plantilla</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickStart}
            onPress={() => router.push('/(tabs)/routines')}
            activeOpacity={0.8}
          >
            <Ionicons name="list" size={28} color={Colors.secondary} />
            <View style={{ flex: 1 }}>
              <Text style={styles.quickStartTitle}>Desde rutina</Text>
              <Text style={styles.quickStartSub}>Usar una plantilla guardada</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Recent workouts */}
        <View style={styles.section}>
          <View style={styles.sectionRow}>
            <Text style={styles.sectionTitle}>Recientes</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/workouts')}>
              <Text style={styles.seeAll}>Ver todos</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <>
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : recentSessions.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="barbell-outline" size={40} color={Colors.textMuted} />
              <Text style={styles.emptyText}>Aún no hay entrenos.</Text>
              <Text style={styles.emptySubText}>¡Comienza el primero!</Text>
            </View>
          ) : (
            recentSessions.map((session) => (
              <WorkoutHistoryCard
                key={session.id}
                session={session}
                onPress={() => router.push(`/workout/${session.id}`)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getGreeting(): string {
  const h = dayjs().hour();
  if (h < 12) return 'Buenos días,';
  if (h < 19) return 'Buenas tardes,';
  return 'Buenas noches,';
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.xl, gap: Spacing.xl, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  greeting: { fontSize: 14, color: Colors.textSecondary, fontWeight: '500' },
  name: { fontSize: 26, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  avatarBtn: {},
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.primary,
  },
  avatarText: { fontSize: 18, fontWeight: '800', color: Colors.primary },
  weeklySection: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xl },
  weeklyStats: { flex: 1, gap: Spacing.md },
  section: { gap: Spacing.md },
  sectionRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: Colors.text },
  seeAll: { fontSize: 13, fontWeight: '600', color: Colors.primary },
  quickStart: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: 12,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  quickStartTitle: { fontSize: 15, fontWeight: '700', color: Colors.text },
  quickStartSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
  emptyText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  emptySubText: { fontSize: 13, color: Colors.textMuted },
});
