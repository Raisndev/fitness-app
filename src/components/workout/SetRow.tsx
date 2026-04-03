import React, { useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { ActiveSet } from '@/types';
import { useSettingsStore } from '@/store/settingsStore';

interface SetRowProps {
  set: ActiveSet;
  onUpdate: (updates: Partial<ActiveSet>) => void;
  onComplete: () => void;
  onRemove: () => void;
  unitSystem?: 'metric' | 'imperial';
}

export function SetRow({ set, onUpdate, onComplete, onRemove }: SetRowProps) {
  const unitSystem = useSettingsStore((s) => s.unitSystem);
  const weightRef = useRef<TextInput>(null);
  const repsRef = useRef<TextInput>(null);

  const weightLabel = unitSystem === 'imperial' ? 'lb' : 'kg';

  const handleComplete = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    onComplete();
  };

  return (
    <View style={[styles.row, set.isDone && styles.rowDone]}>
      {/* Set number */}
      <View style={styles.setNum}>
        {set.isWarmup ? (
          <Text style={styles.warmupLabel}>W</Text>
        ) : (
          <Text style={[styles.setNumText, set.isDone && styles.setNumDone]}>
            {set.setNumber}
          </Text>
        )}
      </View>

      {/* Weight */}
      <View style={styles.cell}>
        <Text style={styles.cellLabel}>{weightLabel}</Text>
        <TextInput
          ref={weightRef}
          style={[styles.input, set.isDone && styles.inputDone]}
          value={set.weightKg}
          onChangeText={(v) => onUpdate({ weightKg: v })}
          keyboardType="decimal-pad"
          placeholder="—"
          placeholderTextColor={Colors.textMuted}
          editable={!set.isDone}
          returnKeyType="next"
          onSubmitEditing={() => repsRef.current?.focus()}
        />
      </View>

      {/* Reps */}
      <View style={styles.cell}>
        <Text style={styles.cellLabel}>reps</Text>
        <TextInput
          ref={repsRef}
          style={[styles.input, set.isDone && styles.inputDone]}
          value={set.reps}
          onChangeText={(v) => onUpdate({ reps: v })}
          keyboardType="number-pad"
          placeholder="—"
          placeholderTextColor={Colors.textMuted}
          editable={!set.isDone}
          returnKeyType="done"
        />
      </View>

      {/* Done / Remove */}
      {set.isDone ? (
        <View style={styles.doneIcon}>
          <Ionicons name="checkmark-circle" size={28} color={Colors.primary} />
          {set.isPersonalRecord && (
            <Text style={styles.prBadge}>PR</Text>
          )}
        </View>
      ) : (
        <View style={styles.actions}>
          <TouchableOpacity onPress={handleComplete} style={styles.doneBtn}>
            <Ionicons name="checkmark" size={20} color={Colors.textOnPrimary} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onRemove} style={styles.removeBtn}>
            <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  rowDone: {
    opacity: 0.7,
  },
  setNum: {
    width: 28,
    alignItems: 'center',
  },
  setNumText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  setNumDone: {
    color: Colors.primary,
  },
  warmupLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.warning,
  },
  cell: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
  },
  cellLabel: {
    fontSize: 10,
    color: Colors.textMuted,
    fontWeight: '500',
    textTransform: 'uppercase',
  },
  input: {
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    color: Colors.text,
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  inputDone: {
    borderColor: 'transparent',
    backgroundColor: 'transparent',
  },
  doneIcon: {
    width: 48,
    alignItems: 'center',
  },
  prBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 0.5,
  },
  actions: {
    width: 48,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  doneBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.sm,
    padding: 5,
  },
  removeBtn: {
    padding: 4,
  },
});
