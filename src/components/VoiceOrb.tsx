import React, { useRef } from 'react';
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react';
import { gsap, useGSAP } from '../lib/gsap';
import { dispatchParticleBurst } from './NeuralParticleField';
import {
  getNextVoiceOrbState,
  VOICE_ORB_TONE_HEX,
  type VoiceOrbState,
} from '../hooks/useVoiceOrbSimulation';
import { triggerSubtleHaptic } from '../utils/cognitiveFeedback';

interface VoiceOrbProps {
  orbState: VoiceOrbState;
  onOrbClick: () => void;
}

export function VoiceOrb({ orbState, onOrbClick }: VoiceOrbProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const pulseRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(() => {
    const stateConfig = {
      idle: { scale: 1.025, dur: 1.9, glow: 0.8, glow2: 0.65 },
      listen: { scale: 1.05, dur: 0.6, glow: 1.0, glow2: 0.8 },
      process: { scale: 1.04, dur: 1.3, glow: 0.9, glow2: 0.9 },
      speak: { scale: 1.06, dur: 0.38, glow: 1.0, glow2: 0.85 },
    } as const;
    const cfg = stateConfig[orbState];
    const mm = gsap.matchMedia();
    mm.add('(prefers-reduced-motion: no-preference)', () => {
      gsap.fromTo(
        '.va-gsap-pulse',
        { scale: 0.97 },
        { scale: cfg.scale, duration: cfg.dur, ease: 'sine.inOut', yoyo: true, repeat: -1 }
      );
      gsap.to('.va-glow', { opacity: cfg.glow, duration: 0.6, ease: 'power2.out' });
      gsap.to('.va-glow-secondary', { opacity: cfg.glow2, duration: 0.6, ease: 'power2.out' });
    });
    mm.add('(prefers-reduced-motion: reduce)', () => {
      gsap.set('.va-gsap-pulse', { scale: 1 });
      gsap.set('.va-glow', { opacity: cfg.glow });
      gsap.set('.va-glow-secondary', { opacity: cfg.glow2 });
    });
    return () => mm.revert();
  }, { scope: wrapRef, dependencies: [orbState], revertOnUpdate: true });

  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const rawRotateX = useMotionValue(0);
  const rawRotateY = useMotionValue(0);

  const springConfig = { stiffness: 210, damping: 22, mass: 0.65 };
  const followX = useSpring(rawX, springConfig);
  const followY = useSpring(rawY, springConfig);
  const tiltX = useSpring(rawRotateX, springConfig);
  const tiltY = useSpring(rawRotateY, springConfig);

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (prefersReducedMotion || e.pointerType !== 'mouse') return;
    const el = wrapRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;

    const normX = Math.max(-1, Math.min(1, ((e.clientX - rect.left) / rect.width - 0.5) * 2));
    const normY = Math.max(-1, Math.min(1, ((e.clientY - rect.top) / rect.height - 0.5) * 2));

    rawX.set(normX * 18);
    rawY.set(normY * 18);
    rawRotateY.set(normX * 9);
    rawRotateX.set(-normY * 9);
  };

  const handlePointerLeave = () => {
    rawX.set(0);
    rawY.set(0);
    rawRotateX.set(0);
    rawRotateY.set(0);
  };

  const handleActivate = (el: HTMLElement) => {
    triggerSubtleHaptic('orb');
    const nextState = getNextVoiceOrbState(orbState);
    const rect = el.getBoundingClientRect();
    dispatchParticleBurst(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      20,
      VOICE_ORB_TONE_HEX[nextState]
    );
    onOrbClick();
  };

  const handleOrbKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleActivate(e.currentTarget);
    }
  };

  return (
    <div
      ref={wrapRef}
      className="va-orb-wrap"
      data-testid="voice-orb"
      data-orb-state={orbState}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <input
        className="va-state va-state--idle"
        type="radio"
        name="va"
        id="va-idle"
        checked={orbState === 'idle'}
        readOnly
      />
      <input
        className="va-state va-state--listen"
        type="radio"
        name="va"
        id="va-listen"
        checked={orbState === 'listen'}
        readOnly
      />
      <input
        className="va-state va-state--process"
        type="radio"
        name="va"
        id="va-process"
        checked={orbState === 'process'}
        readOnly
      />
      <input
        className="va-state va-state--speak"
        type="radio"
        name="va"
        id="va-speak"
        checked={orbState === 'speak'}
        readOnly
      />

      <div
        className="va-orb-button"
        role="button"
        aria-label={`Voice assistant orb: ${orbState}. Activate to start or stop live voice conversation.`}
        aria-pressed={orbState !== 'idle'}
        tabIndex={0}
        onClick={(e) => handleActivate(e.currentTarget)}
        onKeyDown={handleOrbKeyDown}
      >
        <motion.div
          data-testid="voice-orb-tracker"
          style={{
            x: followX,
            y: followY,
            rotateX: tiltX,
            rotateY: tiltY,
            transformPerspective: 900,
          }}
          className="will-change-transform"
        >
          <div ref={pulseRef} className="va-gsap-pulse" style={{ willChange: 'transform' }}>
          <div className="va-orb">
            <div className="va-core" />
            <div className="va-glow" />
            <div className="va-glow-secondary" />
            <div className="va-rings" />
            <div className="va-rings va-rings--b" />
            <div className="va-wave va-wave--1" />
            <div className="va-wave va-wave--2" />
            <div className="va-wave va-wave--3" />
            <div className="va-mesh" />
            <div className="va-particles" />

            <div className="va-center-icon">
              <div className="va-icon va-icon--idle" aria-hidden="true">
                <svg className="va-svg va-svg--idle" viewBox="0 0 48 48">
                  <circle cx="24" cy="24" r="6" fill="currentColor" opacity="0.9" />
                  <circle
                    cx="24"
                    cy="24"
                    r="11"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    opacity="0.5"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    opacity="0.25"
                  />
                </svg>
              </div>

              <div className="va-icon va-icon--listen" aria-hidden="true">
                <svg
                  className="va-svg va-svg--mic"
                  xmlns="http://www.w3.org/2000/svg"
                  width="1000"
                  height="1000"
                  viewBox="0 0 1200 1200"
                >
                  <path
                    fill="currentColor"
                    d="M567.626 0C537 2.389 506.974 8.271 477.905 17.065v160.913h-65.918V43.14c-29.282 14.495-57.049 32.007-82.251 52.808c-.133.11-.233.256-.366.366v657.275c.133.11.233.256.366.366C406.208 817.3 502.917 851.18 600 851.367c99.333-.036 195.305-35.544 270.264-97.412c.135-.11.234-.256.365-.366V96.313c-.133-.11-.232-.256-.365-.366c-25.031-20.735-52.406-37.949-81.078-52.222v134.253h-65.918V17.505C694.014 8.594 663.939 2.485 633.545 0v177.979h-65.918zM199.951 525.22v336.548c24.117 22.258 50.082 42.471 77.637 60.498c63.482 41.534 135.354 71.234 212.549 85.84v-38.817h219.727v38.817c77.195-14.604 149.066-44.306 212.549-85.84c27.555-18.027 53.52-38.24 77.637-60.498V525.22h-77.637v297.876c-87.98 71.849-200.15 114.99-322.412 114.99s-234.432-43.143-322.412-114.99V525.22zm509.912 482.885c-35.59 6.732-72.324 10.254-109.864 10.254s-74.274-3.521-109.863-10.254v109.496H360.131V1200h479.738v-82.396H709.863z"
                  />
                </svg>
              </div>

              <div className="va-icon va-icon--process" aria-hidden="true">
                <svg
                  className="va-svg va-svg--spinner"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    d="M21.939 5.27C21.211 4.183 20 2.941 18.784 2.137C16.258.407 13.332-.207 10.744.061c-2.699.291-5.01 1.308-6.91 3.004C2.074 4.637.912 6.559.4 8.392c-.518 1.833-.449 3.53-.264 4.808c.195 1.297.841 2.929.841 2.929c.132.313.315.44.41.493c.472.258 1.247.031 1.842-.637c.03-.041.046-.098.03-.146c-.166-.639-.226-1.12-.285-1.492c-.135-.736-.195-1.969-.105-3.109a9 9 0 0 1 .375-1.969c.406-1.367 1.262-2.794 2.6-3.98c1.441-1.277 3.289-2.066 5.046-2.27a9 9 0 0 1 3.199.203a9.6 9.6 0 0 1 2.975 1.348a8.9 8.9 0 0 1 2.374 2.363c.568.797 1.185 2.141 1.366 3.125c.256 1.12.256 2.307.074 3.463c-.225 1.158-.631 2.284-1.262 3.275c-.435.768-1.337 1.783-2.403 2.545a9.4 9.4 0 0 1-3.184 1.434a8.7 8.7 0 0 1-1.728.24c-.521.016-1.212 0-1.697-.082c-.721-.115-.871-.299-1.036-.549c0 0-.115-.18-.147-.662c.011-4.405.009-3.229.009-5.516c0-.646-.021-1.232-.015-1.764c.03-.873.104-1.473.728-2.123a2.43 2.43 0 0 1 1.777-.768c.211 0 .938.01 1.577.541c.685.572.8 1.354.827 1.563c.156 1.223-.652 2.134-.962 2.365a3.5 3.5 0 0 1-.962.51a4.1 4.1 0 0 1-1.531.182a.15.15 0 0 0-.158.119l-.165.856c-.161.65.2.888.41.972c.671.207 1.266.293 1.971.24a4.93 4.93 0 0 0 3.052-1.346a4.47 4.47 0 0 0 1.359-2.645a5.9 5.9 0 0 0-.556-3.35a5.37 5.37 0 0 0-2.81-2.583c-1.291-.508-2.318-.526-3.642-.188l-.015.005c-.86.296-1.596.661-2.362 1.452a5.4 5.4 0 0 0-1.217 1.953c-.26.752-.33 1.313-.342 2.185c-.016.646.015 1.246.015 1.808v3.701c0 1.184-.04 1.389 0 1.998c.022.404.078.861.255 1.352c.182.541.564 1.096.826 1.352c.367.391.834.705 1.293.9c1.051.467 2.478.541 3.635.496a12 12 0 0 0 2.291-.314a12.2 12.2 0 0 0 4.235-1.918c1.367-.963 2.555-2.277 3.211-3.393c.841-1.326 1.385-2.814 1.668-4.343c.255-1.532.243-3.103-.099-4.612c-.27-1.4-.991-2.936-1.823-4.176z"
                  />
                </svg>
              </div>

              <div className="va-icon va-icon--speak" aria-hidden="true">
                <svg
                  className="va-svg va-svg--speaker"
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="currentColor"
                    fillRule="evenodd"
                    d="M12 2.12a1 1 0 0 1 .812.362c.16.194.197.434.213.609c.016.182.016.415.016.68v16.5c0 .265 0 .498-.016.68c-.016.175-.053.415-.213.609a1 1 0 0 1-.812.362c-.252-.01-.455-.144-.595-.249a9 9 0 0 1-.516-.442l-3.23-2.9c-.185-.167-.223-.197-.26-.218a.5.5 0 0 0-.136-.052c-.041-.01-.09-.012-.339-.012h-1.61c-.821 0-1.47 0-1.99-.043c-.531-.043-.975-.134-1.38-.339a3.52 3.52 0 0 1-1.53-1.53c-.205-.403-.296-.847-.339-1.38c-.043-.52-.043-1.17-.043-1.99v-1.44c0-.82 0-1.47.043-1.99c.043-.53.134-.975.339-1.38a3.52 3.52 0 0 1 1.53-1.53c.403-.205.847-.296 1.38-.339c.521-.042 1.17-.042 1.99-.042h1.61c.249 0 .298-.003.339-.012a.5.5 0 0 0 .136-.053c.037-.02.075-.051.26-.218l3.23-2.9c.197-.177.37-.333.516-.443c.14-.105.343-.238.595-.249zm.005 1.05c-.106.08-.245.204-.464.401L8.3 6.481c-.14.127-.264.238-.41.32a1.5 1.5 0 0 1-.41.157a2.4 2.4 0 0 1-.518.036h-1.62c-.848 0-1.45 0-1.93.04c-.47.038-.767.111-1.01.232a2.5 2.5 0 0 0-1.09 1.09c-.122.24-.195.536-.233 1.01c-.04.475-.04 1.08-.04 1.93v1.4c0 .848 0 1.45.04 1.93c.038.47.112.767.233 1.01c.24.47.622.853 1.09 1.09c.239.122.536.195 1.01.233c.475.04 1.08.04 1.93.04h1.62c.189 0 .356 0 .519.036q.215.048.409.157c.146.081.269.194.41.32l3.24 2.91a8 8 0 0 0 .486.417l.002-.027a8 8 0 0 0 .013-.613v-16.4a8 8 0 0 0-.015-.64l-.022.016z"
                    clipRule="evenodd"
                  />
                  <path
                    fill="currentColor"
                    d="M17.8 2.62a.5.5 0 0 1 .682-.187c3.32 1.89 5.56 5.47 5.56 9.56c0 4.11-2.25 7.69-5.58 9.58a.501.501 0 0 1-.494-.87c3.03-1.72 5.08-4.97 5.08-8.71c0-3.72-2.03-6.97-5.05-8.69a.5.5 0 0 1-.187-.682z"
                  />
                  <path
                    fill="currentColor"
                    d="M16.5 5.91a.5.5 0 0 0-.494.87a6.004 6.004 0 0 1 0 10.44a.5.5 0 0 0 .494.87A6.99 6.99 0 0 0 20.05 12c0-2.61-1.43-4.89-3.55-6.09"
                  />
                </svg>
              </div>
            </div>
          </div>
          </div>
        </motion.div>

        <div className="va-label" aria-live="polite">
          <span className="va-text va-text--idle">Ready</span>
          <span className="va-text va-text--listen">Listening</span>
          <span className="va-text va-text--process">Thinking</span>
          <span className="va-text va-text--speak">Speaking</span>
        </div>
      </div>
    </div>
  );
}
