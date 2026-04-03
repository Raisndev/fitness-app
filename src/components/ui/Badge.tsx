import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { MuscleGroup } from '@/constants/exercises';

const CATEGORY_COLORS: Record<MuscleGroup, string> = {
  chest: Colors.chest,
  back: Colors.back,
  legs: Colors.legs,
  shoulders: Colors.shoulders,
  arms: Colors.arms,
  core: Colors.core,
  cardio: Colors.cardio,
};

interface BadgeProps {
  label: string;
  category?: MuscleGroup;
  color?: string;
}

export function Badge({ label, category, color }: BadgeProps) {
  const bg = color ?? (category ? CATEGORY_COLORS[category] : Colors.bgElevated);

  return (
    <View style={[styles.badge, { backgroundColor: bg + '22', borderColor: bg + '66' }]}>
      <Text style={[styles.text, { color: bg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: Radius.full,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
