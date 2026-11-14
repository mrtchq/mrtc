import React from 'react';
import { motion, useTransform, type MotionValue } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { dispatchParticleBurst } from '../NeuralParticleField';

interface HeroSlideProps {
  isActive: boolean;
  onSelectSlide: (index: number) => void;
  parallaxProgress: MotionValue<number>;
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

export function HeroSlide({ isActive, onSelectSlide, parallaxProgress }: HeroSlideProps) {
  const bgOrbitX = useTransform(parallaxProgress, [0, 1], [0, 160]);
  const bgOrbitScale = useTransform(parallaxProgress, [0, 0.35], [1, 1.15]);
  const buttonsX = useTransform(parallaxProgress, [0, 1], [0, -60]);

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
      className="slide-section min-w-full w-full h-full overflow-y-auto no-scrollbar flex flex-col items-center justify-center px-5 sm:px-14 md:px-20 text-center relative py-6 sm:py-8"
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
        style={{ x: buttonsX }}
        className="my-auto max-w-4xl w-full mx-auto flex flex-col items-center justify-center relative z-10 will-change-transform"
      >
        <div
          aria-hidden="true"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[420px] h-[420px] rounded-full pointer-events-none opacity-40"
          style={{
            background:
              'radial-gradient(circle, rgba(255,209,89,0.22) 0%, rgba(236,72,153,0.14) 42%, transparent 70%)',
          }}
        />

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="relative flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto"
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
      </motion.div>
    </motion.section>
  );
}
