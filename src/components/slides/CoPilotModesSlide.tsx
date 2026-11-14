import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { MODES_DATA, type CognitiveModeSpec } from '../../utils/cognitiveEngine';
import { dispatchParticleBurst } from '../NeuralParticleField';
import { TiltCard } from '../TiltCard';

interface CoPilotModesSlideProps {
  isActive: boolean;
  onSimulateProtocol: () => void;
}

function ModeHologramSvg({
  modeId,
  isSimulating,
  isActive,
}: {
  modeId: CognitiveModeSpec['id'];
  isSimulating: boolean;
  isActive: boolean;
}) {
  if (modeId === 'task-anchor') {
    return (
      <motion.svg
        key="task-anchor"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: isSimulating ? 1.06 : 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full h-64"
        viewBox="0 0 400 320"
        fill="none"
        aria-hidden="true"
      >
        {/* Left Gold Circuit Hemisphere */}
        <g>
          <motion.path
            d="M190 40 C120 40 70 90 70 160 C70 210 95 240 120 270 C140 295 160 300 190 305"
            stroke="#f5b82e"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />
          <motion.path
            d="M140 100 L170 100 L170 150 L190 150"
            stroke="#ffd159"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          />
          <motion.circle
            cx="140"
            cy="100"
            r="5"
            fill="#00e5ff"
            stroke="#fff"
            strokeWidth="1"
            animate={isActive ? { scale: [1, 1.3, 1] } : { scale: 1 }}
            transition={isActive ? { duration: 2, repeat: Infinity } : { duration: 0.2 }}
          />
          <motion.path
            d="M110 160 L140 160 L140 210 L190 210"
            stroke="#ffd159"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.7, delay: 0.35 }}
          />
          <circle cx="110" cy="160" r="5" fill="#f5b82e" stroke="#fff" strokeWidth="1" />
          <circle cx="150" cy="250" r="4.5" fill="#00e5ff" />
          <motion.path
            d="M150 250 L170 250 L190 270"
            stroke="#ffd159"
            strokeWidth="2"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.6, delay: 0.45 }}
          />
          <motion.circle
            cx="190"
            cy="150"
            r="6"
            fill="#ffd159"
            animate={isActive ? { scale: [1, 1.8, 1], opacity: [1, 0.35, 1] } : { scale: 1, opacity: 1 }}
            transition={isActive ? { duration: 1.5, repeat: Infinity } : { duration: 0.2 }}
          />
        </g>

        {/* Center dividing energy beam */}
        <motion.line
          x1="200"
          y1="30"
          x2="200"
          y2="310"
          stroke="#ffe082"
          strokeWidth="3"
          strokeDasharray="6 4"
          animate={isActive ? { opacity: [0.35, 0.85, 0.35] } : { opacity: 0.6 }}
          transition={isActive ? { duration: 2.2, repeat: Infinity } : { duration: 0.2 }}
        />

        {/* Right Rainbow Swirl Hemisphere */}
        <g>
          <motion.path
            d="M210 40 C280 40 330 90 330 160 C330 210 305 240 280 270 C260 295 240 300 210 305"
            stroke="#ec4899"
            strokeWidth="4"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
          />
          <motion.path
            d="M220 90 C260 85 285 115 260 140 C235 165 240 200 280 205"
            stroke="#9333ea"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.25 }}
          />
          <motion.path
            d="M220 160 C250 160 280 180 260 220 C240 255 230 270 260 280"
            stroke="#00e5ff"
            strokeWidth="3"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          />
          <motion.circle
            cx="280"
            cy="110"
            r="6"
            fill="#f97316"
            animate={isActive ? { scale: [1, 1.25, 1] } : { scale: 1 }}
            transition={isActive ? { duration: 1.8, repeat: Infinity, delay: 0.2 } : { duration: 0.2 }}
          />
          <motion.circle
            cx="310"
            cy="170"
            r="7"
            fill="#10b981"
            animate={isActive ? { scale: [1, 1.25, 1] } : { scale: 1 }}
            transition={isActive ? { duration: 2.1, repeat: Infinity, delay: 0.5 } : { duration: 0.2 }}
          />
          <motion.circle
            cx="270"
            cy="250"
            r="5"
            fill="#ec4899"
            animate={isActive ? { scale: [1, 1.35, 1] } : { scale: 1 }}
            transition={isActive ? { duration: 1.6, repeat: Infinity, delay: 0.8 } : { duration: 0.2 }}
          />
        </g>
      </motion.svg>
    );
  }

  if (modeId === 'kaleidoscope-brain') {
    return (
      <motion.svg
        key="kaleidoscope-brain"
        initial={{ opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: isSimulating ? 1.06 : 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="w-full h-64"
        viewBox="0 0 400 320"
        fill="none"
        aria-hidden="true"
      >
        <g transform="translate(200, 170)">
          <motion.circle
            cx="0"
            cy="0"
            r="82"
            stroke="url(#kaleidoGrad)"
            strokeWidth="3.5"
            strokeDasharray="10 6"
            style={{ transformOrigin: '0px 0px' }}
            animate={isActive ? { rotate: 360 } : { rotate: 0 }}
            transition={
              isActive
                ? { duration: isSimulating ? 4 : 18, repeat: Infinity, ease: 'linear' }
                : { duration: 0.2 }
            }
          />
          <motion.circle
            cx="0"
            cy="0"
            r="46"
            stroke="#ffd159"
            strokeWidth="2.5"
            strokeDasharray="6 4"
            style={{ transformOrigin: '0px 0px' }}
            animate={isActive ? { rotate: -360 } : { rotate: 0 }}
            transition={
              isActive
                ? { duration: isSimulating ? 3 : 12, repeat: Infinity, ease: 'linear' }
                : { duration: 0.2 }
            }
          />
          <motion.circle
            cx="0"
            cy="0"
            r="18"
            fill="#ec4899"
            animate={isActive ? { scale: [1, 1.25, 1], opacity: [0.85, 1, 0.85] } : { scale: 1, opacity: 0.95 }}
            transition={isActive ? { duration: 1.6, repeat: Infinity } : { duration: 0.2 }}
          />
        </g>
        <line x1="200" y1="50" x2="200" y2="90" stroke="#f5b82e" strokeWidth="3" strokeLinecap="round" />
        <line x1="200" y1="250" x2="200" y2="290" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
        <line x1="80" y1="170" x2="120" y2="170" stroke="#00e5ff" strokeWidth="3" strokeLinecap="round" />
        <line x1="280" y1="170" x2="320" y2="170" stroke="#ec4899" strokeWidth="3" strokeLinecap="round" />

        <motion.circle
          cx="110"
          cy="100"
          r="8"
          fill="#ffd159"
          animate={isActive ? { y: [0, -6, 0] } : { y: 0 }}
          transition={isActive ? { duration: 2.4, repeat: Infinity } : { duration: 0.2 }}
        />
        <motion.circle
          cx="290"
          cy="100"
          r="9"
          fill="#00e5ff"
          animate={isActive ? { y: [0, 6, 0] } : { y: 0 }}
          transition={isActive ? { duration: 2.2, repeat: Infinity, delay: 0.3 } : { duration: 0.2 }}
        />
        <motion.circle
          cx="110"
          cy="240"
          r="7"
          fill="#f97316"
          animate={isActive ? { y: [0, 5, 0] } : { y: 0 }}
          transition={isActive ? { duration: 2.6, repeat: Infinity, delay: 0.6 } : { duration: 0.2 }}
        />
        <motion.circle
          cx="290"
          cy="240"
          r="8"
          fill="#10b981"
          animate={isActive ? { y: [0, -5, 0] } : { y: 0 }}
          transition={isActive ? { duration: 2.1, repeat: Infinity, delay: 0.9 } : { duration: 0.2 }}
        />

        <defs>
          <linearGradient id="kaleidoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd159" />
            <stop offset="30%" stopColor="#00e5ff" />
            <stop offset="60%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </motion.svg>
    );
  }

  return (
    <motion.svg
      key="dopamine-pacer"
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: isSimulating ? 1.06 : 1 }}
      exit={{ opacity: 0, scale: 0.96 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      className="w-full h-64"
      viewBox="0 0 400 320"
      fill="none"
      aria-hidden="true"
    >
      <motion.path
        d="M60 170 Q 130 60, 200 170 T 340 170"
        stroke="#10b981"
        strokeWidth="4"
        strokeLinecap="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.85, ease: 'easeOut' }}
      />
      <motion.path
        d="M60 170 Q 130 280, 200 170 T 340 170"
        stroke="#ffd159"
        strokeWidth="3"
        strokeDasharray="5 5"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.95, ease: 'easeOut', delay: 0.15 }}
      />
      <motion.circle
        cx="130"
        cy="115"
        r="9"
        fill="#00e5ff"
        stroke="#fff"
        strokeWidth="1.5"
        animate={isActive ? { scale: [1, 1.22, 1] } : { scale: 1 }}
        transition={isActive ? { duration: 1.8, repeat: Infinity } : { duration: 0.2 }}
      />
      <motion.circle
        cx="200"
        cy="170"
        r="10"
        fill="#ffd159"
        stroke="#fff"
        strokeWidth="2"
        animate={isActive ? { scale: [1, 1.5, 1], opacity: [1, 0.55, 1] } : { scale: 1, opacity: 1 }}
        transition={isActive ? { duration: 1.4, repeat: Infinity } : { duration: 0.2 }}
      />
      <motion.circle
        cx="270"
        cy="225"
        r="9"
        fill="#ec4899"
        stroke="#fff"
        strokeWidth="1.5"
        animate={isActive ? { scale: [1, 1.22, 1] } : { scale: 1 }}
        transition={isActive ? { duration: 1.8, repeat: Infinity, delay: 0.6 } : { duration: 0.2 }}
      />
      <line x1="60" y1="170" x2="340" y2="170" stroke="#64748b" strokeWidth="1.5" strokeDasharray="2 4" />
    </motion.svg>
  );
}

