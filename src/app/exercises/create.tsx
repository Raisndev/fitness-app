import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import {
  fetchEquipment,
  fetchExercise,
  createCustomExercise,
  updateExercise,
  uploadExerciseImage,
} from '@/services/supabase/exercises';
import { EquipmentRecord } from '@/types';
import { MuscleGroup, MUSCLE_GROUP_LABELS, EQUIPMENT_LABELS } from '@/constants/exercises';

// On a real device, use expo-image-picker. Here we use a URL input as fallback.
let ImagePicker: any = null;
try {
  ImagePicker = require('expo-image-picker');
} catch {
  // not available in all environments
}

const CATEGORIES: MuscleGroup[] = ['chest', 'back', 'legs', 'shoulders', 'arms', 'core', 'cardio'];

const MUSCLE_OPTIONS: Record<MuscleGroup, string[]> = {
  chest:     ['pectoralis_major', 'triceps', 'anterior_deltoid'],
  back:      ['latissimus_dorsi', 'rhomboids', 'erector_spinae', 'biceps', 'rear_deltoid'],
  legs:      ['quadriceps', 'hamstrings', 'glutes', 'calves', 'hip_flexors'],
  shoulders: ['anterior_deltoid', 'lateral_deltoid', 'rear_deltoid'],
  arms:      ['biceps', 'triceps', 'brachioradialis'],
  core:      ['rectus_abdominis', 'obliques', 'transverse_abdominis'],
  cardio:    ['cardiovascular'],
};

