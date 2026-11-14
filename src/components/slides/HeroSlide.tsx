import React from 'react';
import { motion, useTransform, type MotionValue } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { TiltCard } from '../TiltCard';
import { dispatchParticleBurst } from '../NeuralParticleField';

interface HeroSlideProps {
  isActive: boolean;
  onSelectSlide: (index: number) => void;
  parallaxProgress: MotionValue<number>;
}

const KPI_CARDS = [
  {
    value: '4.8×',
    label: 'Task Velocity',
    valueClass: 'gold-gradient-text',
    borderClass: 'border-gold-400/30',
    burstColor: '#ffd159',
  },
  {
    value: '0%',
    label: 'Executive Paralysis',
    valueClass: 'text-chroma-cyan',
    borderClass: 'border-chroma-cyan/30',
    burstColor: '#00e5ff',
  },
  {
    value: '∞ Flow',
    label: 'Hyperfocus Guidance',
    valueClass: 'text-chroma-magenta',
    borderClass: 'border-chroma-magenta/30',
    burstColor: '#ec4899',
  },
  {
    value: '99.2%',
    label: 'Dopamine Harmony',
    valueClass: 'text-chroma-lime',
    borderClass: 'border-chroma-lime/30',
    burstColor: '#10b981',
  },
];

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

export function HeroSlide({ isActive, onSelectSlide, parallaxProgress }: HeroSlideProps) {
  const bgOrbitX = useTransform(parallaxProgress, [0, 1], [0, 160]);
  const bgOrbitScale = useTransform(parallaxProgress, [0, 0.35], [1, 1.15]);
  const headlineX = useTransform(parallaxProgress, [0, 1], [0, -60]);
  const kpiLayerX = useTransform(parallaxProgress, [0, 1], [0, -100]);

  const handleActionClick = (
    e: React.MouseEvent<HTMLButtonElement>,
    slideIndex: number,
    colorHex: string
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    dispatchParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 26, colorHex);
    onSelectSlide(slideIndex);
  };

  return (
    <motion.section
      id="hero"
      variants={containerVariants}
      initial="hidden"
      animate={isActive ? 'visible' : 'visible'}
      aria-label="Hero Overview"
      className="slide-section min-w-full w-full h-full overflow-y-auto no-scrollbar flex flex-col items-center px-5 sm:px-14 md:px-20 text-center relative py-6 sm:py-8"
    >
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
        style={{ x: headlineX }}
        className="my-auto max-w-4xl w-full mx-auto flex flex-col items-center relative z-10 will-change-transform"
      >
        {/* Hero Headline */}
        <motion.div variants={itemVariants} className="my-2 relative">
          <motion.div
            aria-hidden="true"
            className="absolute -inset-8 rounded-full pointer-events-none opacity-45 blur-3xl"
            animate={{
              scale: [0.95, 1.08, 0.95],
              opacity: [0.35, 0.55, 0.35],
            }}
            transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              background:
                'radial-gradient(circle, rgba(255,209,89,0.35) 0%, rgba(236,72,153,0.28) 50%, transparent 75%)',
            }}
          />
          <h1 className="relative font-orbitron font-black text-5xl sm:text-7xl md:text-8xl tracking-tight leading-none">
            <motion.span
              whileHover={{ scale: 1.06, rotate: -1 }}
              transition={{ type: 'spring', stiffness: 360, damping: 18 }}
              className="gold-gradient-text inline-block"
            >
              MRTC
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.06, rotate: 1 }}
              transition={{ type: 'spring', stiffness: 360, damping: 18 }}
              className="rainbow-gradient-text inline-block ml-2 sm:ml-4"
            >
              BUILDS
            </motion.span>
          </h1>
        </motion.div>

        <motion.h2
          variants={itemVariants}
          className="font-orbitron font-bold text-lg sm:text-2xl text-slate-200 mt-4 tracking-wider uppercase text-balance"
        >
          The World&apos;s First <span className="text-gold-400">Neuro-Adaptive</span> Cognitive Co-Pilot
        </motion.h2>

        <motion.p
          variants={itemVariants}
          className="font-sans font-light text-slate-300 text-sm sm:text-base md:text-lg max-w-2xl mt-4 tracking-wide leading-relaxed"
        >
          Harness the power of your divergent mind. We pair precise gold-standard executive function algorithms with
          radiant, non-linear creative brainstorming to turn ADHD into your ultimate superpower.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="mt-7 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <motion.button
            type="button"
            onClick={(e) => handleActionClick(e, 2, '#ffd159')}
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="btn-glow-pulse w-full sm:w-auto px-8 py-3.5 rounded-xl font-orbitron text-xs sm:text-sm font-bold tracking-widest uppercase bg-gradient-to-r from-gold-400 via-amber-500 to-gold-600 hover:from-gold-300 hover:to-amber-400 text-space-950 shadow-lg shadow-gold-500/40 flex items-center justify-center space-x-2 whitespace-nowrap cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
          >
            <span>TEST THE MODES</span>
            <ArrowRight className="w-4 h-4 text-space-950" aria-hidden="true" />
          </motion.button>

          <motion.button
            type="button"
            onClick={(e) => handleActionClick(e, 4, '#ec4899')}
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="btn-glow-pulse w-full sm:w-auto px-8 py-3.5 rounded-xl font-orbitron text-xs sm:text-sm font-semibold tracking-widest uppercase bg-space-900/80 hover:bg-space-850 text-slate-100 border border-purple-500/40 hover:border-chroma-magenta shadow-md rainbow-border-pulse flex items-center justify-center whitespace-nowrap cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-chroma-magenta"
          >
            JOIN THE WAITLIST
          </motion.button>
        </motion.div>

        {/* Live Metric Highlights on Horizontal Foreground Parallax Plane */}
        <motion.div
          variants={itemVariants}
          style={{ x: kpiLayerX }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-8 w-full max-w-3xl pt-5 border-t border-slate-800/80 will-change-transform"
        >
          {KPI_CARDS.map((kpi) => (
            <TiltCard
              key={kpi.label}
              variant="gold"
              tiltMax={8}
              onClick={(e: React.MouseEvent<HTMLDivElement>) => {
                const rect = e.currentTarget.getBoundingClientRect();
                dispatchParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 16, kpi.burstColor);
              }}
              className={`p-3 sm:p-3.5 rounded-xl text-center cursor-pointer ${kpi.borderClass}`}
            >
              <div className={`${kpi.valueClass} font-orbitron font-bold text-xl md:text-2xl tabular-nums`}>
                {kpi.value}
              </div>
              <div className="text-[10px] md:text-xs font-rajdhani tracking-widest text-slate-300 uppercase mt-0.5">
                {kpi.label}
              </div>
            </TiltCard>
          ))}
        </motion.div>

        {/* Horizontal Swipe Cue */}
        <motion.div variants={itemVariants} className="mt-7">
          <motion.button
            type="button"
            onClick={(e) => handleActionClick(e, 1, '#00e5ff')}
            animate={{ x: [0, 6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            className="inline-flex items-center space-x-2 text-xs font-rajdhani tracking-[0.25em] uppercase text-slate-400 hover:text-gold-300 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 rounded-full px-3 py-1.5"
          >
            <span>Swipe Horizontal to Explore</span>
            <ArrowRight className="w-3.5 h-3.5 text-gold-400" aria-hidden="true" />
          </motion.button>
        </motion.div>
      </motion.div>
    </motion.section>
  );
}
