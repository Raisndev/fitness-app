import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { Routine } from '@/types';

interface RoutineCardProps {
  routine: Routine;
  onPress?: () => void;
  onStart?: () => void;
}

export function RoutineCard({ routine, onPress, onStart }: RoutineCardProps) {
  const exerciseCount = routine.routine_exercises?.length ?? 0;

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.name}>{routine.name}</Text>
          {routine.description && (
            <Text style={styles.description} numberOfLines={1}>
              {routine.description}
            </Text>
          )}
          <View style={styles.meta}>
            <View style={styles.metaItem}>
              <Ionicons name="list-outline" size={13} color={Colors.textSecondary} />
              <Text style={styles.metaText}>{exerciseCount} ejercicios</Text>
            </View>
            {routine.estimated_duration_minutes && (
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
                <Text style={styles.metaText}>{routine.estimated_duration_minutes} min</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity style={styles.startBtn} onPress={onStart} activeOpacity={0.7}>
          <Ionicons name="play" size={16} color={Colors.textOnPrimary} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  left: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  description: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  meta: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginTop: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  startBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
