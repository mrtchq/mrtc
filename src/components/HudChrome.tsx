import React from 'react';
import { motion, useSpring, useTransform, type MotionValue } from 'motion/react';
import { ChevronLeft, ChevronRight, Volume2, VolumeX } from 'lucide-react';
import { formatSectorLabel, PAGE_SECTIONS, TOTAL_SLIDES } from '../utils/cognitiveEngine';

interface HeaderHudProps {
  activeSlideIndex: number;
  onSelectSlide: (index: number) => void;
  parallaxProgress: MotionValue<number>;
  audioEnabled: boolean;
  onToggleAudio: () => void;
  eegBoosted: boolean;
}

const EEG_BARS = [
  { colorClass: 'bg-gold-400', keyframes: [0.3, 0.85, 0.45, 0.95, 0.3], duration: 1.1 },
  { colorClass: 'bg-chroma-cyan', keyframes: [0.5, 0.95, 0.35, 0.8, 0.5], duration: 0.9 },
  { colorClass: 'bg-chroma-purple', keyframes: [0.7, 0.4, 1.0, 0.55, 0.7], duration: 1.25 },
  { colorClass: 'bg-chroma-magenta', keyframes: [0.6, 0.9, 0.4, 0.85, 0.6], duration: 1.0 },
  { colorClass: 'bg-chroma-lime', keyframes: [0.8, 0.35, 0.9, 0.5, 0.8], duration: 0.85 },
  { colorClass: 'bg-gold-400', keyframes: [0.4, 0.8, 0.6, 0.92, 0.4], duration: 1.15 },
];

