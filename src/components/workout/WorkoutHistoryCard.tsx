import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { WorkoutSession } from '@/types';
import { formatDate, formatDuration, formatVolume } from '@/utils/formatters';
import { useSettingsStore } from '@/store/settingsStore';

interface WorkoutHistoryCardProps {
  session: WorkoutSession;
  onPress?: () => void;
}

export function WorkoutHistoryCard({ session, onPress }: WorkoutHistoryCardProps) {
  const unitSystem = useSettingsStore((s) => s.unitSystem);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.row}>
        <View style={styles.left}>
          <Text style={styles.name}>{session.name}</Text>
          <Text style={styles.date}>{formatDate(session.started_at)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
      </View>
      <View style={styles.stats}>
        {session.duration_seconds && (
          <View style={styles.stat}>
            <Ionicons name="time-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.statText}>{formatDuration(session.duration_seconds)}</Text>
          </View>
        )}
        {session.total_volume_kg && (
          <View style={styles.stat}>
            <Ionicons name="barbell-outline" size={13} color={Colors.textSecondary} />
            <Text style={styles.statText}>{formatVolume(session.total_volume_kg, unitSystem)}</Text>
          </View>
        )}
        {session.healthkit_sync_id && (
          <View style={styles.stat}>
            <Ionicons name="heart-outline" size={13} color={Colors.accent} />
            <Text style={[styles.statText, { color: Colors.accent }]}>Apple Health</Text>
          </View>
        )}
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
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  left: {
    flex: 1,
    gap: 2,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  date: {
    fontSize: 12,
    color: Colors.textSecondary,
    textTransform: 'capitalize',
  },
  stats: {
    flexDirection: 'row',
    gap: Spacing.lg,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
});
