import { useState, useEffect, useRef, useCallback } from 'react';
import * as Haptics from 'expo-haptics';

export function useRestTimer(defaultSeconds: number = 90) {
  const [remaining, setRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const clear = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!isRunning) {
      clear();
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clear();
          setIsRunning(false);
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clear;
  }, [isRunning, clear]);

  const start = useCallback((seconds?: number) => {
    setRemaining(seconds ?? defaultSeconds);
    setIsRunning(true);
  }, [defaultSeconds]);

  const stop = useCallback(() => {
    setIsRunning(false);
    setRemaining(0);
  }, []);

  return { remaining, isRunning, start, stop };
}
