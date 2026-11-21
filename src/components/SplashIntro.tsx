import React, { useMemo, useRef } from 'react';
import { gsap, SplitText, useGSAP } from '../lib/gsap';

export const SPLASH_STORAGE_KEY = 'mrtc_splash_seen_v1';

export function readSplashSeen(): boolean {
  try {
    return sessionStorage.getItem(SPLASH_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function writeSplashSeen(): void {
  try {
    sessionStorage.setItem(SPLASH_STORAGE_KEY, 'true');
  } catch {
    // Storage can be unavailable in restricted browsing contexts.
  }
}

export function SplashIntro({ onComplete }: { onComplete: () => void }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stars = useMemo(() => {
    const colors = ['#00e5ff', '#ec4899', '#ffd159', '#10b981', '#9333ea'];
    let seed = 413;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    return Array.from({ length: 36 }, (_, index) => ({
      id: index,
      left: `${random() * 100}%`,
      top: `${random() * 100}%`,
      size: `${2 + Math.round(random())}px`,
      color: colors[Math.floor(random() * colors.length)],
    }));
  }, []);

  useGSAP(() => {
    const rootEl = rootRef.current;
    if (!rootEl) return;

    let finished = false;
    let masterTimeline: gsap.core.Timeline | undefined;
    let mm: gsap.MatchMedia | undefined;
    let failsafe: number | undefined;
    const startTime = Date.now();
    const complete = () => {
      if (finished) return;
      finished = true;
      if (failsafe !== undefined) window.clearTimeout(failsafe);
      onComplete();
    };
    const skip = () => {
      if (finished) return;
      masterTimeline?.kill();
      gsap.to(rootEl, { autoAlpha: 0, duration: 0.3, ease: 'power2.out', onComplete: complete });
    };
    const blockAndMaybeSkip = (event: Event) => {
      event.stopPropagation();
      if (Date.now() - startTime >= 400) skip();
    };
    const onPointerDown = () => {
      if (Date.now() - startTime >= 400) skip();
    };

    try {
      failsafe = window.setTimeout(complete, 4000);
      window.addEventListener('keydown', blockAndMaybeSkip, true);
      window.addEventListener('wheel', blockAndMaybeSkip, true);
      rootEl.addEventListener('pointerdown', onPointerDown);

      mm = gsap.matchMedia();
      mm.add('(prefers-reduced-motion: reduce)', () => {
        complete();
      });
      mm.add('(prefers-reduced-motion: no-preference)', () => {
        const split = SplitText.create('.splash-headline', { type: 'chars,words' });

        gsap.fromTo('.splash-orb-pulse', { scale: 0.97 }, { scale: 1.025, duration: 1.9, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        gsap.fromTo('.splash-orb', { boxShadow: '0 0 24px rgba(6,182,212,0.35)' }, { boxShadow: '0 0 48px rgba(6,182,212,0.65)', duration: 1.6, ease: 'sine.inOut', yoyo: true, repeat: -1 });
        gsap.to('.splash-star', { opacity: 0.15, duration: 1.3, ease: 'sine.inOut', yoyo: true, repeat: -1, stagger: { each: 0.12, from: 'random' } });

        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        masterTimeline = tl;
        tl.fromTo('.splash-circuit-path', { drawSVG: '0%' }, { drawSVG: '100%', duration: 1.1, stagger: 0.12, ease: 'power2.inOut' });
        tl.from(split.chars, { yPercent: 120, opacity: 0, duration: 0.7, stagger: 0.035 }, '-=0.55');
        tl.from('.splash-circuit-node', { opacity: 0, duration: 0.3, stagger: 0.08 }, '-=0.6');
        tl.from('.splash-orb', { scale: 0.5, opacity: 0, duration: 0.6, ease: 'back.out(1.6)' }, '-=0.25');
        tl.from('.splash-kicker', { opacity: 0, y: 14, duration: 0.5 }, '-=0.3');
        tl.to('.splash-kicker', { duration: 0.9, scrambleText: { text: 'DUAL-SYNAPSE OS · SECTOR 01', chars: 'upperCase', revealDelay: 0.1, speed: 0.6 } }, '<');
        tl.fromTo('.splash-shine', { xPercent: -220, skewX: -20 }, { xPercent: 480, skewX: -20, duration: 1.5, ease: 'power2.inOut' }, '-=1.5');
        tl.to(rootEl, { autoAlpha: 0, yPercent: -3, duration: 0.55, ease: 'power2.inOut', onComplete: complete }, '-=0.25');
        return () => split.revert();
      });

      return () => {
        if (failsafe !== undefined) window.clearTimeout(failsafe);
        window.removeEventListener('keydown', blockAndMaybeSkip, true);
        window.removeEventListener('wheel', blockAndMaybeSkip, true);
        rootEl.removeEventListener('pointerdown', onPointerDown);
        mm?.revert();
      };
    } catch {
      rootEl.style.transition = 'opacity .3s';
      rootEl.style.opacity = '0';
      window.setTimeout(onComplete, 320);
    }
  }, { scope: rootRef });

  return (
    <div ref={rootRef} data-testid="splash-intro" role="dialog" aria-label="MrTC Builds intro" className="fixed inset-0 z-[100] overflow-hidden bg-[#030306] flex flex-col items-center justify-center select-none">
      <div aria-hidden className="nebula-glow" />
      <div aria-hidden className="circuit-grid absolute inset-0 opacity-35" />
      <div aria-hidden className="horizon-light-beam" />
      <div aria-hidden className="absolute inset-0">
        {stars.map((star) => (
          <span key={star.id} className="splash-star" style={{ position: 'absolute', left: star.left, top: star.top, width: star.size, height: star.size, borderRadius: '9999px', backgroundColor: star.color, opacity: 0.85 }} />
        ))}
      </div>
      <div className="relative z-10 flex flex-col items-center px-5 text-center">
        <div className="relative overflow-hidden">
          <svg className="splash-circuit w-[min(80vw,540px)] h-auto" viewBox="0 0 600 110" fill="none" aria-hidden="true">
            <path className="splash-circuit-path" d="M10 90 H180 L210 60 H390 L420 90 H590" stroke="#ffd159" strokeWidth="1.5" fill="none" />
            <path className="splash-circuit-path" d="M60 105 H240 L265 80 H335 L360 105 H540" stroke="#00e5ff" strokeWidth="1.5" fill="none" />
            <path className="splash-circuit-path" d="M150 20 V45 L175 62" stroke="#ffd159" strokeWidth="1.5" fill="none" />
            <path className="splash-circuit-path" d="M450 20 V45 L425 62" stroke="#ec4899" strokeWidth="1.5" fill="none" />
            <path className="splash-circuit-path" d="M300 8 V34" stroke="#00e5ff" strokeWidth="1.5" fill="none" />
            <circle className="splash-circuit-node" cx="10" cy="90" r="3" fill="#ffd159" />
            <circle className="splash-circuit-node" cx="590" cy="90" r="3" fill="#ffd159" />
            <circle className="splash-circuit-node" cx="150" cy="20" r="2.5" fill="#ffd159" />
            <circle className="splash-circuit-node" cx="450" cy="20" r="2.5" fill="#ffd159" />
          </svg>
          <h1 className="splash-headline mt-1 text-center font-orbitron text-4xl sm:text-5xl md:text-6xl font-extrabold leading-none tracking-[0.08em] text-white">
            MrTC <span className="text-gold-300">Builds</span>
          </h1>
          <span aria-hidden className="splash-shine pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent" style={{ transform: 'translateX(-220%) skewX(-20deg)' }} />
        </div>
        <div className="relative mt-8 flex items-center justify-center">
          <div aria-hidden className="splash-halo absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full pointer-events-none opacity-40" style={{ background: 'radial-gradient(circle, rgba(255,209,89,0.2) 0%, rgba(236,72,153,0.14) 42%, transparent 70%)' }} />
          <div aria-hidden className="splash-glow absolute w-40 h-40 rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.55) 0%, transparent 70%)', opacity: 0.8 }} />
          <div className="splash-orb-pulse relative">
            <div className="splash-orb w-24 h-24 rounded-full" style={{ background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.55), transparent 50%), radial-gradient(circle at 50% 50%, rgba(6,182,212,0.95) 0%, rgba(6,182,212,0.35) 55%, rgba(6,182,212,0.05) 72%)' }} />
          </div>
        </div>
        <p className="splash-kicker mt-8 font-rajdhani text-sm sm:text-base font-semibold uppercase tracking-[0.35em] text-slate-300">DUAL-SYNAPSE OS · SECTOR 01</p>
      </div>
    </div>
  );
}
