import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Colors, Radius, Spacing } from '@/constants/theme';
import { ProgressPeriod } from '@/types';

const PERIODS: Array<{ key: ProgressPeriod; label: string }> = [
  { key: '1W', label: '1S' },
  { key: '1M', label: '1M' },
  { key: '3M', label: '3M' },
  { key: '1Y', label: '1A' },
  { key: 'ALL', label: 'Todo' },
];

interface PeriodSelectorProps {
  selected: ProgressPeriod;
  onChange: (period: ProgressPeriod) => void;
}

export function PeriodSelector({ selected, onChange }: PeriodSelectorProps) {
  return (
    <View style={styles.container}>
      {PERIODS.map((p) => (
        <TouchableOpacity
          key={p.key}
          style={[styles.btn, selected === p.key && styles.btnActive]}
          onPress={() => onChange(p.key)}
          activeOpacity={0.7}
        >
          <Text style={[styles.text, selected === p.key && styles.textActive]}>{p.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.md,
    padding: 3,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 2,
  },
  btn: {
    flex: 1,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.sm,
    alignItems: 'center',
  },
  btnActive: {
    backgroundColor: Colors.primary,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  textActive: {
    color: Colors.textOnPrimary,
  },
});
