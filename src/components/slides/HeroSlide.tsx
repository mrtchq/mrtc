import React, { useRef } from 'react';
import { motion, useTransform, type MotionValue } from 'motion/react';
import { gsap, SplitText, useGSAP } from '../../lib/gsap';
import { ArrowRight } from 'lucide-react';
import { VoiceOrb } from '../VoiceOrb';
import type { VoiceOrbState } from '../../hooks/useVoiceOrbSimulation';
import { useVoiceOrbSimulation } from '../../hooks/useVoiceOrbSimulation';
import { MARQUEE_ITEMS } from '../../config/marquee';

interface HeroSlideProps {
  isActive: boolean;
  onSelectSlide: (index: number) => void;
  parallaxProgress: MotionValue<number>;
  isLiveVoiceActive?: boolean;
  isLiveVoiceConnecting?: boolean;
  liveOrbState?: VoiceOrbState;
  onToggleLiveVoice?: () => void;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function HeroSlide({
  isActive,
  parallaxProgress,
  isLiveVoiceActive = false,
  isLiveVoiceConnecting = false,
  liveOrbState = 'idle',
  onToggleLiveVoice,
}: HeroSlideProps) {
  const heroSectionRef = useRef<HTMLElement>(null);
  const bgOrbitX = useTransform(parallaxProgress, [0, 1], [0, 160]);
  const bgOrbitScale = useTransform(parallaxProgress, [0, 0.35], [1, 1.15]);
  const contentX = useTransform(parallaxProgress, [0, 1], [0, -60]);

  const {
    orbState,
    cycleOrbState,
  } = useVoiceOrbSimulation('idle');

  const voiceSessionRunning = isLiveVoiceActive || isLiveVoiceConnecting;
  const effectiveOrbState: VoiceOrbState = voiceSessionRunning ? liveOrbState : orbState;

  const handleOrbClick = () => {
    if (onToggleLiveVoice) {
      onToggleLiveVoice();
    } else {
      cycleOrbState();
    }
  };

  useGSAP(() => {
    if (!isActive) return;

    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      const split = SplitText.create('.hero-headline', { type: 'chars,words' });
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.fromTo('.hero-circuit-path', { drawSVG: '0%' }, {
        drawSVG: '100%', duration: 1.1, stagger: 0.12, ease: 'power2.inOut',
      });
      tl.from(split.chars, { yPercent: 120, opacity: 0, duration: 0.7, stagger: 0.035 }, '-=0.55');
      tl.from('.hero-circuit-node', { opacity: 0, duration: 0.3, stagger: 0.08 }, '-=0.6');
      tl.from('.hero-cta', { y: 26, opacity: 0, duration: 0.6, stagger: 0.12, ease: 'back.out(1.6)' }, '-=0.15');
      gsap.fromTo('.hero-cta-primary .hero-cta-shine', { xPercent: -220, skewX: -20 }, { xPercent: 480, skewX: -20, duration: 1.5, ease: 'power2.inOut', repeat: -1, repeatDelay: 3.0, delay: 2.2 });
      gsap.fromTo('.hero-cta-secondary .hero-cta-shine', { xPercent: -220, skewX: -20 }, { xPercent: 480, skewX: -20, duration: 2.1, ease: 'power2.inOut', repeat: -1, repeatDelay: 4.2, delay: 3.4 });
      gsap.fromTo('.hero-cta-primary', { boxShadow: '0 10px 24px rgba(255,209,89,0.35)' }, { boxShadow: '0 10px 44px rgba(255,209,89,0.65)', duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      gsap.fromTo('.hero-cta-secondary', { boxShadow: '0 0 0px rgba(236,72,153,0)' }, { boxShadow: '0 0 26px rgba(236,72,153,0.40)', duration: 2.0, ease: 'sine.inOut', yoyo: true, repeat: -1 });
      const ctas = gsap.utils.toArray<HTMLElement>('.hero-cta');
      const handlers = ctas.map((el) => {
        const enter = (e: PointerEvent) => { if (e.pointerType === 'mouse') gsap.to(el, { scale: 1.045, duration: 0.35, ease: 'back.out(3)' }); };
        const leave = () => gsap.to(el, { scale: 1, duration: 0.3, ease: 'power2.out' });
        const down = () => gsap.to(el, { scale: 0.94, duration: 0.12, ease: 'power2.out' });
        const up = () => gsap.to(el, { scale: 1, duration: 0.6, ease: 'elastic.out(1, 0.45)' });
        el.addEventListener('pointerenter', enter);
        el.addEventListener('pointerleave', leave);
        el.addEventListener('pointerdown', down);
        el.addEventListener('pointerup', up);
        return () => {
          el.removeEventListener('pointerenter', enter);
          el.removeEventListener('pointerleave', leave);
          el.removeEventListener('pointerdown', down);
          el.removeEventListener('pointerup', up);
        };
      });
      return () => {
        split.revert();
        handlers.forEach((cleanup) => cleanup());
      };
    });
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set('.hero-circuit-path', { drawSVG: '100%' });
      gsap.set('.hero-cta-shine', { opacity: 0 });
      gsap.set('.hero-cta', { clearProps: 'boxShadow,scale' });
    });

    return () => mm.revert();
  }, { scope: heroSectionRef, dependencies: [isActive], revertOnUpdate: true });

  return (
    <motion.section
      ref={heroSectionRef}
      id="hero"
      variants={containerVariants}
      initial="hidden"
      animate={isActive ? 'visible' : 'visible'}
      aria-label="Hero Overview"
      className="slide-section min-w-full w-full h-full overflow-hidden flex flex-col items-center justify-between px-5 sm:px-14 md:px-20 text-center relative pt-4 pb-3 sm:pt-6 sm:pb-5"
    >
      {/* Announcement marquee — items editable in src/config/marquee.ts */}
      <div
        data-testid="announcement-marquee"
        aria-label="Announcements"
        className="marquee relative z-10 w-full shrink-0 overflow-hidden border-b border-gold-400/20 bg-space-950/70 py-1.5 -mx-5 sm:-mx-14 md:-mx-20 -mt-4 sm:-mt-6"
      >
        <div className="marquee-track flex w-max items-center">
          {[0, 1].map((dup) => (
            <div key={dup} aria-hidden={dup === 1} className="flex shrink-0 items-center">
              {MARQUEE_ITEMS.map((item) => {
                const inner = (
                  <>
                    <span aria-hidden="true" className="text-chroma-magenta">◆</span>
                    {item.text}
                  </>
                );
                const cls =
                  'mx-4 flex shrink-0 items-center gap-2 whitespace-nowrap font-orbitron text-[11px] sm:text-xs font-bold uppercase tracking-[0.2em] text-gold-300';
                return item.href ? (
                  <a
                    key={dup + '-' + item.text}
                    href={item.href}
                    className={cls + ' hover:text-gold-200'}
                  >
                    {inner}
                  </a>
                ) : (
                  <span key={dup + '-' + item.text} className={cls}>
                    {inner}
                  </span>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Parallax Deep Orbital Ring Backdrop */}
      <motion.div
        aria-hidden="true"
        data-testid="hero-parallax-orbit"
        style={{ x: bgOrbitX, scale: bgOrbitScale }}
        className="pointer-events-none absolute inset-0 flex items-center justify-center z-0 will-change-transform"
      >
        <div className="w-[460px] h-[460px] md:w-[680px] md:h-[680px] rounded-full border border-gold-400/10 flex items-center justify-center">
          <div className="w-[340px] h-[340px] md:w-[490px] md:h-[490px] rounded-full border border-chroma-magenta/15 border-dashed" />
        </div>
      </motion.div>

      <motion.div
        style={{ x: contentX }}
        className="w-full flex-1 min-h-0 max-w-4xl mx-auto flex flex-col items-center justify-between relative z-10 will-change-transform"
      >
        {/* Centerpiece Enlarged Voice Orb */}
        <motion.div
          variants={itemVariants}
          className="flex-1 min-h-0 w-full flex items-center justify-center relative"
        >
          <div
            className="pointer-events-none absolute inset-x-0 top-0 z-10 flex flex-col items-center px-4"
          >
            <svg className="hero-circuit w-[min(80vw,540px)] h-auto" viewBox="0 0 600 110" fill="none" aria-hidden="true">
              <path className="hero-circuit-path" d="M10 90 H180 L210 60 H390 L420 90 H590" stroke="#ffd159" strokeWidth="1.5" fill="none" />
              <path className="hero-circuit-path" d="M60 105 H240 L265 80 H335 L360 105 H540" stroke="#00e5ff" strokeWidth="1.5" fill="none" />
              <path className="hero-circuit-path" d="M150 20 V45 L175 62" stroke="#ffd159" strokeWidth="1.5" fill="none" />
              <path className="hero-circuit-path" d="M450 20 V45 L425 62" stroke="#ec4899" strokeWidth="1.5" fill="none" />
              <path className="hero-circuit-path" d="M300 8 V34" stroke="#00e5ff" strokeWidth="1.5" fill="none" />
              <circle className="hero-circuit-node" cx="10" cy="90" r="3" fill="#ffd159" />
              <circle className="hero-circuit-node" cx="590" cy="90" r="3" fill="#ffd159" />
              <circle className="hero-circuit-node" cx="150" cy="20" r="2.5" fill="#ffd159" />
              <circle className="hero-circuit-node" cx="450" cy="20" r="2.5" fill="#ffd159" />
            </svg>
          </div>
          <div className="relative translate-y-[6vh] scale-[0.94]">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full pointer-events-none opacity-40"
            style={{
              background:
                'radial-gradient(circle, rgba(255,209,89,0.2) 0%, rgba(236,72,153,0.14) 42%, transparent 70%)',
            }}
          />
          <VoiceOrb orbState={effectiveOrbState} onOrbClick={handleOrbClick} />
          </div>
        </motion.div>

        {/* Action Buttons Pushed Down Just Above Pagination Bar */}
        <motion.div
          variants={itemVariants}
          data-testid="hero-action-buttons"
          className="shrink-0 relative flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto pb-1 sm:pb-2"
        >
          <a href="https://mrtc.me/#/portal/signin" className="hero-cta hero-cta-primary relative overflow-hidden w-full sm:w-auto px-8 py-3.5 rounded-xl font-orbitron text-xs sm:text-sm font-bold tracking-widest uppercase bg-gradient-to-r from-gold-400 via-amber-500 to-gold-600 hover:from-gold-300 hover:to-amber-400 text-space-950 shadow-lg shadow-gold-500/40 flex items-center justify-center space-x-2 whitespace-nowrap cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300">
            <span aria-hidden="true" className="hero-cta-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/50 to-transparent" style={{ transform: 'translateX(-220%) skewX(-20deg)' }} />
            <span className="relative z-10 flex items-center justify-center space-x-2">
              SIGN IN
              <ArrowRight className="w-4 h-4 text-space-950" aria-hidden="true" />
            </span>
          </a>

          <a href="https://learn.mrtc.me/" className="hero-cta hero-cta-secondary relative overflow-hidden w-full sm:w-auto px-8 py-3.5 rounded-xl font-orbitron text-xs sm:text-sm font-semibold tracking-widest uppercase bg-space-900/80 hover:bg-space-850 text-slate-100 border border-purple-500/40 hover:border-chroma-magenta shadow-md rainbow-border-pulse flex items-center justify-center whitespace-nowrap cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-chroma-magenta">
            <span aria-hidden="true" className="hero-cta-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/25 to-transparent" style={{ transform: 'translateX(-220%) skewX(-20deg)' }} />
            <span className="relative z-10 flex items-center justify-center space-x-2">COURSES</span>
          </a>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
