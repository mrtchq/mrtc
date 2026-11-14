import { useCallback, useEffect, useRef, useState } from 'react';

export type VoiceOrbState = 'idle' | 'listen' | 'process' | 'speak';

export const VOICE_ORB_STATE_ORDER: VoiceOrbState[] = ['idle', 'listen', 'process', 'speak'];

export const VOICE_ORB_TONE_HEX: Record<VoiceOrbState, string> = {
  idle: '#06b6d4',
  listen: '#10b981',
  process: '#8b5cf6',
  speak: '#f59e0b',
};

export function getNextVoiceOrbState(current: VoiceOrbState): VoiceOrbState {
  const idx = VOICE_ORB_STATE_ORDER.indexOf(current);
  return VOICE_ORB_STATE_ORDER[(idx + 1) % VOICE_ORB_STATE_ORDER.length];
}

export function useVoiceOrbSimulation(initialState: VoiceOrbState = 'idle') {
  const [orbState, setOrbState] = useState<VoiceOrbState>(initialState);
  const timersRef = useRef<number[]>([]);
  const sequenceActiveRef = useRef(false);

  const clearScheduledTimers = useCallback(() => {
    for (const timerId of timersRef.current) {
      window.clearTimeout(timerId);
    }
    timersRef.current = [];
    sequenceActiveRef.current = false;
  }, []);

  useEffect(() => {
    return () => clearScheduledTimers();
  }, [clearScheduledTimers]);

  const cycleOrbState = useCallback(() => {
    clearScheduledTimers();
    setOrbState((prev) => getNextVoiceOrbState(prev));
  }, [clearScheduledTimers]);

  const onHeroButtonEnter = useCallback(() => {
    if (sequenceActiveRef.current) return;
    setOrbState('listen');
  }, []);

  const onHeroButtonLeave = useCallback(() => {
    if (sequenceActiveRef.current) return;
    setOrbState('idle');
  }, []);

  const onHeroButtonDown = useCallback(() => {
    if (sequenceActiveRef.current) return;
    setOrbState('process');
  }, []);

  const triggerHeroButtonAction = useCallback(
    (onComplete: () => void) => {
      clearScheduledTimers();
      sequenceActiveRef.current = true;
      setOrbState('process');

      const speakTimer = window.setTimeout(() => {
        setOrbState('speak');
      }, 170);

      const completeTimer = window.setTimeout(() => {
        sequenceActiveRef.current = false;
        setOrbState('idle');
        onComplete();
      }, 420);

      timersRef.current.push(speakTimer, completeTimer);
    },
    [clearScheduledTimers]
  );

  return {
    orbState,
    setOrbState,
    cycleOrbState,
    onHeroButtonEnter,
    onHeroButtonLeave,
    onHeroButtonDown,
    triggerHeroButtonAction,
  };
}
