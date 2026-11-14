import React, { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Compass, Mic, ShieldCheck, X } from 'lucide-react';

interface WelcomeModalProps {
  isOpen: boolean;
  onDismiss: () => void;
}

const INTERFACE_GUIDE_ITEMS = [
  {
    index: '01',
    title: 'Interactive Voice Orb',
    description:
      'Move your cursor over the central orb for subtle 3D tracking, click it to cycle through Ready, Listening, Thinking, and Speaking states, or hover and press the hero actions below it to drive live responses.',
    icon: Mic,
    accentClass: 'text-chroma-cyan border-chroma-cyan/30 bg-chroma-cyan/10',
  },
  {
    index: '02',
    title: 'Horizontal Five-Sector Navigation',
    description:
      'Swipe horizontally, use the side arrows, press the left and right keyboard keys, or select any glowing dot indicator in the bottom bar to move between the five workspace slides.',
    icon: Compass,
    accentClass: 'text-gold-300 border-gold-400/35 bg-gold-400/10',
  },
  {
    index: '03',
    title: 'Hands-Free Voice Navigation',
    description:
      'Tap the central orb to speak with the Voice Co-Pilot and jump to any sector by voice, or reopen this interface guide anytime via the help button in the top bar.',
    icon: ShieldCheck,
    accentClass: 'text-chroma-magenta border-chroma-magenta/30 bg-chroma-magenta/10',
  },
] as const;

export function WelcomeModal({ isOpen, onDismiss }: WelcomeModalProps) {
  const primaryBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const timer = window.setTimeout(() => {
      primaryBtnRef.current?.focus();
    }, 60);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onDismiss();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isOpen, onDismiss]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="welcome-modal-backdrop"
          data-testid="welcome-modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.22, ease: 'easeOut' }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              onDismiss();
            }
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-[#030308]/65 backdrop-blur-md"
        >
          <motion.section
            role="dialog"
            aria-modal="true"
            aria-labelledby="welcome-modal-title"
            aria-describedby="welcome-modal-description"
            data-testid="welcome-modal"
            initial={{ opacity: 0, scale: 0.96, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="relative w-full max-w-xl max-h-[calc(100dvh-2rem)] overflow-y-auto no-scrollbar rounded-3xl border border-white/15 bg-[linear-gradient(155deg,rgba(24,24,48,0.68)_0%,rgba(10,10,22,0.58)_100%)] backdrop-blur-2xl shadow-[0_28px_80px_rgba(0,0,0,0.78),inset_0_1px_0_rgba(255,255,255,0.18)] text-slate-100 p-6 sm:p-8"
          >
            {/* Subtle top glass specular rim */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold-300/60 to-transparent"
            />
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-40 rounded-full bg-chroma-cyan/12 blur-3xl"
            />

            {/* Header Row */}
            <div className="relative flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-rajdhani text-xs font-semibold tracking-[0.22em] uppercase text-gold-300">
                  MRTC Builds · Interface Guide
                </p>
                <h2
                  id="welcome-modal-title"
                  className="mt-1.5 font-orbitron text-xl sm:text-2xl font-bold tracking-wide text-white text-balance"
                >
                  Welcome to the Cognitive Co-Pilot
                </h2>
              </div>

              <button
                type="button"
                data-testid="welcome-modal-close"
                onClick={onDismiss}
                aria-label="Close welcome guide"
                className="shrink-0 w-10 h-10 rounded-full flex items-center justify-center border border-white/15 bg-white/5 hover:bg-white/12 hover:border-gold-400/50 text-slate-300 hover:text-white transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            <p
              id="welcome-modal-description"
              className="relative mt-3 text-sm sm:text-[15px] leading-relaxed text-slate-300"
            >
              A spatial, single-viewport workspace built for fast navigation and tactile feedback.
              Here is how to move around and interact with the interface:
            </p>

            {/* Clean Hairline-Separated Feature List (no nested cards-within-cards) */}
            <ol className="relative mt-6 divide-y divide-white/10 border-y border-white/10">
              {INTERFACE_GUIDE_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <li key={item.index} className="py-4 first:pt-3.5 last:pb-3.5 flex items-start gap-4">
                    <div
                      className={`shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center ${item.accentClass}`}
                    >
                      <Icon className="w-4 h-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2.5">
                        <span className="font-orbitron text-xs font-bold tabular-nums text-slate-400">
                          {item.index}.
                        </span>
                        <h3 className="font-orbitron text-sm font-semibold tracking-wide text-white">
                          {item.title}
                        </h3>
                      </div>
                      <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-300/90">
                        {item.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>

            {/* Primary Dismissal Action */}
            <div className="relative mt-6 flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="text-xs text-slate-400">
                Reopen anytime from the help button in the top bar.
              </p>
              <button
                ref={primaryBtnRef}
                type="button"
                data-testid="welcome-modal-cta"
                onClick={onDismiss}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-orbitron text-xs sm:text-sm font-bold tracking-wider uppercase bg-gradient-to-r from-gold-400 via-amber-500 to-gold-500 hover:from-gold-300 hover:to-amber-400 text-space-950 shadow-lg shadow-gold-500/30 transition-transform active:scale-[0.98] whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
              >
                <span>Explore Interface</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>
          </motion.section>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
