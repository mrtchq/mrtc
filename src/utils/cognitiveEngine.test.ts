import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MODES_DATA,
  PAGE_SECTIONS,
  SYNAPSE_NODES,
  TOTAL_SLIDES,
  calculateParticlePoolBudget,
  clampSlideIndex,
  formatSectorLabel,
  getSlideIndexById,
  readWelcomeDismissed,
  resolveSwipeNavigation,
  validateWaitlistForm,
  WELCOME_MODAL_STORAGE_KEY,
  wrapSlideIndex,
  writeWelcomeDismissed,
} from './cognitiveEngine';
import {
  getNextVoiceOrbState,
  resolveAudioRippleEvent,
  VOICE_ORB_STATE_ORDER,
} from '../hooks/useVoiceOrbSimulation';
import {
  dispatchFocusDesktopNotification,
  FOCUS_INTERVAL_PRESETS,
  formatFocusCountdown,
  requestDesktopNotificationPermission,
  triggerSubtleHaptic,
} from './cognitiveFeedback';

test('wrapSlideIndex wraps positively and negatively across 5 slides', () => {
  assert.equal(wrapSlideIndex(0, TOTAL_SLIDES), 0);
  assert.equal(wrapSlideIndex(4, TOTAL_SLIDES), 4);
  assert.equal(wrapSlideIndex(5, TOTAL_SLIDES), 0);
  assert.equal(wrapSlideIndex(-1, TOTAL_SLIDES), 4);
  assert.equal(wrapSlideIndex(-6, TOTAL_SLIDES), 4);
});

test('clampSlideIndex clamps within [0, total - 1]', () => {
  assert.equal(clampSlideIndex(-2, 5), 0);
  assert.equal(clampSlideIndex(2, 5), 2);
  assert.equal(clampSlideIndex(8, 5), 4);
});

test('getSlideIndexById resolves section ids safely', () => {
  assert.equal(getSlideIndexById('hero'), 0);
  assert.equal(getSlideIndexById('copilot-modes'), 2);
  assert.equal(getSlideIndexById('waitlist'), 4);
  assert.equal(getSlideIndexById('unknown'), 0);
});

test('resolveSwipeNavigation advances or rewinds based on drag distance and velocity', () => {
  assert.equal(resolveSwipeNavigation(-80, 0, 1, 5), 2);
  assert.equal(resolveSwipeNavigation(80, 0, 1, 5), 0);
  assert.equal(resolveSwipeNavigation(-15, -400, 2, 5), 3);
  assert.equal(resolveSwipeNavigation(15, 400, 2, 5), 1);
  assert.equal(resolveSwipeNavigation(-20, -100, 2, 5), 2);
  assert.equal(resolveSwipeNavigation(-120, -500, 4, 5), 4);
  assert.equal(resolveSwipeNavigation(120, 500, 0, 5), 0);
});

test('formatSectorLabel pads single digit sectors properly', () => {
  assert.equal(formatSectorLabel(0, 5), 'SECTOR 01 / 05');
  assert.equal(formatSectorLabel(2, 5), 'SECTOR 03 / 05');
  assert.equal(formatSectorLabel(4, 5), 'SECTOR 05 / 05');
});

test('validateWaitlistForm rejects empty/invalid inputs and accepts valid data', () => {
  const invalid = validateWaitlistForm({
    name: 'A',
    email: 'not-an-email',
    cognitiveStyle: '',
    focusFriction: 'hi',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.name);
  assert.ok(invalid.errors.email);
  assert.ok(invalid.errors.cognitiveStyle);
  assert.ok(invalid.errors.focusFriction);

  const valid = validateWaitlistForm({
    name: 'Alex Hunter',
    email: 'alex@neuroflow.io',
    cognitiveStyle: 'All-in-One Dual Hemisphere Synergy',
    focusFriction: 'Starting tasks without opening 30 browser tabs',
  });
  assert.equal(valid.valid, true);
  assert.deepEqual(valid.errors, {});
});

test('calculateParticlePoolBudget scales safely for mobile and desktop viewports', () => {
  const mobile = calculateParticlePoolBudget(390, 844);
  const desktop = calculateParticlePoolBudget(1440, 900);

  assert.ok(mobile.nodeCount >= 14 && mobile.nodeCount <= 30);
  assert.ok(desktop.nodeCount >= mobile.nodeCount);
  assert.ok(desktop.maxSparks > mobile.maxSparks);
  assert.ok(desktop.starCount > mobile.starCount);
});

test('MODES_DATA, SYNAPSE_NODES, and PAGE_SECTIONS contain complete specs', () => {
  assert.equal(MODES_DATA.length, 3);
  for (const mode of MODES_DATA) {
    assert.equal(mode.metrics.length, 3);
  }
  assert.equal(SYNAPSE_NODES.length, 8);
  assert.equal(PAGE_SECTIONS.length, 5);
});

test('getNextVoiceOrbState cycles cleanly through idle, listen, process, and speak', () => {
  assert.deepEqual(VOICE_ORB_STATE_ORDER, ['idle', 'listen', 'process', 'speak']);
  assert.equal(getNextVoiceOrbState('idle'), 'listen');
  assert.equal(getNextVoiceOrbState('listen'), 'process');
  assert.equal(getNextVoiceOrbState('process'), 'speak');
  assert.equal(getNextVoiceOrbState('speak'), 'idle');
});

test('readWelcomeDismissed and writeWelcomeDismissed persist first-load state safely', () => {
  const store = new Map<string, string>();
  const mockStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
  };

  assert.equal(readWelcomeDismissed(mockStorage), false);
  writeWelcomeDismissed(true, mockStorage);
  assert.equal(store.get(WELCOME_MODAL_STORAGE_KEY), 'true');
  assert.equal(readWelcomeDismissed(mockStorage), true);

  writeWelcomeDismissed(false, mockStorage);
  assert.equal(readWelcomeDismissed(mockStorage), false);

  const throwingStorage = {
    getItem: () => {
      throw new Error('blocked');
    },
    setItem: () => {
      throw new Error('blocked');
    },
  };
  assert.equal(readWelcomeDismissed(throwingStorage), false);
  assert.doesNotThrow(() => writeWelcomeDismissed(true, throwingStorage));
});

