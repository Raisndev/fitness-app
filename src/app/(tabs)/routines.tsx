import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, SafeAreaView,
  TouchableOpacity, Alert, RefreshControl,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { RoutineCard } from '@/components/routines/RoutineCard';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { fetchRoutines, deleteRoutine } from '@/services/supabase/routines';
import { Routine } from '@/types';
import { useWorkoutStore } from '@/store/workoutStore';

export default function RoutinesScreen() {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const startWorkout = useWorkoutStore((s) => s.startWorkout);

  async function load() {
    try {
      const data = await fetchRoutines();
      setRoutines(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  async function handleStartRoutine(routine: Routine) {
    await startWorkout(routine.name, routine.id);
    router.push('/workout/active');
  }

  function handleLongPress(routine: Routine) {
    Alert.alert(routine.name, 'Elige una acción', [
      { text: 'Editar', onPress: () => router.push(`/routines/${routine.id}`) },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () =>
          Alert.alert('¿Eliminar rutina?', 'No se puede deshacer.', [
            { text: 'Cancelar' },
            {
              text: 'Eliminar',
              style: 'destructive',
              onPress: async () => {
                await deleteRoutine(routine.id);
                setRoutines((prev) => prev.filter((r) => r.id !== routine.id));
              },
            },
          ]),
      },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.title}>Rutinas</Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </View>
      ) : routines.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="list-outline" size={56} color={Colors.textMuted} />
          <Text style={styles.emptyTitle}>Sin rutinas</Text>
          <Text style={styles.emptySub}>Crea una rutina para empezar tus entrenos más rápido</Text>
          <TouchableOpacity
            style={styles.createBtn}
            onPress={() => router.push('/routines/create')}
          >
            <Text style={styles.createBtnText}>Crear rutina</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={routines}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ItemSeparatorComponent={() => <View style={{ height: Spacing.md }} />}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
          renderItem={({ item }) => (
            <RoutineCard
              routine={item}
              onPress={() => router.push(`/routines/${item.id}`)}
              onStart={() => handleStartRoutine(item)}
            />
          )}
        />
      )}

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/routines/create')}
        activeOpacity={0.85}
      >
        <Ionicons name="add" size={28} color={Colors.textOnPrimary} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  header: { paddingHorizontal: Spacing.xl, paddingVertical: Spacing.lg },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  loadingContainer: { padding: Spacing.xl, gap: Spacing.md },
  list: { padding: Spacing.xl, paddingBottom: 100 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.md, padding: Spacing.xl },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: Colors.textSecondary },
  emptySub: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
  createBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: Radius.md,
    marginTop: Spacing.md,
  },
  createBtnText: { fontSize: 15, fontWeight: '700', color: Colors.textOnPrimary },
  fab: {
    position: 'absolute',
    bottom: 32,
    right: Spacing.xl,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
});
