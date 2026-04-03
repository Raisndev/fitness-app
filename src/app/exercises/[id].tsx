import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { fetchExercise } from '@/services/supabase/exercises';
import { fetchWorkoutHistory } from '@/services/supabase/workouts';
import { Exercise, WorkoutSession } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { StatCard } from '@/components/progress/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS } from '@/constants/exercises';
import { formatDate, formatVolume } from '@/utils/formatters';
import { useSettingsStore } from '@/store/settingsStore';
import { supabase } from '@/services/supabase/client';

const { width } = Dimensions.get('window');
const IMAGE_HEIGHT = width * 0.6;

export default function ExerciseDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const unitSystem = useSettingsStore((s) => s.unitSystem);

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<{
    date: string;
    sets: number;
    maxWeight: number;
    totalVolume: number;
  }[]>([]);
  const [pr, setPr] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    loadData();
  }, [id]);

  async function loadData() {
    try {
      const ex = await fetchExercise(id!);
      setExercise(ex);

      // Load exercise history via workout_sets
      const { data: setsData } = await supabase
        .from('workout_sets')
        .select(`
          weight_kg, reps, is_personal_record, completed_at,
          workout_exercise:workout_exercises!inner(
            exercise_id,
            session:workout_sessions!inner(started_at, user_id)
          )
        `)
        .eq('workout_exercise.exercise_id', id)
        .eq('is_warmup', false)
        .not('weight_kg', 'is', null)
        .order('completed_at', { ascending: false })
        .limit(100);

      if (setsData && setsData.length > 0) {
        // Find PR
        const maxWeight = Math.max(...setsData.map((s: any) => s.weight_kg ?? 0));
        setPr(maxWeight);

        // Group by session date (approximate by day)
        const byDay: Record<string, typeof setsData> = {};
        for (const s of setsData as any[]) {
          const day = s.workout_exercise?.session?.started_at?.split('T')[0] ?? 'unknown';
          if (!byDay[day]) byDay[day] = [];
          byDay[day].push(s);
        }

        const historyRows = Object.entries(byDay)
          .slice(0, 8)
          .map(([date, sets]) => ({
            date,
            sets: sets.length,
            maxWeight: Math.max(...sets.map((s: any) => s.weight_kg ?? 0)),
            totalVolume: sets.reduce((acc: number, s: any) => acc + (s.weight_kg ?? 0) * (s.reps ?? 0), 0),
          }));

        setHistory(historyRows);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  function openVideo() {
    if (!exercise?.video_url) return;
    Linking.openURL(exercise.video_url).catch(() => {});
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.loadingContainer}>
          <Skeleton height={IMAGE_HEIGHT} borderRadius={0} />
          <View style={{ padding: Spacing.xl, gap: Spacing.md }}>
            <Skeleton height={28} width="70%" />
            <Skeleton height={16} width="40%" />
            <Skeleton height={16} width="90%" />
            <Skeleton height={16} width="80%" />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  if (!exercise) {
    return (
      <SafeAreaView style={styles.safe}>
        <Text style={styles.notFound}>Ejercicio no encontrado</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>

        {/* Hero image */}
        <View style={styles.heroWrap}>
          {exercise.image_url ? (
            <Image
              source={{ uri: exercise.image_url }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <Ionicons name="barbell-outline" size={64} color={Colors.textMuted} />
            </View>
          )}

          {/* Gradient overlay */}
          <LinearGradient
            colors={['transparent', Colors.bg]}
            style={styles.heroGradient}
            pointerEvents="none"
          />

          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={Colors.text} />
          </TouchableOpacity>

          {/* Edit button (custom exercises only) */}
          {!exercise.is_global && (
            <TouchableOpacity
              style={styles.editBtn}
              onPress={() => router.push(`/exercises/create?id=${exercise.id}`)}
            >
              <Ionicons name="pencil-outline" size={20} color={Colors.text} />
            </TouchableOpacity>
          )}

          {/* Video play button overlay */}
          {exercise.video_url && (
            <TouchableOpacity style={styles.playOverlay} onPress={openVideo} activeOpacity={0.85}>
              <View style={styles.playBtn}>
                <Ionicons name="play" size={28} color={Colors.textOnPrimary} />
              </View>
              <Text style={styles.playLabel}>Ver video</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Content */}
        <View style={styles.content}>

          {/* Title & badges */}
          <Text style={styles.title}>{exercise.name}</Text>
          <View style={styles.badgesRow}>
            <Badge
              label={MUSCLE_GROUP_LABELS[exercise.category]}
              category={exercise.category}
            />
            {exercise.equipment_record ? (
              <View style={styles.equipPill}>
                {exercise.equipment_record.icon_name && (
                  <Ionicons
                    name={exercise.equipment_record.icon_name as any}
                    size={13}
                    color={Colors.textSecondary}
                  />
                )}
                <Text style={styles.equipText}>{exercise.equipment_record.name}</Text>
              </View>
            ) : exercise.equipment ? (
              <View style={styles.equipPill}>
                <Text style={styles.equipText}>{EQUIPMENT_LABELS[exercise.equipment]}</Text>
              </View>
            ) : null}
            {!exercise.is_global && (
              <View style={styles.customPill}>
                <Text style={styles.customPillText}>Personalizado</Text>
              </View>
            )}
          </View>

          {/* Muscles targeted */}
          {exercise.muscle_group.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Músculos</Text>
              <View style={styles.musclesRow}>
                {exercise.muscle_group.map((m) => (
                  <View key={m} style={styles.musclePill}>
                    <Text style={styles.musclePillText}>
                      {m.replace(/_/g, ' ')}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* Instructions */}
          {exercise.instructions && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Instrucciones</Text>
              <Text style={styles.instructions}>{exercise.instructions}</Text>
            </View>
          )}

          {/* Video link (text fallback if no image) */}
          {exercise.video_url && !exercise.image_url && (
            <TouchableOpacity style={styles.videoLinkBtn} onPress={openVideo} activeOpacity={0.8}>
              <Ionicons name="play-circle-outline" size={22} color={Colors.secondary} />
              <Text style={styles.videoLinkText}>Ver video tutorial</Text>
              <Ionicons name="open-outline" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}

          {/* PR stat */}
          {pr !== null && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Tu récord</Text>
              <View style={styles.prCard}>
                <Ionicons name="trophy" size={24} color={Colors.warning} />
                <View>
                  <Text style={styles.prValue}>
                    {unitSystem === 'imperial'
                      ? `${(pr * 2.20462).toFixed(1)} lb`
                      : `${pr} kg`}
                  </Text>
                  <Text style={styles.prLabel}>Peso máximo registrado</Text>
                </View>
              </View>
            </View>
          )}

          {/* History */}
          {history.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Historial reciente</Text>
              {history.map((h) => (
                <View key={h.date} style={styles.historyRow}>
                  <Text style={styles.historyDate}>{formatDate(h.date)}</Text>
                  <View style={styles.historyStats}>
                    <Text style={styles.historyStatText}>{h.sets} series</Text>
                    <Text style={styles.historyStatSep}>·</Text>
                    <Text style={styles.historyStatText}>
                      max {unitSystem === 'imperial'
                        ? `${(h.maxWeight * 2.20462).toFixed(1)} lb`
                        : `${h.maxWeight} kg`}
                    </Text>
                    <Text style={styles.historyStatSep}>·</Text>
                    <Text style={styles.historyStatText}>
                      {formatVolume(h.totalVolume, unitSystem)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {history.length === 0 && pr === null && !loading && (
            <View style={styles.noHistory}>
              <Ionicons name="time-outline" size={32} color={Colors.textMuted} />
              <Text style={styles.noHistoryText}>Aún no has registrado este ejercicio</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { paddingBottom: 48 },
  loadingContainer: { gap: 0 },
  notFound: { color: Colors.textSecondary, textAlign: 'center', marginTop: 80, fontSize: 15 },

  // Hero
  heroWrap: { position: 'relative', height: IMAGE_HEIGHT },
  heroImage: { width: '100%', height: IMAGE_HEIGHT },
  heroPlaceholder: {
    backgroundColor: Colors.bgCard,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 80,
  },
  backBtn: {
    position: 'absolute',
    top: Spacing.lg,
    left: Spacing.lg,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.bg + 'CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtn: {
    position: 'absolute',
    top: Spacing.lg,
    right: Spacing.lg,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.bg + 'CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playOverlay: {
    position: 'absolute',
    bottom: Spacing.xl,
    right: Spacing.xl,
    alignItems: 'center',
    gap: 4,
  },
  playBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.secondary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 8,
  },
  playLabel: { fontSize: 11, fontWeight: '700', color: Colors.text },

  // Content
  content: { padding: Spacing.xl, gap: Spacing.xl },
  title: { fontSize: 26, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  badgesRow: { flexDirection: 'row', gap: Spacing.sm, flexWrap: 'wrap', alignItems: 'center' },
  equipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  equipText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  customPill: {
    backgroundColor: Colors.secondary + '22',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.secondary + '55',
  },
  customPillText: { fontSize: 12, color: Colors.secondary, fontWeight: '600' },

  // Sections
  section: { gap: Spacing.md },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  musclesRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  musclePill: {
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  musclePillText: {
    fontSize: 12,
    color: Colors.text,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  instructions: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 22,
  },

  // Video link (fallback)
  videoLinkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    backgroundColor: Colors.secondary + '15',
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.secondary + '44',
  },
  videoLinkText: { flex: 1, fontSize: 15, fontWeight: '600', color: Colors.secondary },

  // PR
  prCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
    backgroundColor: Colors.warning + '15',
    borderRadius: Radius.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.warning + '44',
  },
  prValue: { fontSize: 22, fontWeight: '800', color: Colors.text },
  prLabel: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },

  // History
  historyRow: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 5,
  },
  historyDate: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
    textTransform: 'capitalize',
  },
  historyStats: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  historyStatText: { fontSize: 12, color: Colors.textSecondary },
  historyStatSep: { fontSize: 12, color: Colors.textMuted },

  noHistory: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.xl },
  noHistoryText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
});
