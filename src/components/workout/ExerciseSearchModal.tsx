import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import BottomSheet, { BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { Exercise } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { MUSCLE_GROUP_LABELS, MuscleGroup } from '@/constants/exercises';

interface ExerciseSearchModalProps {
  bottomSheetRef: React.RefObject<BottomSheet>;
  exercises: Exercise[];
  loading?: boolean;
  onSelect: (exercise: Exercise) => void;
}

const CATEGORIES: Array<{ key: MuscleGroup | 'all'; label: string }> = [
  { key: 'all', label: 'Todos' },
  { key: 'chest', label: MUSCLE_GROUP_LABELS.chest },
  { key: 'back', label: MUSCLE_GROUP_LABELS.back },
  { key: 'legs', label: MUSCLE_GROUP_LABELS.legs },
  { key: 'shoulders', label: MUSCLE_GROUP_LABELS.shoulders },
  { key: 'arms', label: MUSCLE_GROUP_LABELS.arms },
  { key: 'core', label: MUSCLE_GROUP_LABELS.core },
  { key: 'cardio', label: MUSCLE_GROUP_LABELS.cardio },
];

export function ExerciseSearchModal({
  bottomSheetRef,
  exercises,
  loading,
  onSelect,
}: ExerciseSearchModalProps) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<MuscleGroup | 'all'>('all');

  const snapPoints = useMemo(() => ['75%', '92%'], []);

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesQuery = ex.name.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'all' || ex.category === category;
      return matchesQuery && matchesCategory;
    });
  }, [exercises, query, category]);

  const handleSelect = useCallback(
    (exercise: Exercise) => {
      bottomSheetRef.current?.close();
      setQuery('');
      onSelect(exercise);
    },
    [bottomSheetRef, onSelect]
  );

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
    >
      <BottomSheetView style={styles.container}>
        <Text style={styles.title}>Añadir ejercicio</Text>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={16} color={Colors.textMuted} style={styles.searchIcon} />
          <BottomSheetTextInput
            style={styles.searchInput}
            placeholder="Buscar ejercicio..."
            placeholderTextColor={Colors.textMuted}
            value={query}
            onChangeText={setQuery}
          />
        </View>

        {/* Category filter */}
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          style={styles.categoryList}
          contentContainerStyle={{ gap: Spacing.sm, paddingHorizontal: Spacing.lg }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.categoryBtn, category === item.key && styles.categoryBtnActive]}
              onPress={() => setCategory(item.key as MuscleGroup | 'all')}
            >
              <Text
                style={[styles.categoryText, category === item.key && styles.categoryTextActive]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Results */}
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xl }} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: Spacing.lg, paddingBottom: 40 }}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.exerciseItem}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                <View style={styles.exerciseLeft}>
                  <Text style={styles.exerciseName}>{item.name}</Text>
                  <Badge label={MUSCLE_GROUP_LABELS[item.category]} category={item.category} />
                </View>
                <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />
              </TouchableOpacity>
            )}
          />
        )}
      </BottomSheetView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBg: { backgroundColor: Colors.bgCard },
  handle: { backgroundColor: Colors.border },
  container: { flex: 1, paddingTop: Spacing.md },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgElevated,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.md,
  },
  searchIcon: { marginRight: Spacing.sm },
  searchInput: {
    flex: 1,
    paddingVertical: Spacing.md,
    color: Colors.text,
    fontSize: 15,
  },
  categoryList: { maxHeight: 44, marginBottom: Spacing.md },
  categoryBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  categoryBtnActive: {
    backgroundColor: Colors.primary + '22',
    borderColor: Colors.primary,
  },
  categoryText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  categoryTextActive: { color: Colors.primary, fontWeight: '700' },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
  },
  exerciseLeft: { flex: 1, gap: 4 },
  exerciseName: { fontSize: 15, fontWeight: '600', color: Colors.text },
  separator: { height: 1, backgroundColor: Colors.border },
});
