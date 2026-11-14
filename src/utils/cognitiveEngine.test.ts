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