export function HeaderHud({
  activeSlideIndex,
  onSelectSlide,
  parallaxProgress,
  audioEnabled,
  onToggleAudio,
  eegBoosted,
}: HeaderHudProps) {
  const mappedProgress = useTransform(parallaxProgress, [0, 1], [1 / TOTAL_SLIDES, 1]);
  const smoothProgress = useSpring(mappedProgress, { stiffness: 220, damping: 28, restDelta: 0.001 });

  return (
    <header className="relative z-30 shrink-0 h-16 px-4 sm:px-6 flex items-center justify-between gap-4 sm:gap-8 border-b border-gold-400/20 bg-[#080811]/90 backdrop-blur-md shadow-[0_4px_30px_rgba(0,0,0,0.65)]">
      {/* Brand / Split Logo */}
      <button
        type="button"
        onClick={() => onSelectSlide(0)}
        aria-label="Return to MRTC BUILDS Overview"
        className="flex items-center space-x-3 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-xl p-1 -m-1 shrink-0"
      >
        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-gold-500 via-purple-600 to-chroma-magenta p-[1.5px] flex items-center justify-center shadow-lg shadow-gold-500/20 group-hover:scale-105 transition-transform">
          <div className="w-full h-full bg-space-950 rounded-[9px] flex items-center justify-center relative overflow-hidden">
            <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 40 40" fill="none" aria-hidden="true">
              <motion.path
                d="M19 6C13 6 8 11 8 18C8 22 10 25 12 28C14 31 16 34 19 35"
                stroke="#f5b82e"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0.4 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: 'easeOut' }}
              />
              <path
                d="M15 14H18 M13 20H17 M15 26H18"
                stroke="#ffd159"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <motion.circle
                cx="13"
                cy="20"
                r="1.5"
                fill="#00e5ff"
                animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.3, 0.9] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <circle cx="15" cy="14" r="1.5" fill="#ffd159" />
              <motion.path
                d="M21 6C27 6 32 11 32 18C32 22 30 25 28 28C26 31 24 34 21 35"
                stroke="url(#miniRainbowHeader)"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0.4 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.2, ease: 'easeOut', delay: 0.15 }}
              />
              <path
                d="M22 13C25 13 27 16 25 18C23 20 22 23 25 25"
                stroke="#ec4899"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="miniRainbowHeader" x1="21" y1="6" x2="32" y2="35" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#00e5ff" />
                  <stop offset="0.3" stopColor="#9333ea" />
                  <stop offset="0.6" stopColor="#ec4899" />
                  <stop offset="0.85" stopColor="#f97316" />
                  <stop offset="1" stopColor="#10b981" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        <div className="flex items-center space-x-1.5 font-orbitron whitespace-nowrap shrink-0">
          <span className="gold-gradient-text font-black text-lg sm:text-xl tracking-wider">MR</span>
          <div className="flex flex-col items-center justify-center px-1">
            <div className="w-full h-[1px] bg-gold-400/80" />
            <span className="text-[9px] font-sans font-bold tracking-[0.25em] text-white px-1 leading-tight">TC</span>
            <div className="w-full h-[1px] bg-gold-400/80" />
          </div>
          <span className="rainbow-gradient-text font-black text-lg sm:text-xl tracking-wider">BUILDS</span>
        </div>
      </button>

      {/* Horizontal Sector Navigation Links */}
      <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-6">
        {PAGE_SECTIONS.map((section, idx) => {
          const isActive = idx === activeSlideIndex;
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onSelectSlide(idx)}
              aria-current={isActive ? 'step' : undefined}
              className={`relative py-1.5 font-rajdhani text-sm tracking-widest uppercase whitespace-nowrap shrink-0 cursor-pointer transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded ${
                isActive ? 'text-gold-300 font-bold' : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>{section.navLabel}</span>
              {isActive && (
                <motion.span
                  layoutId="activeNavIndicator"
                  transition={{ type: 'spring', stiffness: 420, damping: 30 }}
                  className="absolute left-0 right-0 -bottom-0.5 h-[2px] rounded-full bg-gradient-to-r from-gold-400 via-chroma-cyan to-chroma-magenta"
                />
              )}
            </button>
          );
        })}
      </nav>

      {/* EEG Spectrum & Audio Toggle */}
      <div className="flex items-center space-x-3 shrink-0">
        <div
          className={`hidden xl:flex items-center space-x-2 bg-space-950/90 px-3.5 py-1.5 rounded-full border transition-colors ${
            eegBoosted ? 'border-gold-400 shadow-[0_0_16px_rgba(255,209,89,0.35)]' : 'border-purple-500/30'
          }`}
        >
          <span className="text-[10px] font-rajdhani text-slate-400 tracking-wider">EEG</span>
          <div className="flex items-end space-x-1 h-4" aria-hidden="true">
            {EEG_BARS.map((bar, idx) => (
              <motion.span
                key={idx}
                className={`w-1 h-full rounded-sm origin-bottom ${bar.colorClass}`}
                animate={{
                  scaleY: eegBoosted ? [0.6, 1.0, 0.7, 1.0] : bar.keyframes,
                }}
                transition={{
                  duration: eegBoosted ? bar.duration * 0.45 : bar.duration,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />
            ))}
          </div>
          <span
            data-testid="eeg-label"
            className={`text-[10px] font-rajdhani font-bold whitespace-nowrap tabular-nums transition-colors ${
              eegBoosted ? 'text-gold-300' : 'text-chroma-cyan'
            }`}
          >
            {eegBoosted ? '120Hz SUPER-GAMMA' : '40Hz GAMMA'}
          </span>
        </div>

        <motion.button
          type="button"
          onClick={onToggleAudio}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.94 }}
          aria-pressed={audioEnabled}
          aria-label={audioEnabled ? 'Mute Synth Sound Effects' : 'Enable Synth Sound Effects'}
          className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-space-850/90 border border-slate-700 hover:border-gold-400 transition-colors text-xs font-rajdhani tracking-wider text-slate-300 hover:text-white whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
          title="Toggle Synth Sound Effects"
        >
          {audioEnabled ? (
            <Volume2 className="w-4 h-4 text-gold-400" aria-hidden="true" />
          ) : (
            <VolumeX className="w-4 h-4 text-slate-500" aria-hidden="true" />
          )}
          <span className="hidden sm:inline">{audioEnabled ? 'SFX: ON' : 'SFX: OFF'}</span>
        </motion.button>
      </div>

      {/* Horizontal Carousel Progress Hairline */}
      <motion.div
        aria-hidden="true"
        data-testid="carousel-progress-bar"
        className="absolute bottom-0 left-0 right-0 h-[2px] origin-left bg-gradient-to-r from-gold-400 via-chroma-cyan to-chroma-magenta"
        style={{ scaleX: smoothProgress }}
      />
    </header>
  );
}

interface FooterHudProps {
  activeSlideIndex: number;
  onSelectSlide: (index: number) => void;
  onPrevSlide: () => void;
  onNextSlide: () => void;
}

export function FooterHud({ activeSlideIndex, onSelectSlide, onPrevSlide, onNextSlide }: FooterHudProps) {
  return (
    <footer className="relative z-30 shrink-0 px-4 sm:px-6 py-3 sm:py-3.5 border-t border-gold-400/20 bg-[#080811]/90 backdrop-blur-md flex items-center justify-between gap-3">
      {/* Sector Coordinates & Status */}
      <div className="flex items-center space-x-3 font-rajdhani text-xs tracking-widest text-slate-400 shrink-0">
        <span data-testid="sector-display" className="gold-gradient-text font-bold font-orbitron tabular-nums whitespace-nowrap">
          {formatSectorLabel(activeSlideIndex, TOTAL_SLIDES)}
        </span>
        <span className="hidden lg:inline text-slate-700">|</span>
        <span className="hidden lg:inline text-slate-300 whitespace-nowrap">DUAL-SYNAPSE OS v2.4</span>
      </div>

      {/* Carousel Controls & Pagination Pills */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <motion.button
          type="button"
          onClick={onPrevSlide}
          whileTap={{ scale: 0.9 }}
          aria-label="Previous Sector"
          className="p-1.5 rounded-lg bg-space-900/90 border border-slate-700/80 hover:border-gold-400 text-gold-300 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </motion.button>

        <div className="flex items-center space-x-2" role="tablist" aria-label="Sector Slides">
          {PAGE_SECTIONS.map((section, idx) => {
            const isActive = idx === activeSlideIndex;
            return (
              <button
                key={section.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to slide ${idx + 1}: ${section.navLabel}`}
                onClick={() => onSelectSlide(idx)}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                  isActive
                    ? 'w-8 bg-gradient-to-r from-gold-400 via-chroma-cyan to-chroma-magenta shadow-[0_0_10px_rgba(255,209,89,0.5)]'
                    : 'w-2.5 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            );
          })}
        </div>

        <motion.button
          type="button"
          onClick={onNextSlide}
          whileTap={{ scale: 0.9 }}
          aria-label="Next Sector"
          className="p-1.5 rounded-lg bg-space-900/90 border border-slate-700/80 hover:border-gold-400 text-gold-300 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
        >
          <ChevronRight className="w-4 h-4" aria-hidden="true" />
        </motion.button>
      </div>

      {/* Keyboard & Swipe Shortcut Hint */}
      <div className="hidden sm:flex font-rajdhani text-xs text-slate-400 tracking-wider items-center space-x-2 shrink-0">
        <span className="px-1.5 py-0.5 rounded bg-space-950 border border-slate-700 text-gold-300 text-[10px]">←</span>
        <span className="px-1.5 py-0.5 rounded bg-space-950 border border-slate-700 text-gold-300 text-[10px]">→</span>
        <span className="whitespace-nowrap">SWIPE OR KEYS TO NAVIGATE</span>
      </div>
    </footer>
  );
}
