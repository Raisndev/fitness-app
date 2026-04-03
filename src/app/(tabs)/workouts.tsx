import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, SafeAreaView, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { WorkoutHistoryCard } from '@/components/workout/WorkoutHistoryCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { Button } from '@/components/ui/Button';
import { fetchWorkoutHistory } from '@/services/supabase/workouts';
import { WorkoutSession } from '@/types';

export default function WorkoutsScreen() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  async function loadSessions() {
    try {
      const data = await fetchWorkoutHistory(50);
      setSessions(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { loadSessions(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadSessions();
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Historial</Text>
        <Button
          title="Nuevo"
          size="sm"
          leftIcon={<Ionicons name="add" size={16} color={Colors.textOnPrimary} />}
          onPress={() => router.push('/workout/active')}
        />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </View>
      ) : sessions.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="barbell-outline" size={56} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Sin entrenos</Text>
          <Text style={styles.emptySub}>Completa tu primer entreno para verlo aquí</Text>
          <Button
            title="Empezar entreno"
            onPress={() => router.push('/workout/active')}
            style={{ marginTop: Spacing.md }}
          />
        </View>
      ) : (
        <FlatList
          data={sessions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          renderItem={({ item }) => (
            <WorkoutHistoryCard
              session={item}
              onPress={() => router.push(`/workout/${item.id}`)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg,
  },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  loadingContainer: { padding: Spacing.xl, gap: Spacing.md },
  list: { padding: Spacing.xl },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xl },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textSecondary },
  emptySub: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
});
