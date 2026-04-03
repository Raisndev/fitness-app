import React, { useState } from 'react';
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  TouchableOpacity, Platform, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Colors, Spacing, Radius } from '@/constants/theme';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { signUpWithEmail, signInWithGoogle, signInWithApple } from '@/services/supabase/auth';

export default function RegisterScreen() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleRegister() {
    if (!fullName.trim() || !email.trim() || password.length < 6) {
      Alert.alert('Atención', 'Completa todos los campos y usa una contraseña de al menos 6 caracteres');
      return;
    }
    setLoading(true);
    try {
      await signUpWithEmail(email.trim(), password, fullName.trim());
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'No se pudo crear la cuenta');
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    try {
      await signInWithGoogle();
      router.replace('/(tabs)');
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'No se pudo iniciar sesión con Google');
    }
  }

  async function handleApple() {
    try {
      await signInWithApple();
      router.replace('/(tabs)');
    } catch (err: any) {
      if (err.code !== 'ERR_CANCELED') {
        Alert.alert('Error', err.message ?? 'No se pudo iniciar sesión con Apple');
      }
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color={Colors.text} />
          </TouchableOpacity>
          <Text style={styles.title}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Empieza a trackear tus entrenos</Text>
        </View>

        <View style={styles.oauth}>
          {Platform.OS === 'ios' && (
            <AppleAuthentication.AppleAuthenticationButton
              buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP}
              buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
              cornerRadius={Radius.md}
              style={styles.appleBtn}
              onPress={handleApple}
            />
          )}
          <TouchableOpacity style={styles.googleBtn} onPress={handleGoogle} activeOpacity={0.8}>
            <Ionicons name="logo-google" size={18} color={Colors.text} />
            <Text style={styles.googleText}>Continuar con Google</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o con email</Text>
          <View style={styles.dividerLine} />
        </View>

        <View style={styles.form}>
          <Input
            label="Nombre completo"
            value={fullName}
            onChangeText={setFullName}
            placeholder="Juan García"
            textContentType="name"
            autoCapitalize="words"
          />
          <Input
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="tu@email.com"
            keyboardType="email-address"
            textContentType="emailAddress"
          />
          <Input
            label="Contraseña"
            value={password}
            onChangeText={setPassword}
            placeholder="Mín. 6 caracteres"
            secureTextEntry={!showPassword}
            textContentType="newPassword"
            rightIcon={
              <TouchableOpacity onPress={() => setShowPassword((v) => !v)}>
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={Colors.textSecondary}
                />
              </TouchableOpacity>
            }
          />
        </View>

        <Button
          title="Crear cuenta"
          size="lg"
          fullWidth
          loading={loading}
          onPress={handleRegister}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.replace('/(auth)/login')}>
            <Text style={styles.footerLink}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  scroll: { padding: Spacing.xl, gap: Spacing.xl, paddingBottom: 40 },
  header: { gap: Spacing.xs },
  backBtn: { marginBottom: Spacing.md, alignSelf: 'flex-start' },
  title: { fontSize: 28, fontWeight: '800', color: Colors.text, letterSpacing: -0.5 },
  subtitle: { fontSize: 15, color: Colors.textSecondary },
  oauth: { gap: Spacing.md },
  appleBtn: { height: 50, width: '100%' },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.bgElevated,
    borderRadius: Radius.md,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  googleText: { fontSize: 15, fontWeight: '600', color: Colors.text },
  divider: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md },
  dividerLine: { flex: 1, height: 1, backgroundColor: Colors.border },
  dividerText: { fontSize: 12, color: Colors.textSecondary, fontWeight: '500' },
  form: { gap: Spacing.lg },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  footerText: { fontSize: 14, color: Colors.textSecondary },
  footerLink: { fontSize: 14, color: Colors.primary, fontWeight: '700' },
});
