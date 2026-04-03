import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SettingsState {
  unitSystem: 'metric' | 'imperial';
  healthkitEnabled: boolean;
  restTimerDefault: number;
  setUnitSystem: (unit: 'metric' | 'imperial') => void;
  setHealthkitEnabled: (enabled: boolean) => void;
  setRestTimerDefault: (seconds: number) => void;
  load: () => Promise<void>;
}

const STORAGE_KEY = 'fittrack_settings';

export const useSettingsStore = create<SettingsState>((set, get) => ({
  unitSystem: 'metric',
  healthkitEnabled: false,
  restTimerDefault: 90,

  setUnitSystem: (unitSystem) => {
    set({ unitSystem });
    get()._persist();
  },

  setHealthkitEnabled: (healthkitEnabled) => {
    set({ healthkitEnabled });
    get()._persist();
  },

  setRestTimerDefault: (restTimerDefault) => {
    set({ restTimerDefault });
    get()._persist();
  },

  load: async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        set(JSON.parse(raw));
      } catch {
        // ignore
      }
    }
  },

  _persist: () => {
    const { unitSystem, healthkitEnabled, restTimerDefault } = get();
    AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ unitSystem, healthkitEnabled, restTimerDefault })
    ).catch(console.error);
  },
} as SettingsState & { _persist: () => void }));
