import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

  return (
    <View style={styles.card}>
      {/* Header */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setCollapsed((c) => !c)}
        activeOpacity={0.8}
      >
        <View style={styles.headerLeft}>
          <Text style={styles.exerciseName}>{exercise.exercise.name}</Text>
          <View style={styles.badges}>
            <Badge
              label={MUSCLE_GROUP_LABELS[exercise.exercise.category]}
              category={exercise.exercise.category}
            />
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
          {/* Set headers */}
          {exercise.sets.length > 0 && (
            <View style={styles.setHeader}>
              <Text style={[styles.setHeaderText, { width: 28 }]}>Set</Text>
              <Text style={[styles.setHeaderText, { flex: 1, textAlign: 'center' }]}>Peso</Text>
              <Text style={[styles.setHeaderText, { flex: 1, textAlign: 'center' }]}>Reps</Text>
              <View style={{ width: 48 }} />
            </View>
          )}

          {/* Sets */}
          {exercise.sets.map((set) => (
            <SetRow
              key={set.localId}
              set={set}
              onUpdate={(updates) => onUpdateSet(set.localId, updates)}
              onComplete={() => onCompleteSet(set.localId)}
              onRemove={() => onRemoveSet(set.localId)}
            />
          ))}

          {/* Add set button */}
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
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  headerLeft: {
    flex: 1,
    gap: Spacing.xs,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  badges: {
    flexDirection: 'row',
    gap: Spacing.xs,
    alignItems: 'center',
  },
  donePill: {
    backgroundColor: Colors.primary + '22',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  donePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
  },
  removeBtn: {
    padding: 4,
  },
  setHeader: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
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
  addSetText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.primary,
  },
});