export default function CreateExerciseScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEditing = !!id;

  const [name, setName] = useState('');
  const [category, setCategory] = useState<MuscleGroup>('chest');
  const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
  const [equipmentId, setEquipmentId] = useState<string | null>(null);
  const [instructions, setInstructions] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [thumbnailUrl, setThumbnailUrl] = useState('');

  const [equipmentList, setEquipmentList] = useState<EquipmentRecord[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  useEffect(() => {
    fetchEquipment().then(setEquipmentList).catch(console.error);

    if (isEditing && id) {
      fetchExercise(id).then((ex) => {
        setName(ex.name);
        setCategory(ex.category);
        setSelectedMuscles(ex.muscle_group);
        setEquipmentId(ex.equipment_id);
        setInstructions(ex.instructions ?? '');
        setVideoUrl(ex.video_url ?? '');
        setImageUrl(ex.image_url ?? '');
        setThumbnailUrl(ex.thumbnail_url ?? '');
      }).catch(console.error);
    }
  }, []);

  // Update default muscles when category changes (only for new exercises)
  useEffect(() => {
    if (!isEditing) {
      setSelectedMuscles(MUSCLE_OPTIONS[category].slice(0, 1));
    }
  }, [category, isEditing]);

  function toggleMuscle(muscle: string) {
    setSelectedMuscles((prev) =>
      prev.includes(muscle) ? prev.filter((m) => m !== muscle) : [...prev, muscle]
    );
  }

  async function pickImage(type: 'image' | 'thumbnail') {
    if (!ImagePicker) {
      Alert.alert('No disponible', 'expo-image-picker no está instalado. Introduce la URL manualmente.');
      return;
    }

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permiso denegado', 'Necesitas permitir acceso a la galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: type === 'thumbnail' ? [1, 1] : [16, 9],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.[0]) return;

    const asset = result.assets[0];
    const setter = type === 'thumbnail' ? setUploadingThumb : setUploadingImage;
    setter(true);

    try {
      // We need an exercise ID to upload — save first if new
      let exerciseId = id;
      if (!exerciseId) {
        Alert.alert('Guarda primero', 'Guarda el ejercicio antes de subir imágenes.');
        return;
      }
      const url = await uploadExerciseImage(exerciseId, type === 'thumbnail' ? 'thumbnails' : 'images', asset.uri);
      if (type === 'thumbnail') setThumbnailUrl(url);
      else setImageUrl(url);
    } catch (err: any) {
      Alert.alert('Error subiendo imagen', err.message ?? 'Inténtalo de nuevo');
    } finally {
      setter(false);
    }
  }

  async function handleSave() {
    if (!name.trim()) {
      Alert.alert('Nombre requerido', 'Ponle un nombre al ejercicio');
      return;
    }
    if (selectedMuscles.length === 0) {
      Alert.alert('Selecciona músculos', 'Elige al menos un grupo muscular');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        name: name.trim(),
        category,
        muscle_group: selectedMuscles,
        equipment: equipmentList.find((e) => e.id === equipmentId)?.slug ?? null,
        equipment_id: equipmentId,
        instructions: instructions.trim() || null,
        video_url: videoUrl.trim() || null,
        image_url: imageUrl.trim() || null,
        thumbnail_url: thumbnailUrl.trim() || null,
      };

      if (isEditing && id) {
        await updateExercise(id, payload);
      } else {
        await createCustomExercise(payload);
      }

      router.back();
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'No se pudo guardar el ejercicio');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Name */}
        <Input
          label="Nombre del ejercicio *"
          value={name}
          onChangeText={setName}
          placeholder="Ej: Press de banca con agarre estrecho"
          autoCapitalize="sentences"
        />

        {/* Category */}
        <View style={styles.field}>
          <Text style={styles.label}>Categoría *</Text>
          <View style={styles.pillRow}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat}
                style={[styles.pill, category === cat && styles.pillActive]}
                onPress={() => setCategory(cat)}
              >
                <Text style={[styles.pillText, category === cat && styles.pillTextActive]}>
                  {MUSCLE_GROUP_LABELS[cat]}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Muscles */}
        <View style={styles.field}>
          <Text style={styles.label}>Músculos *</Text>
          <View style={styles.pillRow}>
            {MUSCLE_OPTIONS[category].map((m) => (
              <TouchableOpacity
                key={m}
                style={[styles.pill, selectedMuscles.includes(m) && styles.pillActive]}
                onPress={() => toggleMuscle(m)}
              >
                <Text
                  style={[styles.pillText, selectedMuscles.includes(m) && styles.pillTextActive]}
                >
                  {m.replace(/_/g, ' ')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Equipment */}
        <View style={styles.field}>
          <Text style={styles.label}>Equipamiento</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.pillRow}>
              <TouchableOpacity
                style={[styles.pill, equipmentId === null && styles.pillActive]}
                onPress={() => setEquipmentId(null)}
              >
                <Text style={[styles.pillText, equipmentId === null && styles.pillTextActive]}>
                  Sin equipamiento
                </Text>
              </TouchableOpacity>
              {equipmentList.map((eq) => (
                <TouchableOpacity
                  key={eq.id}
                  style={[styles.pill, equipmentId === eq.id && styles.pillSecActive]}
                  onPress={() => setEquipmentId(eq.id)}
                >
                  <View style={styles.pillInner}>
                    {eq.icon_name && (
                      <Ionicons
                        name={eq.icon_name as any}
                        size={13}
                        color={equipmentId === eq.id ? Colors.secondary : Colors.textMuted}
                      />
                    )}
                    <Text
                      style={[
                        styles.pillText,
                        equipmentId === eq.id && styles.pillTextSecActive,
                      ]}
                    >
                      {eq.name}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* Instructions */}
        <Input
          label="Instrucciones / descripción"
          value={instructions}
          onChangeText={setInstructions}
          placeholder="Describe la técnica correcta..."
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          containerStyle={{ minHeight: 100 }}
        />

        {/* ── Media ─────────────────────────────────────────── */}
        <Text style={styles.sectionTitle}>Media</Text>

        {/* Video URL */}
        <Input
          label="URL del video (YouTube, Vimeo, etc.)"
          value={videoUrl}
          onChangeText={setVideoUrl}
          placeholder="https://youtube.com/watch?v=..."
          keyboardType="url"
          autoCapitalize="none"
          leftIcon={<Ionicons name="play-circle-outline" size={18} color={Colors.secondary} />}
        />

        {/* Full image */}
        <View style={styles.field}>
          <Text style={styles.label}>Imagen completa</Text>
          {imageUrl ? (
            <View style={styles.imagePreviewWrap}>
              <Image source={{ uri: imageUrl }} style={styles.imagePreview} resizeMode="cover" />
              <TouchableOpacity
                style={styles.imageRemoveBtn}
                onPress={() => setImageUrl('')}
              >
                <Ionicons name="close-circle" size={22} color={Colors.accent} />
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.mediaRow}>
            {ImagePicker && isEditing && (
              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={() => pickImage('image')}
                disabled={uploadingImage}
              >
                {uploadingImage ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Ionicons name="cloud-upload-outline" size={18} color={Colors.primary} />
                )}
                <Text style={styles.uploadBtnText}>
                  {uploadingImage ? 'Subiendo...' : 'Subir imagen'}
                </Text>
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }}>
              <Input
                value={imageUrl}
                onChangeText={setImageUrl}
                placeholder="O pega una URL..."
                keyboardType="url"
                autoCapitalize="none"
                leftIcon={<Ionicons name="image-outline" size={16} color={Colors.textMuted} />}
              />
            </View>
          </View>
        </View>

        {/* Thumbnail */}
        <View style={styles.field}>
          <Text style={styles.label}>Imagen de previsualización (thumbnail)</Text>
          {thumbnailUrl ? (
            <View style={styles.thumbPreviewWrap}>
              <Image source={{ uri: thumbnailUrl }} style={styles.thumbPreview} resizeMode="cover" />
              <TouchableOpacity
                style={styles.imageRemoveBtn}
                onPress={() => setThumbnailUrl('')}
              >
                <Ionicons name="close-circle" size={22} color={Colors.accent} />
              </TouchableOpacity>
            </View>
          ) : null}

          <View style={styles.mediaRow}>
            {ImagePicker && isEditing && (
              <TouchableOpacity
                style={styles.uploadBtn}
                onPress={() => pickImage('thumbnail')}
                disabled={uploadingThumb}
              >
                {uploadingThumb ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <Ionicons name="cloud-upload-outline" size={18} color={Colors.primary} />
                )}
                <Text style={styles.uploadBtnText}>
                  {uploadingThumb ? 'Subiendo...' : 'Subir thumbnail'}
                </Text>
              </TouchableOpacity>
            )}
            <View style={{ flex: 1 }}>
              <Input
                value={thumbnailUrl}
                onChangeText={setThumbnailUrl}
                placeholder="O pega una URL (≈120×120)..."
                keyboardType="url"
                autoCapitalize="none"
                leftIcon={<Ionicons name="image-outline" size={16} color={Colors.textMuted} />}
              />
            </View>
          </View>
          <Text style={styles.hint}>
            Se muestra en la lista de búsqueda. Idealmente una imagen cuadrada de al menos 120×120 px.
          </Text>
        </View>

        <Button
          title={isEditing ? 'Guardar cambios' : 'Crear ejercicio'}
          size="lg"
          fullWidth
          loading={saving}
          onPress={handleSave}
          style={{ marginTop: Spacing.sm }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.xl, gap: Spacing.lg, paddingBottom: 48 },
  field: { gap: Spacing.sm },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.lg,
  },

  // Pills
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 7,
    borderRadius: Radius.full,
    backgroundColor: Colors.bgElevated,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  pillActive: {
    backgroundColor: Colors.primary + '22',
    borderColor: Colors.primary,
  },
  pillSecActive: {
    backgroundColor: Colors.secondary + '22',
    borderColor: Colors.secondary,
  },
  pillInner: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  pillText: { fontSize: 13, fontWeight: '500', color: Colors.textSecondary },
  pillTextActive: { color: Colors.primary, fontWeight: '700' },
  pillTextSecActive: { color: Colors.secondary, fontWeight: '700' },

  // Media
  imagePreviewWrap: {
    position: 'relative',
    borderRadius: Radius.md,
    overflow: 'hidden',
    marginBottom: Spacing.sm,
  },
  imagePreview: {
    width: '100%',
    height: 180,
    borderRadius: Radius.md,
  },
  thumbPreviewWrap: {
    position: 'relative',
    alignSelf: 'flex-start',
    borderRadius: Radius.md,
    overflow: 'visible',
    marginBottom: Spacing.sm,
  },
  thumbPreview: {
    width: 80,
    height: 80,
    borderRadius: Radius.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  imageRemoveBtn: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: Colors.bg,
    borderRadius: 11,
  },
  mediaRow: { flexDirection: 'row', gap: Spacing.sm, alignItems: 'center' },
  uploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  uploadBtnText: { fontSize: 12, fontWeight: '600', color: Colors.primary },
  hint: { fontSize: 11, color: Colors.textMuted, lineHeight: 16 },
});
