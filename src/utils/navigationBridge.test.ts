import test from 'node:test';
import assert from 'node:assert/strict';
import {
  NavigationBridge,
  getInitialSlideIndexFromPath,
  parseSameSiteTarget,
  resolveRouteFromTarget,
} from './navigationBridge';
import {
  float32ToPcm16Base64,
  pcm24Base64ToFloat32,
  resampleFloat32To16k,
} from '../hooks/useGeminiLiveVoice';

function createBoundTestBridge() {
  let activeSlide = 0;
  const openPanels = new Set<string>();
  const scrolledSections: string[] = [];
  let signedIn = false;

  const bridge = new NavigationBridge();
  bridge.bind({
    getActiveSlideIndex: () => activeSlide,
    goToSlide: (idx) => {
      activeSlide = idx;
      bridge.recordSlideChange(idx, false);
    },
    getOpenPanels: () => Array.from(openPanels),
    openPanelById: (id) => {
      if (id === 'account-menu' && !signedIn) {
        return {
          ok: false,
          reason: 'panel_requires_signin',
          message: 'Sign in first to open the Google Account menu.',
        };
      }
      openPanels.add(id);
      return { ok: true };
    },
    closePanelById: (id) => {
      if (id === 'all' || !id) {
        const closed = Array.from(openPanels);
        openPanels.clear();
        return { ok: true, closed };
      }
      const had = openPanels.delete(id);
      return { ok: true, closed: had ? [id] : [] };
    },
    scrollElementIntoView: (sectionId) => {
      scrolledSections.push(sectionId);
      return true;
    },
  });

  return {
    bridge,
    getActiveSlide: () => activeSlide,
    getScrolledSections: () => scrolledSections,
    setSignedIn: (val: boolean) => {
      signedIn = val;
    },
  };
}

test('parseSameSiteTarget blocks external, protocol-relative, and javascript URLs', () => {
  assert.equal(parseSameSiteTarget('https://evil.example.com/shop', 'https://mrtc.app').blockedExternal, true);
  assert.equal(parseSameSiteTarget('//evil.example.com', 'https://mrtc.app').blockedExternal, true);
  assert.equal(parseSameSiteTarget('javascript:alert(1)').blockedExternal, true);

  const sameOrigin = parseSameSiteTarget('https://mrtc.app/modes', 'https://mrtc.app');
  assert.equal(sameOrigin.ok, true);
  assert.equal(sameOrigin.blockedExternal, false);
  assert.equal(sameOrigin.pathname, '/modes');

  const localRoute = parseSameSiteTarget('/access');
  assert.equal(localRoute.ok, true);
  assert.equal(localRoute.pathname, '/access');
});

test('NavigationBridge executes navigate_to, scroll_to_section, go_back, and get_current_location', () => {
  const { bridge, getActiveSlide, getScrolledSections } = createBoundTestBridge();

  const initialLoc = bridge.executeToolCall('get_current_location');
  assert.equal(initialLoc.ok, true);
  assert.equal(initialLoc.currentLocation.route, '/');
  assert.equal(initialLoc.currentLocation.slideNumber, '01');
  assert.equal(initialLoc.currentLocation.canGoBack, false);

  const toModes = bridge.executeToolCall('navigate_to', { target: 'Modes' });
  assert.equal(toModes.ok, true);
  assert.equal(toModes.found, true);
  assert.equal(getActiveSlide(), 2);
  assert.equal(toModes.currentLocation.route, '/modes');
  assert.equal(toModes.currentLocation.canGoBack, true);

  const scrollMatrix = bridge.executeToolCall('scroll_to_section', { section_id: 'biometric-matrix' });
  assert.equal(scrollMatrix.ok, true);
  assert.equal(getActiveSlide(), 3);
  assert.deepEqual(getScrolledSections(), ['biometric-matrix']);

  const backOne = bridge.executeToolCall('go_back');
  assert.equal(backOne.ok, true);
  assert.equal(getActiveSlide(), 2);
  assert.equal(backOne.currentLocation.route, '/modes');

  const backTwo = bridge.executeToolCall('go_back');
  assert.equal(backTwo.ok, true);
  assert.equal(getActiveSlide(), 0);
  assert.equal(backTwo.currentLocation.canGoBack, false);

  const backEmpty = bridge.executeToolCall('go_back');
  assert.equal(backEmpty.ok, false);
  assert.equal(backEmpty.reason, 'no_history');
});

