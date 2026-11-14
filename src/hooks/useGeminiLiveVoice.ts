import { useCallback, useEffect, useRef, useState } from 'react';
import type { VoiceOrbState } from './useVoiceOrbSimulation';
import { navigationBridge } from '../utils/navigationBridge';

export interface LiveToolCallPayload {
  id: string;
  name: string;
  args?: Record<string, unknown>;
}

interface LiveServerEvent {
  type: 'session_ready' | 'audio' | 'input_transcript' | 'output_transcript' | 'interrupted' | 'turn_complete' | 'tool_call' | 'error' | 'session_closed';
  data?: string;
  text?: string;
  code?: string;
  message?: string;
  functionCalls?: LiveToolCallPayload[];
}

export function resampleLinear(
  input: Float32Array,
  sourceSampleRate: number,
  targetSampleRate: number
): Float32Array {
  if (sourceSampleRate === targetSampleRate || sourceSampleRate <= 0 || targetSampleRate <= 0) {
    return input;
  }
  const ratio = sourceSampleRate / targetSampleRate;
  const outputLength = Math.max(1, Math.round(input.length / ratio));
  const output = new Float32Array(outputLength);
  for (let i = 0; i < outputLength; i++) {
    const srcIdx = i * ratio;
    const low = Math.floor(srcIdx);
    const high = Math.min(input.length - 1, low + 1);
    const frac = srcIdx - low;
    output[i] = input[low] * (1 - frac) + input[high] * frac;
  }
  return output;
}

export function resampleFloat32To16k(input: Float32Array, sourceSampleRate: number): Float32Array {
  return resampleLinear(input, sourceSampleRate, 16000);
}

function createSafeAudioContext(preferredSampleRate: number): AudioContext {
  const AudioCtx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  try {
    return new AudioCtx({ sampleRate: preferredSampleRate });
  } catch {
    return new AudioCtx();
  }
}

export function float32ToPcm16Base64(samples: Float32Array): string {
  const buffer = new ArrayBuffer(samples.length * 2);
  const view = new DataView(buffer);
  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(i * 2, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
  }
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

export function pcm24Base64ToFloat32(base64: string): Float32Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const sampleCount = Math.floor(bytes.length / 2);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const floatSamples = new Float32Array(sampleCount);
  for (let i = 0; i < sampleCount; i++) {
    floatSamples[i] = view.getInt16(i * 2, true) / 32768;
  }
  return floatSamples;
}

