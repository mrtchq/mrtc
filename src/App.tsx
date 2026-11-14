/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { animate, motion, MotionConfig, useMotionValue, useTransform } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NeuralParticleField } from './components/NeuralParticleField';
import { FooterHud, HeaderHud } from './components/HudChrome';
import { HeroSlide } from './components/slides/HeroSlide';
import { DualHemisphereSlide } from './components/slides/DualHemisphereSlide';
import { CoPilotModesSlide } from './components/slides/CoPilotModesSlide';
import { BioMetricMatrixSlide } from './components/slides/BioMetricMatrixSlide';
import { WaitlistSlide } from './components/slides/WaitlistSlide';
import {
  clampSlideIndex,
  PAGE_SECTIONS,
  resolveSwipeNavigation,
  TOTAL_SLIDES,
  wrapSlideIndex,
} from './utils/cognitiveEngine';
import { synthAudio } from './utils/synthAudio';

const INTERACTIVE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'OPTION']);

export default function App() {
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isWarping, setIsWarping] = useState(false);
  const [eegBoosted, setEegBoosted] = useState(false);
  const [isJolting, setIsJolting] = useState(false);
  const [containerWidth, setContainerWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1440
  );

  const viewportRef = useRef<HTMLElement>(null);
  const activeIndexRef = useRef(0);
  const containerWidthRef = useRef(containerWidth);
  const trackX = useMotionValue(0);
  const animControlsRef = useRef<{ stop: () => void } | null>(null);

  const warpTimerRef = useRef<number | null>(null);
  const eegTimerRef = useRef<number | null>(null);
  const joltTimerRef = useRef<number | null>(null);
  const wheelCooldownRef = useRef(false);

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
    (nextIndex: number, options?: { silent?: boolean }) => {
      const clamped = clampSlideIndex(nextIndex, TOTAL_SLIDES);
      const changed = clamped !== activeIndexRef.current;
      activeIndexRef.current = clamped;
      setActiveSlideIndex(clamped);
      animateTrackToSlide(clamped);

      if (changed && !options?.silent) {
        synthAudio.playWarpWhoosh();
        triggerWarpEffects();
      }
    },
    [animateTrackToSlide, triggerWarpEffects]
  );

  const handleNextSlide = useCallback(() => {
    const next = wrapSlideIndex(activeIndexRef.current + 1, TOTAL_SLIDES);
    goToSlide(next);
  }, [goToSlide]);

  const handlePrevSlide = useCallback(() => {
    const prev = wrapSlideIndex(activeIndexRef.current - 1, TOTAL_SLIDES);
    goToSlide(prev);
  }, [goToSlide]);

  const handleToggleAudio = useCallback(() => {
    setAudioEnabled((prev) => {
      const next = !prev;
      synthAudio.enabled = next;
      if (next) {
        synthAudio.playBeep(620, 'sine', 0.1, 0.05);
      }
      return next;
    });
  }, []);

  const handleSimulateProtocol = useCallback(() => {
    setIsJolting(true);
    if (joltTimerRef.current) window.clearTimeout(joltTimerRef.current);
    joltTimerRef.current = window.setTimeout(() => {
      setIsJolting(false);
    }, 360);

    setEegBoosted(true);
    if (eegTimerRef.current) window.clearTimeout(eegTimerRef.current);
    eegTimerRef.current = window.setTimeout(() => {
      setEegBoosted(false);
    }, 2200);
  }, []);

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

  // Keyboard ArrowLeft / ArrowRight navigation
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
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
  }, [handleNextSlide, handlePrevSlide]);

  // Horizontal trackpad / wheel swipe support
  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (wheelCooldownRef.current) return;
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
  }, [goToSlide]);

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
    if (target && (INTERACTIVE_TAGS.has(target.tagName) || target.closest('button, a, input, textarea, select, [role="tab"]'))) {
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
          audioEnabled={audioEnabled}
          onToggleAudio={handleToggleAudio}
          eegBoosted={eegBoosted}
        />

        {/* Horizontal Carousel Viewport */}
        <motion.main
          ref={viewportRef}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={finishSwipe}
          onPointerCancel={finishSwipe}
          animate={
            isJolting
              ? {
                  x: [0, -4, 4, -3, 2, 0],
                  y: [0, 3, -2, -2, 1, 0],
                }
              : { x: 0, y: 0 }
          }
          transition={{ duration: 0.34, ease: 'easeInOut' }}
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
            className="hidden md:flex absolute left-4 lg:left-6 z-30 p-3 rounded-full bg-space-900/85 border border-gold-400/30 text-gold-400 hover:text-white hover:border-gold-400 hover:bg-gold-500/20 backdrop-blur-md transition-colors shadow-lg shadow-black/50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
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
            className="hidden md:flex absolute right-4 lg:right-6 z-30 p-3 rounded-full bg-space-900/85 border border-gold-400/30 text-gold-400 hover:text-white hover:border-gold-400 hover:bg-gold-500/20 backdrop-blur-md transition-colors shadow-lg shadow-black/50 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
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
            />
            <DualHemisphereSlide isActive={activeSlideIndex === 1} />
            <CoPilotModesSlide
              isActive={activeSlideIndex === 2}
              onSimulateProtocol={handleSimulateProtocol}
            />
            <BioMetricMatrixSlide isActive={activeSlideIndex === 3} />
            <WaitlistSlide isActive={activeSlideIndex === 4} />
          </motion.div>
        </motion.main>

        <FooterHud
          activeSlideIndex={activeSlideIndex}
          onSelectSlide={(idx) => goToSlide(idx)}
          onPrevSlide={handlePrevSlide}
          onNextSlide={handleNextSlide}
        />
      </div>
    </MotionConfig>
  );
}
