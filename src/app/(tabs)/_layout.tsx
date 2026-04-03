import { Tabs, router } from 'expo-router';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '@/constants/theme';
import { useWorkoutStore } from '@/store/workoutStore';
import { useAuthStore } from '@/store/authStore';
import { Redirect } from 'expo-router';
import { formatDurationShort } from '@/utils/formatters';

function ActiveWorkoutBanner() {
  const { isActive, sessionName, elapsedSeconds } = useWorkoutStore();
  if (!isActive) return null;

  return (
    <TouchableOpacity
      style={styles.banner}
      onPress={() => router.push('/workout/active')}
      activeOpacity={0.85}
    >
      <View style={styles.bannerDot} />
      <Text style={styles.bannerName} numberOfLines={1}>{sessionName}</Text>
      <Text style={styles.bannerTimer}>{formatDurationShort(elapsedSeconds)}</Text>
      <Ionicons name="chevron-up" size={16} color={Colors.textOnPrimary} />
    </TouchableOpacity>
  );
}

export default function TabsLayout() {
  const { session, initialized } = useAuthStore();

  if (initialized && !session) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <View style={{ flex: 1 }}>
      <ActiveWorkoutBanner />
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: Colors.bgCard,
            borderTopColor: Colors.border,
            borderTopWidth: 1,
            paddingBottom: 4,
          },
          tabBarActiveTintColor: Colors.primary,
          tabBarInactiveTintColor: Colors.textMuted,
          tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Inicio',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="workouts"
          options={{
            title: 'Entrenos',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="barbell-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="routines"
          options={{
            title: 'Rutinas',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="list-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="progress"
          options={{
            title: 'Progreso',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="trending-up-outline" size={size} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Perfil',
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" size={size} color={color} />
            ),
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  bannerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.textOnPrimary,
    opacity: 0.8,
  },
  bannerName: {
    flex: 1,
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textOnPrimary,
  },
  bannerTimer: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textOnPrimary,
    fontVariant: ['tabular-nums'],
  },
});
