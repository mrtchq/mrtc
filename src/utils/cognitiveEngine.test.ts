import test from 'node:test';
import assert from 'node:assert/strict';
import {
  MODES_DATA,
  SYNAPSE_NODES,
  TOTAL_SLIDES,
  calculateParticlePoolBudget,
  formatSectorLabel,
  validateWaitlistForm,
  wrapSlideIndex,
} from './cognitiveEngine';

test('wrapSlideIndex wraps positively and negatively across 5 slides', () => {
  assert.equal(wrapSlideIndex(0, TOTAL_SLIDES), 0);
  assert.equal(wrapSlideIndex(4, TOTAL_SLIDES), 4);
  assert.equal(wrapSlideIndex(5, TOTAL_SLIDES), 0);
  assert.equal(wrapSlideIndex(-1, TOTAL_SLIDES), 4);
  assert.equal(wrapSlideIndex(-6, TOTAL_SLIDES), 4);
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

  assert.ok(mobile.nodeCount >= 24 && mobile.nodeCount <= 72);
  assert.ok(desktop.nodeCount >= mobile.nodeCount);
  assert.ok(desktop.maxSparks > mobile.maxSparks);
});

test('MODES_DATA and SYNAPSE_NODES contain complete specs', () => {
  assert.equal(MODES_DATA.length, 3);
  for (const mode of MODES_DATA) {
    assert.equal(mode.metrics.length, 3);
  }
  assert.equal(SYNAPSE_NODES.length, 8);
});
