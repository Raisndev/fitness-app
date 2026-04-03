import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '@/store/authStore';
import { useSettingsStore } from '@/store/settingsStore';
import { useWorkoutStore } from '@/store/workoutStore';

export default function RootLayout() {
  const initialize = useAuthStore((s) => s.initialize);
  const loadSettings = useSettingsStore((s) => s.load);
  const restoreWorkout = useWorkoutStore((s) => s.restoreFromStorage);

  useEffect(() => {
    initialize();
    loadSettings();
    restoreWorkout();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="light" backgroundColor="#0A0A0A" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#0A0A0A' } }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="workout/active"
          options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }}
        />
        <Stack.Screen
          name="workout/complete"
          options={{ presentation: 'fullScreenModal', animation: 'fade' }}
        />
        <Stack.Screen name="workout/[id]" options={{ headerShown: true, headerStyle: { backgroundColor: '#0A0A0A' }, headerTintColor: '#FFFFFF', headerTitle: 'Detalle entreno' }} />
        <Stack.Screen
          name="routines/create"
          options={{ presentation: 'modal', headerShown: true, headerStyle: { backgroundColor: '#141414' }, headerTintColor: '#FFFFFF', headerTitle: 'Nueva rutina' }}
        />
        <Stack.Screen name="routines/[id]" options={{ headerShown: true, headerStyle: { backgroundColor: '#0A0A0A' }, headerTintColor: '#FFFFFF', headerTitle: 'Rutina' }} />
      </Stack>
    </GestureHandlerRootView>
  );
}
