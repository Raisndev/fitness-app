import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { resetPassword } from '@/services/supabase/auth';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleReset() {
    if (!email.trim()) return;
    setLoading(true);
    try {
      await resetPassword(email.trim());
      setSent(true);
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'No se pudo enviar el email');
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} />
        </TouchableOpacity>

        {sent ? (
          <View style={styles.successArea}>
            <Ionicons name="mail-outline" size={60} color={Colors.primary} />
            <Text style={styles.title}>Email enviado</Text>
            <Text style={styles.subtitle}>
              Revisa tu bandeja de entrada en {email} y sigue el enlace para restablecer tu contraseña.
            </Text>
            <Button title="Volver al inicio" onPress={() => router.replace('/(auth)/login')} />
          </View>
        ) : (
          <>
            <Text style={styles.title}>Recuperar contraseña</Text>
            <Text style={styles.subtitle}>
              Introduce tu email y te enviaremos un enlace para restablecer tu contraseña.
            </Text>
            <Input
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              containerStyle={{ marginBottom: Spacing.xl }}
            />
            <Button
              title="Enviar enlace"
              size="lg"
              fullWidth
              loading={loading}
              onPress={handleReset}
            />
          </>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  container: { flex: 1, padding: Spacing.xl, gap: Spacing.lg },
  backBtn: { alignSelf: 'flex-start', marginBottom: Spacing.md },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: Colors.textSecondary, lineHeight: 22 },
  successArea: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.lg },
});