export function useGeminiLiveVoice() {
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [liveOrbState, setLiveOrbState] = useState<VoiceOrbState>('idle');
  const [lastUserTranscript, setLastUserTranscript] = useState('');
  const [lastAssistantTranscript, setLastAssistantTranscript] = useState('');
  const [voiceError, setVoiceError] = useState<string | null>(null);

  const wsRef = useRef<WebSocket | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const inputAudioCtxRef = useRef<AudioContext | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const outputAudioCtxRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const isLiveActiveRef = useRef(false);
  const isSessionReadyRef = useRef(false);
  const isMutedRef = useRef(false);
  const intentionalCloseRef = useRef(false);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimerRef = useRef<number | null>(null);
  const unrecoverableErrorRef = useRef(false);
  const hasEmittedErrorRef = useRef(false);

  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const stopPlaybackQueue = useCallback(() => {
    for (const src of activeSourcesRef.current) {
      try {
        src.stop();
        src.disconnect();
      } catch {
        // Ignore already stopped source
      }
    }
    activeSourcesRef.current.clear();
    if (outputAudioCtxRef.current) {
      nextStartTimeRef.current = outputAudioCtxRef.current.currentTime;
    } else {
      nextStartTimeRef.current = 0;
    }
  }, []);

  const teardownAudioNodes = useCallback(() => {
    stopPlaybackQueue();

    if (processorRef.current) {
      try {
        processorRef.current.disconnect();
        processorRef.current.onaudioprocess = null;
      } catch {
        // Ignore disconnect error
      }
      processorRef.current = null;
    }

    if (sourceNodeRef.current) {
      try {
        sourceNodeRef.current.disconnect();
      } catch {
        // Ignore disconnect error
      }
      sourceNodeRef.current = null;
    }

    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }

    if (inputAudioCtxRef.current) {
      void inputAudioCtxRef.current.close().catch(() => undefined);
      inputAudioCtxRef.current = null;
    }

    if (outputAudioCtxRef.current) {
      void outputAudioCtxRef.current.close().catch(() => undefined);
      outputAudioCtxRef.current = null;
    }
  }, [stopPlaybackQueue]);

  const stopVoiceSession = useCallback(() => {
    intentionalCloseRef.current = true;
    isLiveActiveRef.current = false;
    isSessionReadyRef.current = false;
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    if (wsRef.current) {
      try {
        wsRef.current.close(1000, 'User ended voice session');
      } catch {
        // Ignore close errors
      }
      wsRef.current = null;
    }

    teardownAudioNodes();
    setIsConnecting(false);
    setIsLiveActive(false);
    setIsMuted(false);
    setLiveOrbState('idle');
  }, [teardownAudioNodes]);

  const scheduleAudioChunk = useCallback((base64Data: string) => {
    const ctx = outputAudioCtxRef.current;
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => undefined);
    }

    const rawFloatSamples = pcm24Base64ToFloat32(base64Data);
    if (rawFloatSamples.length === 0) return;

    const floatSamples =
      ctx.sampleRate !== 24000
        ? resampleLinear(rawFloatSamples, 24000, ctx.sampleRate)
        : rawFloatSamples;

    const buffer = ctx.createBuffer(1, floatSamples.length, ctx.sampleRate);
    buffer.getChannelData(0).set(floatSamples);

    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);

    const startTime = Math.max(nextStartTimeRef.current, ctx.currentTime + 0.015);
    nextStartTimeRef.current = startTime + buffer.duration;

    activeSourcesRef.current.add(source);
    setLiveOrbState('speak');

    source.onended = () => {
      activeSourcesRef.current.delete(source);
      if (activeSourcesRef.current.size === 0 && isLiveActiveRef.current) {
        setLiveOrbState('listen');
      }
    };

    source.start(startTime);
  }, []);

  const openWebSocketBridge = useCallback(() => {
    if (typeof window === 'undefined') return;
    hasEmittedErrorRef.current = false;
    isSessionReadyRef.current = false;

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/live`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data as string) as LiveServerEvent;

        if (msg.type === 'session_ready') {
          reconnectAttemptsRef.current = 0;
          isSessionReadyRef.current = true;
          isLiveActiveRef.current = true;
          setIsConnecting(false);
          setIsLiveActive(true);
          setLiveOrbState('listen');
          return;
        }

        if (msg.type === 'audio' && msg.data) {
          scheduleAudioChunk(msg.data);
          return;
        }

        if (msg.type === 'input_transcript' && msg.text) {
          setLastUserTranscript((prev) => `${prev} ${msg.text}`.trim().slice(-220));
          return;
        }

        if (msg.type === 'output_transcript' && msg.text) {
          setLastAssistantTranscript((prev) => `${prev} ${msg.text}`.trim().slice(-260));
          return;
        }

        if (msg.type === 'interrupted') {
          stopPlaybackQueue();
          if (isLiveActiveRef.current) setLiveOrbState('listen');
          return;
        }

        if (msg.type === 'turn_complete') {
          setLastUserTranscript('');
          if (activeSourcesRef.current.size === 0 && isLiveActiveRef.current) {
            setLiveOrbState('listen');
          }
          return;
        }

        if (msg.type === 'tool_call' && Array.isArray(msg.functionCalls)) {
          setLiveOrbState('process');
          const functionResponses = msg.functionCalls.map((call) => {
            const result = navigationBridge.executeToolCall(call.name, call.args ?? {});
            return {
              id: call.id,
              name: call.name,
              response: result as unknown as Record<string, unknown>,
            };
          });

          if (ws.readyState === WebSocket.OPEN) {
            ws.send(
              JSON.stringify({
                type: 'tool_response',
                functionResponses,
              })
            );
          }
          return;
        }

        if (msg.type === 'error') {
          hasEmittedErrorRef.current = true;
          if (
            msg.code === 'MISSING_API_KEY' ||
            msg.code === 'CONNECT_FAILED' ||
            (msg.code === 'LIVE_SESSION_ERROR' && !isSessionReadyRef.current)
          ) {
            unrecoverableErrorRef.current = true;
          }
          setVoiceError(msg.message || 'Voice connection encountered an error.');
          if (unrecoverableErrorRef.current) {
            stopVoiceSession();
          }
        }
      } catch {
        // Ignore malformed server payload
      }
    };

    ws.onclose = () => {
      if (wsRef.current === ws) {
        wsRef.current = null;
      }
      isSessionReadyRef.current = false;

      if (intentionalCloseRef.current || unrecoverableErrorRef.current || !isLiveActiveRef.current) {
        return;
      }

      // Auto-reconnect if the live socket dropped unexpectedly mid-conversation
      if (reconnectAttemptsRef.current < 3) {
        reconnectAttemptsRef.current += 1;
        setLiveOrbState('process');
        reconnectTimerRef.current = window.setTimeout(() => {
          if (isLiveActiveRef.current && !intentionalCloseRef.current) {
            openWebSocketBridge();
          }
        }, 700 * reconnectAttemptsRef.current);
      } else {
        if (!hasEmittedErrorRef.current) {
          setVoiceError('Live voice connection closed. Click the orb to reconnect.');
        }
        stopVoiceSession();
      }
    };

    ws.onerror = () => {
      if (!intentionalCloseRef.current && !hasEmittedErrorRef.current) {
        hasEmittedErrorRef.current = true;
        setVoiceError('Unable to reach the live voice service.');
      }
    };
  }, [scheduleAudioChunk, stopPlaybackQueue, stopVoiceSession]);

  const startVoiceSession = useCallback(async () => {
    if (isLiveActiveRef.current || isConnecting) return;

    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
      setVoiceError('Microphone input is not supported in this browser.');
      return;
    }

    intentionalCloseRef.current = false;
    unrecoverableErrorRef.current = false;
    hasEmittedErrorRef.current = false;
    isSessionReadyRef.current = false;
    reconnectAttemptsRef.current = 0;
    setVoiceError(null);
    setLastUserTranscript('');
    setLastAssistantTranscript('');
    setIsConnecting(true);
    setLiveOrbState('process');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const inputCtx = createSafeAudioContext(16000);
      const outputCtx = createSafeAudioContext(24000);
      if (inputCtx.state === 'suspended') {
        void inputCtx.resume().catch(() => undefined);
      }
      if (outputCtx.state === 'suspended') {
        void outputCtx.resume().catch(() => undefined);
      }

      inputAudioCtxRef.current = inputCtx;
      outputAudioCtxRef.current = outputCtx;
      nextStartTimeRef.current = outputCtx.currentTime;

      const source = inputCtx.createMediaStreamSource(stream);
      const processor = inputCtx.createScriptProcessor(4096, 1, 1);
      // Route through a zero-gain sink so onaudioprocess fires without local mic echo
      const silentGain = inputCtx.createGain();
      silentGain.gain.value = 0;

      source.connect(processor);
      processor.connect(silentGain);
      silentGain.connect(inputCtx.destination);
      sourceNodeRef.current = source;
      processorRef.current = processor;

      processor.onaudioprocess = (audioEvent) => {
        const activeWs = wsRef.current;
        if (
          !activeWs ||
          activeWs.readyState !== WebSocket.OPEN ||
          !isSessionReadyRef.current ||
          isMutedRef.current
        ) {
          return;
        }
        const rawSamples = audioEvent.inputBuffer.getChannelData(0);
        const resampled = resampleFloat32To16k(rawSamples, inputCtx.sampleRate);
        const base64Audio = float32ToPcm16Base64(resampled);
        activeWs.send(JSON.stringify({ type: 'audio', data: base64Audio }));
      };

      isLiveActiveRef.current = true;
      openWebSocketBridge();
    } catch (err) {
      const msg =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'Microphone permission was denied. Allow mic access to talk with the orb.'
          : err instanceof Error
            ? err.message
            : 'Could not start microphone capture.';
      setVoiceError(msg);
      teardownAudioNodes();
      setIsConnecting(false);
      setIsLiveActive(false);
      isLiveActiveRef.current = false;
      isSessionReadyRef.current = false;
      setLiveOrbState('idle');
    }
  }, [isConnecting, openWebSocketBridge, teardownAudioNodes]);

  const toggleVoiceSession = useCallback(() => {
    if (isLiveActiveRef.current || isConnecting) {
      stopVoiceSession();
    } else {
      void startVoiceSession();
    }
  }, [isConnecting, startVoiceSession, stopVoiceSession]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  const clearVoiceError = useCallback(() => {
    setVoiceError(null);
  }, []);

  useEffect(() => {
    return () => {
      stopVoiceSession();
    };
  }, [stopVoiceSession]);

  return {
    isLiveActive,
    isConnecting,
    isMuted,
    liveOrbState,
    lastUserTranscript,
    lastAssistantTranscript,
    voiceError,
    startVoiceSession,
    stopVoiceSession,
    toggleVoiceSession,
    toggleMute,
    clearVoiceError,
  };
}