test('NavigationBridge refuses nonexistent pages with closest-match offer and zero navigation', () => {
  const { bridge, getActiveSlide } = createBoundTestBridge();

  const shopResult = bridge.executeToolCall('navigate_to', { target: 'the shop' });
  assert.equal(shopResult.ok, false);
  assert.equal(shopResult.found, false);
  assert.equal(shopResult.reason, 'not_found');
  assert.equal(getActiveSlide(), 0);
  assert.ok(shopResult.closestMatch);
  assert.equal(shopResult.closestMatch.target, '/access');

  const guideResult = bridge.executeToolCall('navigate_to', { target: 'budgeting guide' });
  assert.equal(guideResult.ok, false);
  assert.equal(guideResult.found, false);
  assert.equal(getActiveSlide(), 0);
  assert.equal(guideResult.closestMatch?.kind, 'panel');
  assert.equal(guideResult.closestMatch?.target, 'welcome-guide');

  const pricingResult = bridge.executeToolCall('scroll_to_section', { section_id: 'pricing' });
  assert.equal(pricingResult.ok, false);
  assert.equal(pricingResult.found, false);
  assert.equal(getActiveSlide(), 0);
  assert.ok(pricingResult.closestMatch);
});

test('NavigationBridge open_panel and close_panel control welcome-guide and account-menu cleanly', () => {
  const { bridge, setSignedIn } = createBoundTestBridge();

  const openGuide = bridge.executeToolCall('open_panel', { panel_name: 'welcome guide' });
  assert.equal(openGuide.ok, true);
  assert.deepEqual(openGuide.currentLocation.openPanels, ['welcome-guide']);

  const closeGuide = bridge.executeToolCall('close_panel', { panel_name: 'welcome-guide' });
  assert.equal(closeGuide.ok, true);
  assert.deepEqual(closeGuide.currentLocation.openPanels, []);

  const blockedAccount = bridge.executeToolCall('open_panel', { panel_name: 'account menu' });
  assert.equal(blockedAccount.ok, false);
  assert.equal(blockedAccount.reason, 'panel_requires_signin');

  setSignedIn(true);
  const allowedAccount = bridge.executeToolCall('open_panel', { panel_name: 'account menu' });
  assert.equal(allowedAccount.ok, true);
  assert.deepEqual(allowedAccount.currentLocation.openPanels, ['account-menu']);
});

test('resolveRouteFromTarget and getInitialSlideIndexFromPath resolve canonical routes and hashes', () => {
  assert.equal(resolveRouteFromTarget('/system')?.slideIndex, 1);
  assert.equal(resolveRouteFromTarget('#waitlist')?.slideIndex, 4);
  assert.equal(getInitialSlideIndexFromPath('/modes', ''), 2);
  assert.equal(getInitialSlideIndexFromPath('/', '#biometric-matrix'), 3);
  assert.equal(getInitialSlideIndexFromPath('/nonexistent', ''), 0);
});

test('Audio PCM resampling and base64 conversion round-trip cleanly without NaN', () => {
  const input48k = new Float32Array(480);
  for (let i = 0; i < input48k.length; i++) {
    input48k[i] = Math.sin((2 * Math.PI * 440 * i) / 48000) * 0.5;
  }
  const resampled16k = resampleFloat32To16k(input48k, 48000);
  assert.equal(resampled16k.length, 160);

  const encoded = float32ToPcm16Base64(resampled16k);
  assert.ok(encoded.length > 0);

  const decoded = pcm24Base64ToFloat32(encoded);
  assert.equal(decoded.length, 160);
  for (let i = 0; i < decoded.length; i++) {
    assert.ok(Number.isFinite(decoded[i]));
    assert.ok(Math.abs(decoded[i] - resampled16k[i]) < 0.001);
  }
});
