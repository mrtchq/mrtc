import React, { useEffect, useRef, useState } from 'react';
import { motion, useSpring, useTransform, type MotionValue } from 'motion/react';
import { ChevronLeft, ChevronRight, HelpCircle, LogOut, Mic, MicOff, PhoneOff, X } from 'lucide-react';
import { PAGE_SECTIONS, TOTAL_SLIDES } from '../utils/cognitiveEngine';
import { dispatchParticleBurst } from './NeuralParticleField';
import { useFirebaseAuth } from '../contexts/FirebaseContext';

const SHOW_GOOGLE_SIGN_IN = false;

interface HeaderHudProps {
  activeSlideIndex: number;
  onSelectSlide: (index: number) => void;
  parallaxProgress: MotionValue<number>;
  onOpenWelcome: () => void;
  accountMenuOpen?: boolean;
  onAccountMenuOpenChange?: (open: boolean) => void;
  isVoiceActive?: boolean;
  isVoiceConnecting?: boolean;
  isVoiceMuted?: boolean;
  onToggleVoiceMute?: () => void;
  onStopVoice?: () => void;
}

function GoogleMarkIcon() {
  return (
    <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
      />
    </svg>
  );
}

export function HeaderHud({
  activeSlideIndex,
  onSelectSlide,
  parallaxProgress,
  onOpenWelcome,
  accountMenuOpen,
  onAccountMenuOpenChange,
  isVoiceActive = false,
  isVoiceConnecting = false,
  isVoiceMuted = false,
  onToggleVoiceMute,
  onStopVoice,
}: HeaderHudProps) {
  const mappedProgress = useTransform(parallaxProgress, [0, 1], [1 / TOTAL_SLIDES, 1]);
  const smoothProgress = useSpring(mappedProgress, { stiffness: 220, damping: 28, restDelta: 0.001 });

  const { user, authReady, authLoading, authError, signInWithGoogle, signOutUser, clearAuthError } =
    useFirebaseAuth();
  const [internalMenuOpen, setInternalMenuOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  const menuOpen = accountMenuOpen !== undefined ? accountMenuOpen : internalMenuOpen;
  const setMenuOpen = (next: boolean | ((prev: boolean) => boolean)) => {
    const resolved = typeof next === 'function' ? next(menuOpen) : next;
    if (onAccountMenuOpenChange) {
      onAccountMenuOpenChange(resolved);
    } else {
      setInternalMenuOpen(resolved);
    }
  };

  useEffect(() => {
    setAvatarFailed(false);
    if (!user) {
      if (onAccountMenuOpenChange) {
        onAccountMenuOpenChange(false);
      } else {
        setInternalMenuOpen(false);
      }
    }
  }, [user, onAccountMenuOpenChange]);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointerDown = (e: MouseEvent) => {
      if (menuContainerRef.current && !menuContainerRef.current.contains(e.target as Node)) {
        if (onAccountMenuOpenChange) {
          onAccountMenuOpenChange(false);
        } else {
          setInternalMenuOpen(false);
        }
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (onAccountMenuOpenChange) {
          onAccountMenuOpenChange(false);
        } else {
          setInternalMenuOpen(false);
        }
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen, onAccountMenuOpenChange]);

  const userInitial = (user?.displayName || user?.email || 'U').trim().charAt(0).toUpperCase();

  return (
    <header className="relative z-30 shrink-0 h-16 px-4 sm:px-6 flex items-center justify-between gap-4 sm:gap-8 border-b border-gold-400/20 bg-[#080811]/95 shadow-[0_4px_24px_rgba(0,0,0,0.65)]">
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

      {/* Top-Right Controls */}
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 relative" ref={menuContainerRef}>
        {/* Active Live Voice Session Controls (rendered only while live call is active) */}
        {(isVoiceActive || isVoiceConnecting) && (
          <div
            data-testid="live-voice-header-controls"
            className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-space-950/90 border border-chroma-cyan/40 shadow-[0_0_16px_rgba(0,229,255,0.2)]"
          >
            <button
              type="button"
              data-testid="voice-mute-btn"
              onClick={onToggleVoiceMute}
              disabled={isVoiceConnecting}
              aria-label={isVoiceMuted ? 'Unmute microphone' : 'Mute microphone'}
              title={isVoiceMuted ? 'Unmute microphone' : 'Mute microphone'}
              className="w-7 h-7 rounded-full flex items-center justify-center text-chroma-cyan hover:text-white hover:bg-white/10 transition-colors cursor-pointer disabled:opacity-50"
            >
              {isVoiceMuted ? (
                <MicOff className="w-3.5 h-3.5 text-amber-400" aria-hidden="true" />
              ) : (
                <Mic className="w-3.5 h-3.5" aria-hidden="true" />
              )}
            </button>
            <span className="hidden sm:inline font-rajdhani text-[11px] font-bold tracking-wider uppercase text-chroma-cyan whitespace-nowrap">
              {isVoiceConnecting ? 'Connecting' : isVoiceMuted ? 'Muted' : 'Live Voice'}
            </span>
            <button
              type="button"
              data-testid="voice-stop-btn"
              onClick={onStopVoice}
              aria-label="End live voice conversation"
              title="End Voice Call"
              className="w-7 h-7 rounded-full flex items-center justify-center text-rose-400 hover:text-white hover:bg-rose-500/25 transition-colors cursor-pointer"
            >
              <PhoneOff className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        )}

        {/* Interface Guide Trigger */}        {/* Interface Guide Trigger */}
        <button
          type="button"
          data-testid="open-welcome-btn"
          onClick={onOpenWelcome}
          aria-label="Open interface guide"
          title="Interface Guide"
          className="w-9 h-9 rounded-full flex items-center justify-center bg-space-950/90 hover:bg-space-850 border border-gold-400/30 hover:border-gold-400 text-slate-300 hover:text-gold-300 transition-colors shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
        >
          <HelpCircle className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Google Sign-In Button        {/* Google Sign-In Button or Signed-In Google Profile Picture */}
        {SHOW_GOOGLE_SIGN_IN &&
          (user ? (
            <div className="relative flex items-center">
              <button
                type="button"
                data-testid="user-profile-btn"
                onClick={() => setMenuOpen((prev) => !prev)}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                aria-label={`Account menu for ${user.displayName || user.email || 'signed-in user'}`}
                className="w-9 h-9 rounded-full p-[1.5px] bg-gradient-to-tr from-gold-400 via-chroma-cyan to-chroma-magenta shadow-[0_0_14px_rgba(0,229,255,0.35)] hover:scale-105 transition-transform cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              >
                {user.photoURL && !avatarFailed ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName ? `${user.displayName} profile picture` : 'Google account profile picture'}
                    referrerPolicy="no-referrer"
                    data-testid="user-avatar-img"
                    onError={() => setAvatarFailed(true)}
                    className="w-full h-full rounded-full object-cover bg-space-950"
                  />
                ) : (
                  <span
                    data-testid="user-avatar-fallback"
                    className="w-full h-full rounded-full bg-space-950 flex items-center justify-center font-orbitron text-xs font-bold text-gold-300"
                  >
                    {userInitial}
                  </span>
                )}
              </button>

              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 top-12 w-60 rounded-xl glass-hud border border-gold-400/30 p-3 shadow-2xl z-50"
                >
                  <div className="pb-2.5 mb-2.5 border-b border-slate-800">
                    <p className="text-sm font-semibold text-white truncate">
                      {user.displayName || 'Google Account'}
                    </p>
                    {user.email && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">{user.email}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    role="menuitem"
                    data-testid="signout-btn"
                    disabled={authLoading}
                    onClick={() => {
                      setMenuOpen(false);
                      void signOutUser();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-orbitron tracking-wider uppercase text-slate-200 bg-space-900/90 hover:bg-space-800 border border-slate-700 hover:border-gold-400/50 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <LogOut className="w-3.5 h-3.5 text-gold-400" aria-hidden="true" />
                    <span>Sign out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              data-testid="google-signin-btn"
              disabled={!authReady || authLoading}
              onClick={() => void signInWithGoogle()}
              className="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-space-950/90 hover:bg-space-850 border border-gold-400/35 hover:border-gold-400 text-xs font-rajdhani font-bold tracking-wider uppercase text-slate-100 shadow-md transition-colors whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-60 disabled:cursor-wait focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
            >
              <GoogleMarkIcon />
              <span className="hidden sm:inline">{authLoading ? 'Signing in...' : 'Sign in with Google'}</span>
              <span className="sm:hidden">{authLoading ? '...' : 'Sign in'}</span>
            </button>
          ))}

        {SHOW_GOOGLE_SIGN_IN && authError && (
          <div
            role="alert"
            className="absolute right-0 top-12 w-64 rounded-xl bg-space-950 border border-chroma-magenta/50 p-2.5 text-xs text-slate-200 shadow-xl flex items-start justify-between gap-2 z-50"
          >
            <span className="leading-snug">{authError}</span>
            <button
              type="button"
              onClick={clearAuthError}
              aria-label="Dismiss authentication error"
              className="text-slate-400 hover:text-white shrink-0 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>
        )}
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
    <footer className="relative z-30 shrink-0 px-3 sm:px-6 py-2.5 sm:py-3 border-t border-gold-400/20 bg-[#080811]/95 grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3">
      {/* Sector Coordinates & Status */}
      <div className="justify-self-start flex items-center space-x-3 font-rajdhani text-[11px] sm:text-xs tracking-widest text-slate-400 min-w-0">
        <span data-testid="sector-display" className="gold-gradient-text font-bold font-orbitron tabular-nums whitespace-nowrap">
          <span className="hidden sm:inline">SECTOR </span>
          {String(activeSlideIndex + 1).padStart(2, '0')} / {String(TOTAL_SLIDES).padStart(2, '0')}
        </span>
        <span className="hidden lg:inline text-slate-700">|</span>
        <span className="hidden lg:inline text-slate-300 whitespace-nowrap">DUAL-SYNAPSE OS v2.4</span>
      </div>

      {/* Bottom-Center Carousel Controls & Glowing Slide Dot Indicators */}
      <div className="justify-self-center flex items-center space-x-1 sm:space-x-3">
        <motion.button
          type="button"
          onClick={onPrevSlide}
          whileTap={{ scale: 0.9 }}
          aria-label="Previous Sector"
          className="p-1.5 rounded-lg bg-space-900/90 border border-slate-700/80 hover:border-gold-400 text-gold-300 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
        >
          <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        </motion.button>

        <div
          className="flex items-center space-x-0.5 sm:space-x-1.5"
          role="tablist"
          aria-label="Slide Indicators"
          data-testid="slide-dot-indicators"
        >
          {PAGE_SECTIONS.map((section, idx) => {
            const isActive = idx === activeSlideIndex;
            return (
              <button
                key={section.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={`Go to slide ${idx + 1}: ${section.navLabel}`}
                data-testid={`slide-dot-${idx + 1}`}
                data-active={isActive ? 'true' : 'false'}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  dispatchParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 12, '#00e5ff');
                  onSelectSlide(idx);
                }}
                className="group relative w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              >
                {isActive ? (
                  <>
                    <span
                      aria-hidden="true"
                      className="slide-dot-pulse-ring absolute w-3 h-3 rounded-full border border-chroma-cyan/80 bg-gold-400/25 shadow-[0_0_10px_rgba(0,229,255,0.65)] pointer-events-none"
                    />
                    <span
                      aria-hidden="true"
                      className="slide-dot-pulse-core relative w-2.5 h-2.5 rounded-full bg-gradient-to-br from-gold-300 via-chroma-cyan to-chroma-magenta shadow-[0_0_12px_rgba(0,229,255,0.9),0_0_20px_rgba(255,209,89,0.65)]"
                    />
                  </>
                ) : (
                  <span
                    aria-hidden="true"
                    className="w-2 h-2 rounded-full bg-gold-300/45 border border-gold-300/35 shadow-[0_0_8px_rgba(255,209,89,0.32)] transition-all duration-200 group-hover:scale-125 group-hover:bg-gold-300 group-hover:shadow-[0_0_12px_rgba(255,209,89,0.75)]"
                  />
                )}
              </button>
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
      <div className="justify-self-end hidden sm:flex font-rajdhani text-xs text-slate-400 tracking-wider items-center space-x-2 shrink-0">
        <span className="px-1.5 py-0.5 rounded bg-space-950 border border-slate-700 text-gold-300 text-[10px]">←</span>
        <span className="px-1.5 py-0.5 rounded bg-space-950 border border-slate-700 text-gold-300 text-[10px]">→</span>
        <span className="whitespace-nowrap">SWIPE OR KEYS TO NAVIGATE</span>
      </div>
    </footer>
  );
}