test('resolveAudioRippleEvent fires only when Voice AI starts speaking or finishes listening', () => {
  assert.equal(resolveAudioRippleEvent('idle', 'listen'), null);
  assert.equal(resolveAudioRippleEvent('listen', 'process'), 'listening_finished');
  assert.equal(resolveAudioRippleEvent('listen', 'idle'), 'listening_finished');
  assert.equal(resolveAudioRippleEvent('process', 'speak'), 'speaking');
  assert.equal(resolveAudioRippleEvent('listen', 'speak'), 'speaking');
  assert.equal(resolveAudioRippleEvent('idle', 'speak'), 'speaking');
  assert.equal(resolveAudioRippleEvent('speak', 'listen'), null);
  assert.equal(resolveAudioRippleEvent('speak', 'idle'), null);
  assert.equal(resolveAudioRippleEvent('speak', 'speak'), null);
});

test('triggerSubtleHaptic vibrates cleanly only on mobile/touch environments with navigator.vibrate', () => {
  const patterns: Array<number | number[]> = [];
  const mobileNav = {
    maxTouchPoints: 5,
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
    vibrate: (p: number | number[]) => {
      patterns.push(p);
      return true;
    },
  };
  const desktopNav = {
    maxTouchPoints: 0,
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64)',
    vibrate: (p: number | number[]) => {
      patterns.push(p);
      return true;
    },
  };

  assert.equal(triggerSubtleHaptic('slide', desktopNav, undefined), false);
  assert.equal(patterns.length, 0);

  assert.equal(triggerSubtleHaptic('slide', mobileNav, undefined), true);
  assert.equal(triggerSubtleHaptic('orb', mobileNav, undefined), true);
  assert.deepEqual(patterns, [10, 16]);
});

test('focus interval presets, countdown formatting, and Notification API dispatch cleanly', async () => {
  assert.ok(FOCUS_INTERVAL_PRESETS.length >= 4);
  assert.equal(formatFocusCountdown(1500), '25:00');
  assert.equal(formatFocusCountdown(65), '01:05');
  assert.equal(formatFocusCountdown(-3), '00:00');

  const spawned: Array<{ title: string; options?: NotificationOptions }> = [];
  class MockGrantedNotification {
    static permission: NotificationPermission = 'granted';
    static requestPermission = async (): Promise<NotificationPermission> => 'granted';
    constructor(title: string, options?: NotificationOptions) {
      spawned.push({ title, options });
    }
  }
  class MockDeniedNotification {
    static permission: NotificationPermission = 'denied';
    static requestPermission = async (): Promise<NotificationPermission> => 'denied';
    constructor(title: string, options?: NotificationOptions) {
      spawned.push({ title, options });
    }
  }

  assert.equal(dispatchFocusDesktopNotification(25, MockDeniedNotification), false);
  assert.equal(spawned.length, 0);

  assert.equal(dispatchFocusDesktopNotification(25, MockGrantedNotification), true);
  assert.equal(spawned.length, 1);
  assert.match(spawned[0].title, /Focus Interval/i);
  assert.match(String(spawned[0].options?.body), /25-minute/);

  const perm = await requestDesktopNotificationPermission(MockGrantedNotification);
  assert.equal(perm, 'granted');
});



