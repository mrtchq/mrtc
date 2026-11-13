import React from 'react';
import { motion } from 'motion/react';
import { Volume2, VolumeX } from 'lucide-react';
import { formatSectorLabel, TOTAL_SLIDES } from '../utils/cognitiveEngine';

interface HeaderHudProps {
  onLogoClick: () => void;
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

export function HeaderHud({ onLogoClick, audioEnabled, onToggleAudio, eegBoosted }: HeaderHudProps) {
  return (
    <header className="relative z-30 px-4 sm:px-6 py-3.5 flex items-center justify-between border-b border-gold-400/20 glass-hud">
      {/* Brand / Split Logo */}
      <motion.button
        type="button"
        onClick={onLogoClick}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        aria-label="Return to MRTC BUILDS Home"
        className="flex items-center space-x-3 cursor-pointer group focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-xl p-1 -m-1"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-gold-500 via-purple-600 to-chroma-magenta p-[1.5px] flex items-center justify-center shadow-lg shadow-gold-500/20">
          <div className="w-full h-full bg-space-950 rounded-[9px] flex items-center justify-center relative overflow-hidden">
            <svg className="w-6 h-6" viewBox="0 0 40 40" fill="none" aria-hidden="true">
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
      </motion.button>

      {/* EEG Spectrum & Audio Toggle */}
      <div className="flex items-center space-x-3 md:space-x-4">
        <div
          className={`hidden lg:flex items-center space-x-2 bg-space-950/90 px-3.5 py-1.5 rounded-full border transition-colors ${
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
          className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-space-850/90 border border-slate-700 hover:border-gold-400 transition-colors text-xs font-rajdhani tracking-wider text-slate-300 hover:text-white whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
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
    </header>
  );
}

interface FooterHudProps {
  currentSlide: number;
  onJumpToSlide: (index: number) => void;
}

const SLIDE_NAMES = [
  'Hero Overview',
  'Dual-Hemisphere System',
  'Interactive Co-Pilot Modes',
  'Neural Bio-Metric Matrix',
  'Request Early Access',
];

export function FooterHud({ currentSlide, onJumpToSlide }: FooterHudProps) {
  return (
    <footer className="relative z-30 px-4 sm:px-6 py-2.5 sm:py-3.5 border-t border-gold-400/20 glass-hud flex flex-row items-center justify-between gap-2.5">
      <div className="flex items-center space-x-3 font-rajdhani text-xs tracking-widest text-slate-400">
        <span data-testid="sector-display" className="gold-gradient-text font-bold font-orbitron tabular-nums whitespace-nowrap">
          {formatSectorLabel(currentSlide, TOTAL_SLIDES)}
        </span>
        <span className="hidden md:inline text-slate-700">|</span>
        <span className="hidden md:inline text-slate-300 whitespace-nowrap">DUAL-SYNAPSE OS v2.4</span>
      </div>

      <nav aria-label="Sector Pagination" className="flex items-center space-x-1.5 sm:space-x-2">
        {Array.from({ length: TOTAL_SLIDES }).map((_, idx) => {
          const isActive = idx === currentSlide;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => onJumpToSlide(idx)}
              aria-label={`Go to slide ${idx + 1}: ${SLIDE_NAMES[idx]}`}
              aria-current={isActive ? 'step' : undefined}
              className="relative h-5 px-1 flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-full cursor-pointer"
            >
              <motion.span
                layout
                transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                className={`block h-2 rounded-full transition-colors ${
                  isActive ? 'w-7 sm:w-8 bg-gold-400 shadow-[0_0_12px_rgba(255,209,89,0.7)]' : 'w-2 bg-slate-700 hover:bg-slate-500'
                }`}
              />
            </button>
          );
        })}
      </nav>

      <div className="hidden sm:flex font-rajdhani text-xs text-slate-400 tracking-wider items-center space-x-2 whitespace-nowrap">
        <span className="px-1.5 py-0.5 rounded bg-space-950 border border-slate-700 text-gold-300 text-[10px]">←</span>
        <span className="px-1.5 py-0.5 rounded bg-space-950 border border-slate-700 text-gold-300 text-[10px]">→</span>
        <span>KEYS OR SWIPE TO NAVIGATE</span>
      </div>
    </footer>
  );
}
