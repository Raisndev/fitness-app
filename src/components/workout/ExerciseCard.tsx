import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { ActiveExercise, ActiveSet } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { SetRow } from './SetRow';
import { MUSCLE_GROUP_LABELS } from '@/constants/exercises';

interface ExerciseCardProps {
  exercise: ActiveExercise;
  onAddSet: () => void;
  onUpdateSet: (setLocalId: string, updates: Partial<ActiveSet>) => void;
  onCompleteSet: (setLocalId: string) => void;
  onRemoveSet: (setLocalId: string) => void;
  onRemoveExercise: () => void;
}

export function ExerciseCard({
  exercise,
  onAddSet,
  onUpdateSet,
  onCompleteSet,
  onRemoveSet,
  onRemoveExercise,
}: ExerciseCardProps) {
  const [collapsed, setCollapsed] = useState(false);
  const doneCount = exercise.sets.filter((s) => s.isDone).length;
  const ex = exercise.exercise;

  return (
    <View style={styles.card}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setCollapsed((c) => !c)}
        activeOpacity={0.8}
      >
        {/* Thumbnail */}
        <View style={styles.thumbWrap}>
          {ex.thumbnail_url ? (
            <Image source={{ uri: ex.thumbnail_url }} style={styles.thumb} resizeMode="cover" />
          ) : (
            <View style={[styles.thumb, styles.thumbPlaceholder]}>
              <Ionicons name="barbell-outline" size={18} color={Colors.textMuted} />
            </View>
          )}
        </View>

        <View style={styles.headerLeft}>
          <View style={styles.nameRow}>
            <Text style={styles.exerciseName} numberOfLines={1}>{ex.name}</Text>
            {/* Video indicator */}
            {ex.video_url && (
              <TouchableOpacity
                onPress={() => router.push(`/exercises/${ex.id}`)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="play-circle-outline" size={16} color={Colors.secondary} />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.badges}>
            <Badge
              label={MUSCLE_GROUP_LABELS[ex.category]}
              category={ex.category}
            />
            {ex.equipment_record && (
              <View style={styles.equipPill}>
                {ex.equipment_record.icon_name && (
                  <Ionicons name={ex.equipment_record.icon_name as any} size={10} color={Colors.textMuted} />
                )}
                <Text style={styles.equipPillText}>{ex.equipment_record.name}</Text>
              </View>
            )}
            {doneCount > 0 && (
              <View style={styles.donePill}>
                <Text style={styles.donePillText}>{doneCount}/{exercise.sets.length}</Text>
              </View>
            )}
          </View>
        </View>

        <View style={styles.headerRight}>
          <TouchableOpacity onPress={onRemoveExercise} style={styles.removeBtn}>
            <Ionicons name="close" size={18} color={Colors.textMuted} />
          </TouchableOpacity>
          <Ionicons
            name={collapsed ? 'chevron-down' : 'chevron-up'}
            size={18}
            color={Colors.textSecondary}
          />
        </View>
      </TouchableOpacity>

      {!collapsed && (
        <>
          {exercise.sets.length > 0 && (
            <View style={styles.setHeader}>
              <Text style={[styles.setHeaderText, { width: 28 }]}>Set</Text>
              <Text style={[styles.setHeaderText, { flex: 1, textAlign: 'center' }]}>Peso</Text>
              <Text style={[styles.setHeaderText, { flex: 1, textAlign: 'center' }]}>Reps</Text>
              <View style={{ width: 48 }} />
            </View>
          )}

          {exercise.sets.map((set) => (
            <SetRow
              key={set.localId}
              set={set}
              onUpdate={(updates) => onUpdateSet(set.localId, updates)}
              onComplete={() => onCompleteSet(set.localId)}
              onRemove={() => onRemoveSet(set.localId)}
            />
          ))}

          <TouchableOpacity style={styles.addSetBtn} onPress={onAddSet} activeOpacity={0.7}>
            <Ionicons name="add" size={16} color={Colors.primary} />
            <Text style={styles.addSetText}>Agregar serie</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    gap: Spacing.md,
  },
  thumbWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.sm,
    overflow: 'hidden',
    flexShrink: 0,
  },
  thumb: { width: 44, height: 44 },
  thumbPlaceholder: {
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.sm,
  },
  headerLeft: {
    flex: 1,
    gap: 4,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  equipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  equipPillText: { fontSize: 10, color: Colors.textMuted, fontWeight: '500' },
  donePill: {
    backgroundColor: Colors.primary + '22',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  donePillText: { fontSize: 11, fontWeight: '700', color: Colors.primary },
  removeBtn: { padding: 4 },
  setHeader: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.xs,
    gap: Spacing.sm,
  },
  setHeaderText: {
    fontSize: 10,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  addSetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
  },
  addSetText: { fontSize: 13, fontWeight: '600', color: Colors.primary },
});
