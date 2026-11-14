import { useCallback, useEffect, useRef, useState } from 'react';
import {
  dispatchFocusDesktopNotification,
  FOCUS_INTERVAL_PRESETS,
  getDesktopNotificationPermission,
  requestDesktopNotificationPermission,
  triggerSubtleHaptic,
  type DesktopNotificationPermission,
} from '../utils/cognitiveFeedback';

export interface ElapsedFocusNotice {
  minutes: number;
  notifiedViaDesktop: boolean;
  completedAt: number;
}

export function useFocusTimer(initialMinutes = 25) {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(initialMinutes);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(initialMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [permissionState, setPermissionState] = useState<DesktopNotificationPermission>(() =>
    getDesktopNotificationPermission()
  );
  const [elapsedNotice, setElapsedNotice] = useState<ElapsedFocusNotice | null>(null);

  const deadlineMsRef = useRef<number | null>(null);
  const selectedMinutesRef = useRef<number>(initialMinutes);
  const remainingSecondsRef = useRef<number>(initialMinutes * 60);

  useEffect(() => {
    selectedMinutesRef.current = selectedMinutes;
  }, [selectedMinutes]);

  useEffect(() => {
    remainingSecondsRef.current = remainingSeconds;
  }, [remainingSeconds]);

  const completeInterval = useCallback(() => {
    deadlineMsRef.current = null;
    setIsRunning(false);
    const finishedMinutes = selectedMinutesRef.current;
    setRemainingSeconds(finishedMinutes * 60);

    const notifiedViaDesktop = dispatchFocusDesktopNotification(finishedMinutes);
    setPermissionState(getDesktopNotificationPermission());
    triggerSubtleHaptic('orb');

    setElapsedNotice({
      minutes: finishedMinutes,
      notifiedViaDesktop,
      completedAt: Date.now(),
    });
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    if (deadlineMsRef.current === null) {
      deadlineMsRef.current = Date.now() + remainingSecondsRef.current * 1000;
    }

    const syncClock = () => {
      const deadline = deadlineMsRef.current;
      if (deadline === null) return;
      const msLeft = deadline - Date.now();
      if (msLeft <= 0) {
        completeInterval();
        return;
      }
      setRemainingSeconds(Math.ceil(msLeft / 1000));
    };

    syncClock();
    const intervalId = window.setInterval(syncClock, 500);
    return () => window.clearInterval(intervalId);
  }, [completeInterval, isRunning]);

  const selectPreset = useCallback((minutes: number) => {
    deadlineMsRef.current = null;
    setIsRunning(false);
    setSelectedMinutes(minutes);
    setRemainingSeconds(minutes * 60);
    setElapsedNotice(null);
  }, []);

  const startTimer = useCallback(async () => {
    setElapsedNotice(null);
    if (getDesktopNotificationPermission() === 'default') {
      const nextPermission = await requestDesktopNotificationPermission();
      setPermissionState(nextPermission);
    } else {
      setPermissionState(getDesktopNotificationPermission());
    }

    const secondsToRun = remainingSeconds > 0 ? remainingSeconds : selectedMinutes * 60;
    deadlineMsRef.current = Date.now() + secondsToRun * 1000;
    setRemainingSeconds(secondsToRun);
    setIsRunning(true);
  }, [remainingSeconds, selectedMinutes]);

  const pauseTimer = useCallback(() => {
    if (deadlineMsRef.current !== null) {
      const msLeft = Math.max(0, deadlineMsRef.current - Date.now());
      setRemainingSeconds(Math.ceil(msLeft / 1000));
    }
    deadlineMsRef.current = null;
    setIsRunning(false);
  }, []);

  const resetTimer = useCallback(() => {
    deadlineMsRef.current = null;
    setIsRunning(false);
    setRemainingSeconds(selectedMinutes * 60);
    setElapsedNotice(null);
  }, [selectedMinutes]);

  const requestPermission = useCallback(async () => {
    const next = await requestDesktopNotificationPermission();
    setPermissionState(next);
  }, []);

  const dismissElapsedNotice = useCallback(() => {
    setElapsedNotice(null);
  }, []);

  return {
    presets: FOCUS_INTERVAL_PRESETS,
    selectedMinutes,
    remainingSeconds,
    isRunning,
    permissionState,
    elapsedNotice,
    selectPreset,
    startTimer,
    pauseTimer,
    resetTimer,
    requestPermission,
    dismissElapsedNotice,
  };
}
