/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { NeuralParticleField } from './components/NeuralParticleField';
import { FooterHud, HeaderHud } from './components/HudChrome';
import { HeroSlide } from './components/slides/HeroSlide';
import { DualHemisphereSlide } from './components/slides/DualHemisphereSlide';
import { CoPilotModesSlide } from './components/slides/CoPilotModesSlide';
import { BioMetricMatrixSlide } from './components/slides/BioMetricMatrixSlide';
import { WaitlistSlide } from './components/slides/WaitlistSlide';
import { TOTAL_SLIDES, wrapSlideIndex } from './utils/cognitiveEngine';
import { synthAudio } from './utils/synthAudio';

const slideVariants = {
  enter: (direction: number) => ({
    x: direction >= 0 ? '24%' : '-24%',
    opacity: 0,
    scale: 0.97,
  }),
  center: {
    x: '0%',
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.38,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
  exit: (direction: number) => ({
    x: direction >= 0 ? '-24%' : '24%',
    opacity: 0,
    scale: 0.97,
    transition: {
      duration: 0.28,
      ease: [0.4, 0, 1, 1] as const,
    },
  }),
};

export default function App() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [direction, setDirection] = useState(1);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isWarping, setIsWarping] = useState(false);
  const [eegBoosted, setEegBoosted] = useState(false);
  const [isJolting, setIsJolting] = useState(false);

  const touchStartXRef = useRef(0);
  const wheelCooldownRef = useRef(false);
  const warpTimerRef = useRef<number | null>(null);
  const eegTimerRef = useRef<number | null>(null);
  const joltTimerRef = useRef<number | null>(null);

  const triggerWarpEffects = useCallback(() => {
    setIsWarping(true);
    if (warpTimerRef.current) window.clearTimeout(warpTimerRef.current);
    warpTimerRef.current = window.setTimeout(() => {
      setIsWarping(false);
    }, 600);
  }, []);

  const navigateToSlide = useCallback(
    (nextIndex: number, dirHint?: number) => {
      const wrapped = wrapSlideIndex(nextIndex, TOTAL_SLIDES);
      setCurrentSlide((prev) => {
        if (wrapped === prev) return prev;
        const computedDir = dirHint ?? (wrapped > prev ? 1 : -1);
        setDirection(computedDir);
        synthAudio.playWarpWhoosh();
        triggerWarpEffects();
        return wrapped;
      });
    },
    [triggerWarpEffects]
  );

  const nextSlide = useCallback(() => {
    navigateToSlide(currentSlide + 1, 1);
  }, [currentSlide, navigateToSlide]);

  const prevSlide = useCallback(() => {
    navigateToSlide(currentSlide - 1, -1);
  }, [currentSlide, navigateToSlide]);

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

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName ?? '';
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(activeTag)) return;

      if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        nextSlide();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        prevSlide();
      }
    };

    const onWheel = (e: WheelEvent) => {
      if (wheelCooldownRef.current) return;
      if (Math.abs(e.deltaX) > 30 || Math.abs(e.deltaY) > 65) {
        if (e.deltaX > 30 || e.deltaY > 65) {
          nextSlide();
        } else if (e.deltaX < -30 || e.deltaY < -65) {
          prevSlide();
        }
        wheelCooldownRef.current = true;
        window.setTimeout(() => {
          wheelCooldownRef.current = false;
        }, 620);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('wheel', onWheel, { passive: true });
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('wheel', onWheel);
    };
  }, [nextSlide, prevSlide]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const delta = e.changedTouches[0].screenX - touchStartXRef.current;
    if (delta < -45) nextSlide();
    else if (delta > 45) prevSlide();
  };

  const renderSlide = () => {
    switch (currentSlide) {
      case 0:
        return <HeroSlide onJumpToSlide={(idx) => navigateToSlide(idx)} />;
      case 1:
        return <DualHemisphereSlide />;
      case 2:
        return <CoPilotModesSlide onSimulateProtocol={handleSimulateProtocol} />;
      case 3:
        return <BioMetricMatrixSlide />;
      case 4:
        return <WaitlistSlide />;
      default:
        return <HeroSlide onJumpToSlide={(idx) => navigateToSlide(idx)} />;
    }
  };

  return (
    <MotionConfig reducedMotion="user">
      <motion.div
        animate={
          isJolting
            ? {
                x: [0, -4, 4, -3, 2, 0],
                y: [0, 3, -2, -2, 1, 0],
              }
            : { x: 0, y: 0 }
        }
        transition={{ duration: 0.34, ease: 'easeInOut' }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        data-active-slide={currentSlide}
        className="h-full w-full font-sans antialiased text-slate-100 flex flex-col justify-between relative overflow-hidden"
      >
        <NeuralParticleField isWarping={isWarping} />

        <HeaderHud
          onLogoClick={() => navigateToSlide(0)}
          audioEnabled={audioEnabled}
          onToggleAudio={handleToggleAudio}
          eegBoosted={eegBoosted}
        />

        {/* Main Carousel Viewport */}
        <main className="relative z-20 flex-1 w-full overflow-hidden flex items-center justify-center">
          <motion.button
            type="button"
            onClick={prevSlide}
            whileHover={{ scale: 1.08, x: -2 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Previous Slide"
            className="absolute left-2 sm:left-3 md:left-6 z-30 p-2.5 sm:p-3 rounded-full bg-space-900/85 border border-gold-400/30 text-gold-400 hover:text-white hover:border-gold-400 hover:bg-gold-500/20 backdrop-blur-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 shadow-lg shadow-black/50 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
          </motion.button>

          <motion.button
            type="button"
            onClick={nextSlide}
            whileHover={{ scale: 1.08, x: 2 }}
            whileTap={{ scale: 0.92 }}
            aria-label="Next Slide"
            className="absolute right-2 sm:right-3 md:right-6 z-30 p-2.5 sm:p-3 rounded-full bg-space-900/85 border border-gold-400/30 text-gold-400 hover:text-white hover:border-gold-400 hover:bg-gold-500/20 backdrop-blur-md transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 shadow-lg shadow-black/50 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" aria-hidden="true" />
          </motion.button>

          <div className="w-full h-full relative overflow-hidden">
            <AnimatePresence mode="popLayout" initial={false} custom={direction}>
              <motion.div
                key={currentSlide}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="absolute inset-0 w-full h-full will-change-transform"
              >
                {renderSlide()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>

        <FooterHud currentSlide={currentSlide} onJumpToSlide={(idx) => navigateToSlide(idx)} />
      </motion.div>
    </MotionConfig>
  );
}
