import { Platform } from 'react-native';

// react-native-health only works on iOS with a native build (not Expo Go).
// Use `expo run:ios` or EAS Build to test HealthKit integration.
let AppleHealthKit: any = null;

if (Platform.OS === 'ios') {
  try {
    AppleHealthKit = require('react-native-health').default;
  } catch {
    console.warn('react-native-health not available. Run with expo run:ios or EAS Build.');
  }
}

export const HealthKitPermissions = {
  permissions: {
    read: ['ActiveEnergyBurned', 'Workout', 'HeartRate', 'StepCount', 'DistanceWalkingRunning'],
    write: ['ActiveEnergyBurned', 'Workout'],
  },
};

export function isHealthKitAvailable(): boolean {
  return Platform.OS === 'ios' && AppleHealthKit !== null;
}

export async function requestHealthKitPermissions(): Promise<boolean> {
  if (!isHealthKitAvailable()) return false;

  return new Promise((resolve) => {
    AppleHealthKit.initHealthKit(HealthKitPermissions, (err: Error) => {
      if (err) {
        console.error('HealthKit permission error:', err);
        resolve(false);
      } else {
        resolve(true);
      }
    });
  });
}
