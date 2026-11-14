/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { animate, motion, MotionConfig, useMotionValue, useTransform } from 'motion/react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { dispatchCenterRipple, NeuralParticleField } from './components/NeuralParticleField';
import { FooterHud, HeaderHud } from './components/HudChrome';
import { CyberSlideCard } from './components/CyberSlideCard';
import { HeroSlide } from './components/slides/HeroSlide';
import { WelcomeModal } from './components/WelcomeModal';
import { useFirebaseAuth } from './contexts/FirebaseContext';
import { useGeminiLiveVoice } from './hooks/useGeminiLiveVoice';
import { resolveAudioRippleEvent, type VoiceOrbState } from './hooks/useVoiceOrbSimulation';
import {
  clampSlideIndex,
  PAGE_SECTIONS,
  readWelcomeDismissed,
  resolveSwipeNavigation,
  TOTAL_SLIDES,
  wrapSlideIndex,
  writeWelcomeDismissed,
} from './utils/cognitiveEngine';
import {
  getInitialSlideIndexFromPath,
  navigationBridge,
} from './utils/navigationBridge';

const INTERACTIVE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'OPTION']);

export default function App() {
  const initialSlide = getInitialSlideIndexFromPath();
  const [activeSlideIndex, setActiveSlideIndex] = useState(initialSlide);
  const [isWarping, setIsWarping] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(() => !readWelcomeDismissed());
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [containerWidth, setContainerWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );

  const { user } = useFirebaseAuth();
  const {
    isLiveActive,
    isConnecting,
    isMuted,
    liveOrbState,
    lastUserTranscript,
    lastAssistantTranscript,
    voiceError,
    stopVoiceSession,
    toggleVoiceSession,
    toggleMute,
    clearVoiceError,
  } = useGeminiLiveVoice();

  const viewportRef = useRef<HTMLElement>(null);
  const activeIndexRef = useRef(initialSlide);
  const welcomeOpenRef = useRef(isWelcomeOpen);
  const accountMenuOpenRef = useRef(accountMenuOpen);
  const userRef = useRef(user);
  const containerWidthRef = useRef(containerWidth);
  const trackX = useMotionValue(0);
  const animControlsRef = useRef<{ stop: () => void } | null>(null);

  const warpTimerRef = useRef<number | null>(null);
  const wheelCooldownRef = useRef(false);
  const prevLiveOrbStateRef = useRef<VoiceOrbState>(liveOrbState);

  useEffect(() => {
    const prevState = prevLiveOrbStateRef.current;
    prevLiveOrbStateRef.current = liveOrbState;
    const rippleKind = resolveAudioRippleEvent(prevState, liveOrbState);
    if (rippleKind) {
      dispatchCenterRipple(rippleKind);
    }
  }, [liveOrbState]);

  useEffect(() => {
    welcomeOpenRef.current = isWelcomeOpen;
  }, [isWelcomeOpen]);

  useEffect(() => {
    accountMenuOpenRef.current = accountMenuOpen;
  }, [accountMenuOpen]);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Normalized [0..1] progress across the 5 horizontal slides for parallax & progress bar
  const parallaxProgress = useTransform(
    trackX,
    [0, -Math.max(1, containerWidth * (TOTAL_SLIDES - 1))],
    [0, 1]
  );

  const triggerWarpEffects = useCallback(() => {
    setIsWarping(true);
    if (warpTimerRef.current) window.clearTimeout(warpTimerRef.current);
    warpTimerRef.current = window.setTimeout(() => {
      setIsWarping(false);
    }, 550);
  }, []);

  const animateTrackToSlide = useCallback((targetIndex: number, immediate = false) => {
    const width = containerWidthRef.current || window.innerWidth || 1440;
    const targetX = -targetIndex * width;

    if (animControlsRef.current) {
      animControlsRef.current.stop();
      animControlsRef.current = null;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (immediate || prefersReducedMotion) {
      trackX.set(targetX);
      return;
    }

    animControlsRef.current = animate(trackX, targetX, {
      type: 'spring',
      stiffness: 260,
      damping: 30,
      mass: 0.9,
    });
  }, [trackX]);

  const goToSlide = useCallback(
    (nextIndex: number, options?: { silent?: boolean; skipUrlSync?: boolean }) => {
      const clamped = clampSlideIndex(nextIndex, TOTAL_SLIDES);
      const changed = clamped !== activeIndexRef.current;
      activeIndexRef.current = clamped;
      setActiveSlideIndex(clamped);
      animateTrackToSlide(clamped);

      if (!options?.skipUrlSync) {
        navigationBridge.recordSlideChange(clamped, true);
      }

      if (changed && !options?.silent) {
        triggerWarpEffects();
      }
    },
    [animateTrackToSlide, triggerWarpEffects]
  );

  // Bind in-page NavigationBridge for mid-conversation voice navigation without reloading
  useEffect(() => {
    navigationBridge.bind({
      getActiveSlideIndex: () => activeIndexRef.current,
      goToSlide: (slideIndex) => goToSlide(slideIndex, { skipUrlSync: false }),
      getOpenPanels: () => {
        const panels: string[] = [];
        if (welcomeOpenRef.current) panels.push('welcome-guide');
        if (accountMenuOpenRef.current) panels.push('account-menu');
        return panels;
      },
      openPanelById: (panelId) => {
        if (panelId === 'welcome-guide') {
          welcomeOpenRef.current = true;
          setIsWelcomeOpen(true);
          return { ok: true };
        }
        if (panelId === 'account-menu') {
          if (!userRef.current) {
            return {
              ok: false,
              reason: 'panel_requires_signin',
              message:
                'The Google Account menu is only available after signing in via the Sign in with Google button in the top-right header.',
            };
          }
          accountMenuOpenRef.current = true;
          setAccountMenuOpen(true);
          return { ok: true };
        }
        return { ok: false };
      },
      closePanelById: (panelId) => {
        const closed: string[] = [];
        if ((panelId === 'welcome-guide' || panelId === 'all' || !panelId) && welcomeOpenRef.current) {
          welcomeOpenRef.current = false;
          writeWelcomeDismissed(true);
          setIsWelcomeOpen(false);
          closed.push('Interface Guide');
        }
        if ((panelId === 'account-menu' || panelId === 'all' || !panelId) && accountMenuOpenRef.current) {
          accountMenuOpenRef.current = false;
          setAccountMenuOpen(false);
          closed.push('Google Account Menu');
        }
        return { ok: true, closed };
      },
      scrollElementIntoView: (sectionId) => {
        const targetEl = document.getElementById(sectionId);
        if (!targetEl) return false;
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
        return true;
      },
    });

    const onPopState = () => {
      const targetIndex = getInitialSlideIndexFromPath();
      navigationBridge.syncFromPopState(targetIndex);
      goToSlide(targetIndex, { skipUrlSync: true });
    };

    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('popstate', onPopState);
      navigationBridge.unbind();
    };
  }, [goToSlide]);

  const handleNextSlide = useCallback(() => {
    const next = wrapSlideIndex(activeIndexRef.current + 1, TOTAL_SLIDES);
    goToSlide(next);
  }, [goToSlide]);

  const handlePrevSlide = useCallback(() => {
    const prev = wrapSlideIndex(activeIndexRef.current - 1, TOTAL_SLIDES);
    goToSlide(prev);
  }, [goToSlide]);

  // Keep track width synced cleanly on window / viewport resize
  useEffect(() => {
    const measure = () => {
      const nextW = viewportRef.current?.clientWidth || window.innerWidth || 1440;
      containerWidthRef.current = nextW;
      setContainerWidth(nextW);
      trackX.set(-activeIndexRef.current * nextW);
    };

    measure();
    window.addEventListener('resize', measure, { passive: true });
    return () => window.removeEventListener('resize', measure);
  }, [trackX]);

  // Keyboard ArrowLeft / ArrowRight navigation (paused while WelcomeModal is open)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isWelcomeOpen) return;
      const activeTag = document.activeElement?.tagName ?? '';
      if (INTERACTIVE_TAGS.has(activeTag)) return;
      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        handleNextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        handlePrevSlide();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleNextSlide, handlePrevSlide, isWelcomeOpen]);

  // Horizontal trackpad / wheel swipe support (paused while WelcomeModal is open)
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (isWelcomeOpen || wheelCooldownRef.current) return;
      const absX = Math.abs(e.deltaX);
      const absY = Math.abs(e.deltaY);

      if (absX > 28 && absX > absY * 1.1) {
        if (e.deltaX > 28) {
          goToSlide(activeIndexRef.current + 1);
        } else {
          goToSlide(activeIndexRef.current - 1);
        }
        wheelCooldownRef.current = true;
        window.setTimeout(() => {
          wheelCooldownRef.current = false;
        }, 550);
      }
    };

    el.addEventListener('wheel', onWheel, { passive: true });
    return () => el.removeEventListener('wheel', onWheel);
  }, [goToSlide, isWelcomeOpen]);

  // Tactile horizontal touch & mouse pointer drag-to-swipe across slides
  const gestureRef = useRef<{
    active: boolean;
    locked: 'horizontal' | 'vertical' | null;
    startX: number;
    startY: number;
    lastX: number;
    lastTime: number;
    velocityX: number;
    baseTrackX: number;
    pointerId: number;
  }>({
    active: false,
    locked: null,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastTime: 0,
    velocityX: 0,
    baseTrackX: 0,
    pointerId: -1,
  });

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    const target = e.target as HTMLElement | null;
    if (target && (INTERACTIVE_TAGS.has(target.tagName) || target.closest('button, a, input, textarea, select, label, [role="tab"], [role="button"]'))) {
      return;
    }
    if (e.pointerType === 'mouse' && e.button !== 0) return;

    const width = containerWidthRef.current || window.innerWidth || 1440;
    const now = performance.now();
    gestureRef.current = {
      active: true,
      locked: null,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastTime: now,
      velocityX: 0,
      baseTrackX: -activeIndexRef.current * width,
      pointerId: e.pointerId,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const g = gestureRef.current;
    if (!g.active || g.pointerId !== e.pointerId) return;

    const dx = e.clientX - g.startX;
    const dy = e.clientY - g.startY;

    if (!g.locked) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return;
      if (Math.abs(dx) > Math.abs(dy) * 1.15) {
        g.locked = 'horizontal';
        if (animControlsRef.current) {
          animControlsRef.current.stop();
          animControlsRef.current = null;
        }
      } else {
        g.locked = 'vertical';
        g.active = false;
        return;
      }
    }

    const now = performance.now();
    const dt = Math.max(8, now - g.lastTime);
    g.velocityX = ((e.clientX - g.lastX) / dt) * 1000;
    g.lastX = e.clientX;
    g.lastTime = now;

    // Apply elastic resistance past first or last slide
    const width = containerWidthRef.current || window.innerWidth || 1440;
    const minX = -(TOTAL_SLIDES - 1) * width;
    let nextX = g.baseTrackX + dx;
    if (nextX > 0) {
      nextX = nextX * 0.28;
    } else if (nextX < minX) {
      nextX = minX + (nextX - minX) * 0.28;
    }
    trackX.set(nextX);
  };

  const finishSwipe = (e: React.PointerEvent<HTMLElement>) => {
    const g = gestureRef.current;
    if (!g.active || g.pointerId !== e.pointerId) return;
    g.active = false;

    if (g.locked !== 'horizontal') return;

    const dx = e.clientX - g.startX;
    const targetSlide = resolveSwipeNavigation(dx, g.velocityX, activeIndexRef.current, TOTAL_SLIDES);
    goToSlide(targetSlide);
  };

  const handleDismissWelcome = useCallback(() => {
    writeWelcomeDismissed(true);
    setIsWelcomeOpen(false);
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      <div
        data-active-section={PAGE_SECTIONS[activeSlideIndex]?.id ?? 'hero'}
        data-active-slide={activeSlideIndex}
        className="h-dvh w-screen overflow-hidden font-sans antialiased text-slate-100 flex flex-col justify-between relative"
      >
        <NeuralParticleField isWarping={isWarping} parallaxProgress={parallaxProgress} />

        <HeaderHud
          activeSlideIndex={activeSlideIndex}
          onSelectSlide={(idx) => goToSlide(idx)}
          parallaxProgress={parallaxProgress}
          eegBoosted={false}
          onOpenWelcome={() => setIsWelcomeOpen(true)}
          accountMenuOpen={accountMenuOpen}
          onAccountMenuOpenChange={setAccountMenuOpen}
          isVoiceActive={isLiveActive}
          isVoiceConnecting={isConnecting}
          isVoiceMuted={isMuted}
          onToggleVoiceMute={toggleMute}
          onStopVoice={stopVoiceSession}
        />

        {/* Horizontal Carousel Viewport */}
        <main
          ref={viewportRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishSwipe}
          onPointerCancel={finishSwipe}
          style={{ touchAction: 'pan-y' }}
          className="relative z-20 flex-1 w-full overflow-hidden flex items-center cursor-grab active:cursor-grabbing"
        >
          {/* Left Floating Arrow */}
          <motion.button
            type="button"
            onClick={handlePrevSlide}
            whileHover={{ scale: 1.08, x: -2 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Previous Slide"
            className="hidden md:flex absolute left-4 lg:left-6 z-30 p-3 rounded-full bg-space-900/95 border border-gold-400/30 text-gold-400 hover:text-white hover:border-gold-400 hover:bg-gold-500/20 transition-colors shadow-lg shadow-black/50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          >
            <ChevronLeft className="w-6 h-6" aria-hidden="true" />
          </motion.button>

          {/* Right Floating Arrow */}
          <motion.button
            type="button"
            onClick={handleNextSlide}
            whileHover={{ scale: 1.08, x: 2 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Next Slide"
            className="hidden md:flex absolute right-4 lg:right-6 z-30 p-3 rounded-full bg-space-900/95 border border-gold-400/30 text-gold-400 hover:text-white hover:border-gold-400 hover:bg-gold-500/20 transition-colors shadow-lg shadow-black/50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          >
            <ChevronRight className="w-6 h-6" aria-hidden="true" />
          </motion.button>

          {/* Horizontal Slides Track driven by Framer Motion */}
          <motion.div
            data-testid="carousel-track"
            style={{ x: trackX }}
            className="flex w-full h-full will-change-transform"
          >
            <HeroSlide
              isActive={activeSlideIndex === 0}
              onSelectSlide={(idx) => goToSlide(idx)}
              parallaxProgress={parallaxProgress}
              isLiveVoiceActive={isLiveActive}
              isLiveVoiceConnecting={isConnecting}
              liveOrbState={liveOrbState}
              onToggleLiveVoice={toggleVoiceSession}
            />
            {PAGE_SECTIONS.slice(1).map((section, offsetIdx) => {
              const idx = offsetIdx + 1;
              return (
                <section
                  key={section.id}
                  id={section.id}
                  aria-label={`Slide ${idx + 1}: ${section.navLabel}`}
                  className="slide-section min-w-full w-full h-full flex items-center justify-center px-5 sm:px-14 md:px-20 relative"
                >
                  <CyberSlideCard
                    slideIndex={idx}
                    totalSlides={TOTAL_SLIDES}
                    sectionLabel={section.navLabel}
                  />
                </section>
              );
            })}
          </motion.div>
        </main>

        {/* Subtle Active Live Voice Caption or Error Alert (only mounted during live voice feedback) */}
        {(lastUserTranscript || lastAssistantTranscript) && isLiveActive && (
          <div
            data-testid="live-voice-captions"
            aria-live="polite"
            className="pointer-events-none fixed bottom-16 left-1/2 -translate-x-1/2 z-40 max-w-lg w-[calc(100vw-2rem)] px-4 py-2 rounded-2xl border border-chroma-cyan/30 bg-[#080814]/85 backdrop-blur-md text-center shadow-xl"
          >
            {lastAssistantTranscript ? (
              <p className="text-xs sm:text-sm text-slate-100 leading-snug line-clamp-2">
                {lastAssistantTranscript}
              </p>
            ) : (
              <p className="text-xs sm:text-sm text-chroma-cyan/90 leading-snug line-clamp-2">
                “{lastUserTranscript}”
              </p>
            )}
          </div>
        )}

        {voiceError && (
          <div
            role="alert"
            data-testid="live-voice-error"
            className="fixed top-20 right-4 sm:right-6 z-50 max-w-xs rounded-xl bg-space-950/95 border border-chroma-magenta/50 p-3 text-xs text-slate-200 shadow-2xl flex items-start justify-between gap-2.5"
          >
            <span className="leading-snug">{voiceError}</span>
            <button
              type="button"
              onClick={clearVoiceError}
              aria-label="Dismiss voice error"
              className="text-slate-400 hover:text-white shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        )}

        <FooterHud
          activeSlideIndex={activeSlideIndex}
          onSelectSlide={(idx) => goToSlide(idx)}
          onPrevSlide={handlePrevSlide}
          onNextSlide={handleNextSlide}
        />

        <WelcomeModal isOpen={isWelcomeOpen} onDismiss={handleDismissWelcome} />
      </div>
    </MotionConfig>
  );
}
