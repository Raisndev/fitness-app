import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Switch, Alert, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { signOut } from '@/services/supabase/auth';
import { requestHealthKitPermissions, isHealthKitAvailable } from '@/services/healthkit';
import { router } from 'expo-router';

export default function ProfileScreen() {
  const { profile, user } = useAuthStore();
  const { unitSystem, healthkitEnabled, setUnitSystem, setHealthkitEnabled } = useSettingsStore();
  const [hkLoading, setHkLoading] = useState(false);

  const firstName = profile?.full_name?.split(' ')[0] ?? user?.email?.split('@')[0] ?? 'Atleta';

  async function handleHealthKitToggle(value: boolean) {
    if (!value) {
      setHealthkitEnabled(false);
      return;
    }
    if (!isHealthKitAvailable()) {
      Alert.alert('No disponible', 'Apple Health solo está disponible en iPhone con una build nativa.');
      return;
    }
    setHkLoading(true);
    const granted = await requestHealthKitPermissions();
    setHkLoading(false);
    if (granted) {
      setHealthkitEnabled(true);
    } else {
      Alert.alert('Sin permiso', 'Ve a Ajustes > Salud > Acceso de apps para habilitarlo.');
    }
  }

  async function handleSignOut() {
    Alert.alert('Cerrar sesión', '¿Seguro que quieres salir?', [
      { text: 'Cancelar' },
      {
        text: 'Salir',
        style: 'destructive',
        onPress: async () => {
          await signOut();
          router.replace('/(auth)/welcome');
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Avatar */}
        <View style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{firstName.charAt(0).toUpperCase()}</Text>
          </View>
          <Text style={styles.name}>{profile?.full_name ?? firstName}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        {/* Units */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Unidades</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={[styles.option, unitSystem === 'metric' && styles.optionActive]}
              onPress={() => setUnitSystem('metric')}
            >
              <Text style={[styles.optionText, unitSystem === 'metric' && styles.optionTextActive]}>
                Kilogramos (kg)
              </Text>
              {unitSystem === 'metric' && (
                <Ionicons name="checkmark" size={18} color={Colors.primary} />
              )}
            </TouchableOpacity>
            <View style={styles.optionSep} />
            <TouchableOpacity
              style={[styles.option, unitSystem === 'imperial' && styles.optionActive]}
              onPress={() => setUnitSystem('imperial')}
            >
              <Text style={[styles.optionText, unitSystem === 'imperial' && styles.optionTextActive]}>
                Libras (lb)
              </Text>
              {unitSystem === 'imperial' && (
                <Ionicons name="checkmark" size={18} color={Colors.primary} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Apple Health */}
        {Platform.OS === 'ios' && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Integraciones</Text>
            <View style={styles.card}>
              <View style={styles.row}>
                <View style={styles.rowLeft}>
                  <View style={styles.hkIcon}>
                    <Ionicons name="heart" size={20} color="#FF3B30" />
                  </View>
                  <View>
                    <Text style={styles.rowTitle}>Apple Fitness</Text>
                    <Text style={styles.rowSub}>
                      {healthkitEnabled ? 'Sincronizando entrenos' : 'Desactivado'}
                    </Text>
                  </View>
                </View>
                <Switch
                  value={healthkitEnabled}
                  onValueChange={handleHealthKitToggle}
                  disabled={hkLoading}
                  trackColor={{ false: Colors.border, true: Colors.primary + '88' }}
                  thumbColor={healthkitEnabled ? Colors.primary : Colors.textMuted}
                />
              </View>
            </View>
          </View>
        )}

        {/* Account */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cuenta</Text>
          <View style={styles.card}>
            <TouchableOpacity style={styles.row} onPress={handleSignOut}>
              <View style={styles.rowLeft}>
                <Ionicons name="log-out-outline" size={20} color={Colors.accent} />
                <Text style={[styles.rowTitle, { color: Colors.accent }]}>Cerrar sesión</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={Colors.textMuted} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.version}>FitTrack v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.xl, gap: Spacing.xl, paddingBottom: 40 },
  avatarSection: { alignItems: 'center', gap: Spacing.sm, paddingVertical: Spacing.lg },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 3, borderColor: Colors.primary,
  },
  avatarText: { fontSize: 32, fontWeight: '800', color: Colors.primary },
  name: { fontSize: 20, fontWeight: '700', color: Colors.text },
  email: { fontSize: 13, color: Colors.textSecondary },
  section: { gap: Spacing.md },
  sectionTitle: { fontSize: 13, fontWeight: '600', color: Colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  card: {
    backgroundColor: Colors.bgCard,
    borderRadius: Radius.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  optionActive: { backgroundColor: Colors.primary + '0D' },
  optionText: { fontSize: 15, color: Colors.text, fontWeight: '500' },
  optionTextActive: { color: Colors.primary, fontWeight: '600' },
  optionSep: { height: 1, backgroundColor: Colors.border },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.lg,
  },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  rowTitle: { fontSize: 15, fontWeight: '600', color: Colors.text },
  rowSub: { fontSize: 12, color: Colors.textSecondary, marginTop: 2 },
  hkIcon: {
    width: 36, height: 36, borderRadius: Radius.sm,
    backgroundColor: '#FF3B3020',
    alignItems: 'center', justifyContent: 'center',
  },
  version: { textAlign: 'center', fontSize: 12, color: Colors.textMuted },
});
