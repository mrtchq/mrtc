import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { TiltCard } from '../TiltCard';
import { dispatchParticleBurst } from '../NeuralParticleField';

interface HeroSlideProps {
  onJumpToSlide: (index: number) => void;
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
  hidden: { opacity: 0, y: 18 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function HeroSlide({ onJumpToSlide }: HeroSlideProps) {
  const handleCtaClick = (e: React.MouseEvent<HTMLButtonElement>, targetSlide: number, colorHex: string) => {
    const rect = e.currentTarget.getBoundingClientRect();
    dispatchParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 26, colorHex);
    onJumpToSlide(targetSlide);
  };

  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label="Hero Overview"
      className="w-full h-full flex flex-col items-center px-11 sm:px-16 md:px-20 text-center relative py-6 overflow-y-auto no-scrollbar"
    >
      <div className="max-w-4xl w-full mx-auto my-auto flex flex-col items-center">
        {/* Hero Headline mimicking Logo Typography with Framer Motion kinetic energy */}
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
          className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
        >
          <motion.button
            type="button"
            onClick={(e) => handleCtaClick(e, 2, '#ffd159')}
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="btn-glow-pulse w-full sm:w-auto px-8 py-3.5 rounded-xl font-orbitron text-xs sm:text-sm font-bold tracking-widest uppercase bg-gradient-to-r from-gold-400 via-amber-500 to-gold-600 hover:from-gold-300 hover:to-amber-400 text-space-950 shadow-lg shadow-gold-500/40 flex items-center justify-center space-x-2 whitespace-nowrap cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
          >
            <span>TEST THE MODES</span>
            <ArrowRight className="w-4 h-4 text-space-950" aria-hidden="true" />
          </motion.button>

          <motion.button
            type="button"
            onClick={(e) => handleCtaClick(e, 4, '#ec4899')}
            whileHover={{ y: -2, scale: 1.03 }}
            whileTap={{ scale: 0.96 }}
            className="btn-glow-pulse w-full sm:w-auto px-8 py-3.5 rounded-xl font-orbitron text-xs sm:text-sm font-semibold tracking-widest uppercase bg-space-900/80 hover:bg-space-850 text-slate-100 border border-purple-500/40 hover:border-chroma-magenta shadow-md rainbow-border-pulse whitespace-nowrap cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-chroma-magenta"
          >
            JOIN THE WAITLIST
          </motion.button>
        </motion.div>

        {/* Live Metric Highlights */}
        <motion.div
          variants={itemVariants}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10 w-full max-w-3xl pt-6 border-t border-slate-800/80"
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
              className={`p-3.5 rounded-xl text-center cursor-pointer ${kpi.borderClass}`}
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
      </div>
    </motion.section>
  );
}
