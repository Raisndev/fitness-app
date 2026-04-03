import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from 'react-native';
import BottomSheet, { BottomSheetTextInput, BottomSheetView } from '@gorhom/bottom-sheet';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { Exercise, EquipmentRecord } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { MUSCLE_GROUP_LABELS, MuscleGroup } from '@/constants/exercises';
import { fetchEquipment } from '@/services/supabase/exercises';
import { router } from 'expo-router';

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
  const [equipmentFilter, setEquipmentFilter] = useState<string | 'all'>('all');
  const [equipmentList, setEquipmentList] = useState<EquipmentRecord[]>([]);

  const snapPoints = useMemo(() => ['75%', '92%'], []);

  useEffect(() => {
    fetchEquipment().then(setEquipmentList).catch(console.error);
  }, []);

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      const matchesQuery = ex.name.toLowerCase().includes(query.toLowerCase());
      const matchesCategory = category === 'all' || ex.category === category;
      const matchesEquipment =
        equipmentFilter === 'all' ||
        ex.equipment === equipmentFilter ||
        ex.equipment_id === equipmentFilter;
      return matchesQuery && matchesCategory && matchesEquipment;
    });
  }, [exercises, query, category, equipmentFilter]);

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
        <View style={styles.titleRow}>
          <Text style={styles.title}>Añadir ejercicio</Text>
          <TouchableOpacity
            onPress={() => {
              bottomSheetRef.current?.close();
              router.push('/exercises/create');
            }}
            style={styles.createBtn}
          >
            <Ionicons name="add" size={16} color={Colors.primary} />
            <Text style={styles.createBtnText}>Crear</Text>
          </TouchableOpacity>
        </View>

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
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Ionicons name="close-circle" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Category filter */}
        <FlatList
          horizontal
          data={CATEGORIES}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          style={styles.filterList}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.filterBtn, category === item.key && styles.filterBtnActive]}
              onPress={() => setCategory(item.key as MuscleGroup | 'all')}
            >
              <Text style={[styles.filterText, category === item.key && styles.filterTextActive]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Equipment filter */}
        <FlatList
          horizontal
          data={[{ id: 'all', slug: 'all', name: 'Todo equipo', icon_name: null } as any, ...equipmentList]}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          style={styles.filterList}
          contentContainerStyle={styles.filterContent}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.equipBtn,
                (equipmentFilter === item.id || (item.id === 'all' && equipmentFilter === 'all')) &&
                  styles.equipBtnActive,
              ]}
              onPress={() => setEquipmentFilter(item.id === 'all' ? 'all' : item.slug)}
            >
              {item.icon_name && (
                <Ionicons
                  name={item.icon_name as any}
                  size={13}
                  color={
                    equipmentFilter === item.slug || (item.id === 'all' && equipmentFilter === 'all')
                      ? Colors.secondary
                      : Colors.textMuted
                  }
                />
              )}
              <Text
                style={[
                  styles.equipText,
                  (equipmentFilter === item.slug || (item.id === 'all' && equipmentFilter === 'all')) &&
                    styles.equipTextActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />

        {/* Results count */}
        {!loading && query.length > 0 && (
          <Text style={styles.resultCount}>{filtered.length} ejercicios</Text>
        )}

        {/* Results */}
        {loading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: Spacing.xl }} />
        ) : (
          <FlatList
            data={filtered}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
            ListEmptyComponent={
              <View style={styles.empty}>
                <Ionicons name="search-outline" size={32} color={Colors.textMuted} />
                <Text style={styles.emptyText}>Sin resultados</Text>
              </View>
            }
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.exerciseItem}
                onPress={() => handleSelect(item)}
                activeOpacity={0.7}
              >
                {/* Thumbnail */}
                <View style={styles.thumbWrap}>
                  {item.thumbnail_url ? (
                    <Image
                      source={{ uri: item.thumbnail_url }}
                      style={styles.thumb}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.thumbPlaceholder, styles.thumb]}>
                      <Ionicons name="barbell-outline" size={20} color={Colors.textMuted} />
                    </View>
                  )}
                </View>

                {/* Info */}
                <View style={styles.exerciseInfo}>
                  <Text style={styles.exerciseName}>{item.name}</Text>
                  <View style={styles.exerciseMeta}>
                    <Badge
                      label={MUSCLE_GROUP_LABELS[item.category]}
                      category={item.category}
                    />
                    {item.equipment_record && (
                      <View style={styles.equipPill}>
                        {item.equipment_record.icon_name && (
                          <Ionicons
                            name={item.equipment_record.icon_name as any}
                            size={11}
                            color={Colors.textMuted}
                          />
                        )}
                        <Text style={styles.equipPillText}>{item.equipment_record.name}</Text>
                      </View>
                    )}
                    {item.video_url && (
                      <Ionicons name="play-circle-outline" size={14} color={Colors.secondary} />
                    )}
                  </View>
                </View>

                {/* Detail link */}
                <TouchableOpacity
                  style={styles.detailBtn}
                  onPress={() => {
                    bottomSheetRef.current?.close();
                    router.push(`/exercises/${item.id}`);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="information-circle-outline" size={20} color={Colors.textMuted} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.addBtn}
                  onPress={() => handleSelect(item)}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="add" size={20} color={Colors.textOnPrimary} />
                </TouchableOpacity>
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
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  title: { fontSize: 18, fontWeight: '700', color: Colors.text },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: Colors.primary + '22',
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: Colors.primary + '55',
  },
  createBtnText: { fontSize: 13, fontWeight: '700', color: Colors.primary },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.bgElevated,
    marginHorizontal: Spacing.lg,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  searchIcon: { marginRight: Spacing.sm },
  searchInput: { flex: 1, paddingVertical: Spacing.md, color: Colors.text, fontSize: 15 },
  filterList: { maxHeight: 40, marginBottom: Spacing.xs },
  filterContent: { gap: Spacing.sm, paddingHorizontal: Spacing.lg },
  filterBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterBtnActive: { backgroundColor: Colors.primary + '22', borderColor: Colors.primary },
  filterText: { fontSize: 12, fontWeight: '500', color: Colors.textSecondary },
  filterTextActive: { color: Colors.primary, fontWeight: '700' },
  equipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.md,
    paddingVertical: 5,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  equipBtnActive: { backgroundColor: Colors.secondary + '22', borderColor: Colors.secondary },
  equipText: { fontSize: 11, fontWeight: '500', color: Colors.textMuted },
  equipTextActive: { color: Colors.secondary, fontWeight: '700' },
  resultCount: {
    fontSize: 11,
    color: Colors.textMuted,
    paddingHorizontal: Spacing.lg,
    marginBottom: 4,
  },
  listContent: { paddingHorizontal: Spacing.lg, paddingBottom: 40 },
  separator: { height: 1, backgroundColor: Colors.border },
  exerciseItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    gap: Spacing.md,
  },
  thumbWrap: {
    width: 52,
    height: 52,
    borderRadius: Radius.md,
    overflow: 'hidden',
    flexShrink: 0,
  },
  thumb: { width: 52, height: 52, borderRadius: Radius.md },
  thumbPlaceholder: {
    backgroundColor: Colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exerciseInfo: { flex: 1, gap: 5 },
  exerciseName: { fontSize: 14, fontWeight: '600', color: Colors.text },
  exerciseMeta: { flexDirection: 'row', gap: 6, alignItems: 'center', flexWrap: 'wrap' },
  equipPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: Colors.bgElevated,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: Radius.full,
  },
  equipPillText: { fontSize: 10, color: Colors.textMuted, fontWeight: '500' },
  detailBtn: { padding: 4 },
  addBtn: {
    backgroundColor: Colors.primary,
    borderRadius: Radius.full,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: { alignItems: 'center', paddingVertical: Spacing.xxl, gap: Spacing.sm },
  emptyText: { color: Colors.textSecondary, fontSize: 14 },
});
