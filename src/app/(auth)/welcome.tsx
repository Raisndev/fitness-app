import React from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { Button } from '@/components/ui/Button';

export default function WelcomeScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#0A0A0A', '#0D1A0A', '#0A0A0A']}
        style={StyleSheet.absoluteFillObject}
      />

      {/* Decorative glow */}
      <View style={styles.glow} />

      <SafeAreaView style={styles.safe}>
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={styles.logoIcon}>
            <Ionicons name="barbell" size={40} color={Colors.textOnPrimary} />
          </View>
          <Text style={styles.appName}>FitTrack</Text>
          <Text style={styles.tagline}>Cada repetición cuenta.</Text>
        </View>

        {/* Features */}
        <View style={styles.features}>
          {[
            { icon: 'calendar-outline' as const, text: 'Registra tus entrenos fácilmente' },
            { icon: 'trending-up-outline' as const, text: 'Visualiza tu progreso con gráficas' },
            { icon: 'heart-outline' as const, text: 'Conecta con Apple Fitness' },
          ].map((f, i) => (
            <View key={i} style={styles.feature}>
              <View style={styles.featureIcon}>
                <Ionicons name={f.icon} size={20} color={Colors.primary} />
              </View>
              <Text style={styles.featureText}>{f.text}</Text>
            </View>
          ))}
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            title="Crear cuenta"
            size="lg"
            fullWidth
            onPress={() => router.push('/(auth)/register')}
          />
          <Button
            title="Ya tengo una cuenta"
            variant="ghost"
            size="lg"
            fullWidth
            onPress={() => router.push('/(auth)/login')}
          />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.bg },
  glow: {
    position: 'absolute',
    top: -100,
    left: '50%',
    marginLeft: -150,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: Colors.primary,
    opacity: 0.06,
  },
  safe: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    justifyContent: 'space-between',
    paddingVertical: Spacing.xxl,
  },
  logoArea: {
    alignItems: 'center',
    paddingTop: Spacing.xxxl,
    gap: Spacing.md,
  },
  logoIcon: {
    width: 80,
    height: 80,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
  },
  appName: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.text,
    letterSpacing: -1,
  },
  tagline: {
    fontSize: 16,
    color: Colors.textSecondary,
    fontWeight: '400',
  },
  features: {
    gap: Spacing.lg,
  },
  feature: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  featureIcon: {
    width: 44,
    height: 44,
    borderRadius: Radius.md,
    backgroundColor: Colors.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureText: {
    fontSize: 16,
    color: Colors.text,
    fontWeight: '500',
    flex: 1,
  },
  actions: {
    gap: Spacing.md,
  },
});
