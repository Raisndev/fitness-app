import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { Colors, Spacing, Radius } from '@/constants/theme';

interface RestTimerProps {
  remaining: number;
  total: number;
  onSkip: () => void;
}

export function RestTimer({ remaining, total, onSkip }: RestTimerProps) {
  const progress = total > 0 ? remaining / total : 0;

  const barStyle = useAnimatedStyle(() => ({
    width: `${withTiming(progress * 100, { duration: 900 })}%` as any,
  }));

  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>Descanso</Text>
        <Text style={styles.timer}>
          {minutes > 0 ? `${minutes}:` : ''}{seconds.toString().padStart(2, '0')}
        </Text>
        <TouchableOpacity onPress={onSkip} style={styles.skipBtn}>
          <Text style={styles.skipText}>Saltar</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.track}>
        <Animated.View style={[styles.bar, barStyle]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    padding: Spacing.md,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    flex: 1,
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  timer: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.secondary,
    marginRight: Spacing.lg,
  },
  skipBtn: {
    paddingVertical: 4,
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  skipText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  track: {
    height: 4,
    backgroundColor: Colors.border,
    borderRadius: Radius.full,
    overflow: 'hidden',
  },
  bar: {
    height: '100%',
    backgroundColor: Colors.secondary,
    borderRadius: Radius.full,
  },
});