export function CoPilotModesSlide({ isActive, onSimulateProtocol }: CoPilotModesSlideProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [simStage, setSimStage] = useState<'idle' | 'syncing' | 'active'>('idle');
  const [pulseRingKey, setPulseRingKey] = useState(0);

  const activeMode = MODES_DATA[selectedIndex];

  const handleSelectMode = (idx: number) => {
    setSelectedIndex(idx);
  };

  const handleProtocolClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    dispatchParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 32, activeMode.accentHex);
    onSimulateProtocol();
    setPulseRingKey((k) => k + 1);
    setSimStage('syncing');

    window.setTimeout(() => {
      setSimStage('active');
      dispatchParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 22);
    }, 650);

    window.setTimeout(() => {
      setSimStage('idle');
    }, 2200);
  };

  const buttonLabel =
    simStage === 'syncing'
      ? 'SYNCHRONIZING PROTOCOL...'
      : simStage === 'active'
        ? 'PROTOCOL RUNNING AT 100%'
        : 'SIMULATE PROTOCOL EXECUTION';

  return (
    <section
      id="copilot-modes"
      aria-label="Interactive Co-Pilot Modes"
      className="slide-section min-w-full w-full h-full overflow-y-auto no-scrollbar flex flex-col items-center px-5 sm:px-14 md:px-20 relative py-6 sm:py-8"
    >
      <div className="my-auto max-w-6xl w-full mx-auto">
        <motion.div
          initial={false}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.72, y: 12 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col md:flex-row md:items-end justify-between mb-6"
        >
          <div>
            <span className="text-xs font-rajdhani tracking-[0.3em] uppercase text-gold-400">
              Section 03 · Adaptive Engine
            </span>
            <h3 className="font-orbitron text-2xl md:text-4xl font-extrabold text-white mt-1">
              INTERACTIVE CO-PILOT MODES
            </h3>
          </div>

          {/* Mode Selector Tabs with Framer Motion layoutId shared indicator */}
          <div
            role="tablist"
            aria-label="Co-Pilot Mode Selector"
            className="flex flex-wrap gap-2 mt-4 md:mt-0 font-rajdhani text-xs tracking-wider"
          >
            {MODES_DATA.map((mode, idx) => {
              const isActive = idx === selectedIndex;
              return (
                <button
                  key={mode.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => handleSelectMode(idx)}
                  className={`relative px-4 py-2 rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                    isActive
                      ? 'border-gold-400 text-gold-300 font-bold'
                      : 'bg-space-850/90 border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeModeTab"
                      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                      className="absolute inset-0 rounded-lg bg-gold-500/20 shadow-md -z-0"
                    />
                  )}
                  <span className="relative z-10">{mode.tabLabel}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Mode Showcase Canvas */}
        <motion.div
          initial={false}
          animate={isActive ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0.72, y: 12, scale: 0.98 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="will-change-transform"
        >
          <TiltCard
            variant="gold"
            tiltMax={4}
            className="rounded-2xl p-6 md:p-8 border border-gold-400/30 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
          >
          {/* Animated Hologram Panel */}
          <div className="lg:col-span-6 flex justify-center items-center relative py-4">
            <div
              aria-hidden="true"
              className={`absolute inset-0 pointer-events-none transition-opacity duration-300 ${
                simStage !== 'idle' ? 'opacity-90' : 'opacity-60'
              }`}
              style={{
                background: `radial-gradient(ellipse closest-side, ${activeMode.accentHex}2c 0%, rgba(147,51,234,0.14) 55%, transparent 100%)`,
              }}
            />

            {/* Expanding Shockwave Energy Rings on Simulation */}
            <AnimatePresence>
              {pulseRingKey > 0 && (
                <motion.div
                  key={pulseRingKey}
                  aria-hidden="true"
                  initial={{ scale: 0.4, opacity: 0.9 }}
                  animate={{ scale: 1.9, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.9, ease: 'easeOut' }}
                  className="absolute w-52 h-52 rounded-full border-2 pointer-events-none"
                  style={{ borderColor: activeMode.accentHex }}
                />
              )}
            </AnimatePresence>

            <div className="relative z-10 w-full max-w-sm min-h-[16rem] flex items-center justify-center">
              <AnimatePresence mode="wait" initial={false}>
                <ModeHologramSvg
                  key={activeMode.id}
                  modeId={activeMode.id}
                  isSimulating={simStage !== 'idle'}
                  isActive={isActive}
                />
              </AnimatePresence>
            </div>
          </div>

          {/* Dynamic Mode Specs & Telemetry */}
          <div className="lg:col-span-6 flex flex-col justify-center space-y-4">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={activeMode.id}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -12 }}
                transition={{ duration: 0.18 }}
              >
                <span className="text-xs font-rajdhani tracking-[0.25em] text-gold-400 font-semibold">
                  {activeMode.protocolClass}
                </span>
                <h4 className="font-orbitron font-bold text-2xl md:text-3xl text-white mt-0.5">
                  {activeMode.name}
                </h4>
                <p className="font-sans text-xs md:text-sm text-slate-300 mt-2 leading-relaxed">
                  {activeMode.desc}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* GPU-composited scaleX animated progress bars */}
            <div className="space-y-3 font-rajdhani pt-2">
              {activeMode.metrics.map((metric) => (
                <div key={metric.label}>
                  <div className="flex justify-between text-xs tracking-wider mb-1">
                    <span className="text-slate-300">{metric.label}</span>
                    <span className={`${metric.textClass} font-semibold tabular-nums`}>
                      {metric.valueText}
                    </span>
                  </div>
                  <div className="w-full bg-space-950 rounded-full h-2 overflow-hidden border border-slate-700">
                    <motion.div
                      className={`bg-gradient-to-r ${metric.barClass} h-full rounded-full origin-left`}
                      initial={false}
                      animate={{ scaleX: metric.percent / 100 }}
                      transition={{ type: 'spring', stiffness: 140, damping: 20 }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2">
              <motion.button
                type="button"
                onClick={handleProtocolClick}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className={`px-6 py-2.5 rounded-lg border transition-colors text-xs font-orbitron font-bold tracking-widest uppercase whitespace-nowrap cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                  simStage !== 'idle'
                    ? 'bg-gold-400 text-space-950 border-gold-300 shadow-[0_0_25px_rgba(255,209,89,0.65)]'
                    : 'bg-gold-500/20 border-gold-400 text-gold-300 hover:bg-gold-400 hover:text-space-950'
                }`}
              >
                {buttonLabel}
              </motion.button>
            </div>
          </div>
          </TiltCard>
        </motion.div>
      </div>
    </section>
  );
}
