import React from 'react';
import { motion } from 'motion/react';
import { Cpu, FlaskConical } from 'lucide-react';
import { TiltCard } from '../TiltCard';
import { dispatchParticleBurst } from '../NeuralParticleField';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12 },
  },
};

const leftCardVariants = {
  hidden: { opacity: 0, x: -36, scale: 0.96 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
  },
};

const rightCardVariants = {
  hidden: { opacity: 0, x: 36, scale: 0.96 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const },
  },
};

export function DualHemisphereSlide() {
  return (
    <motion.section
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      aria-label="The Dual-Hemisphere System"
      className="w-full h-full flex flex-col items-center px-11 sm:px-16 relative py-6 overflow-y-auto no-scrollbar"
    >
      <div className="max-w-6xl w-full mx-auto my-auto">
        <motion.div
          initial={{ opacity: 0, y: -14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="text-center md:text-left mb-6"
        >
          <span className="text-xs font-rajdhani tracking-[0.3em] uppercase text-gold-400">
            Section 02 · Neural Symmetry
          </span>
          <h3 className="font-orbitron text-2xl md:text-4xl font-extrabold text-white mt-1">
            THE DUAL-HEMISPHERE SYSTEM
          </h3>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Left Card: Golden Logic Circuit */}
          <motion.div variants={leftCardVariants} className="flex">
            <TiltCard
              variant="gold"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                dispatchParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 22, '#ffd159');
              }}
              className="w-full p-6 md:p-8 rounded-2xl border-2 border-gold-400/40 hover:border-gold-300 relative group flex flex-col justify-between cursor-pointer"
            >
              <div className="text-right mb-2 sm:mb-0 sm:absolute sm:top-5 sm:right-6 font-rajdhani text-xs tracking-widest text-gold-400">
                LEFT · EXECUTIVE LOGIC
              </div>

              <div>
                <motion.div
                  whileHover={{ rotate: 8, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                  className="w-14 h-14 rounded-2xl bg-gold-500/10 border border-gold-400/40 flex items-center justify-center text-gold-400 mb-5 gold-glow"
                >
                  <Cpu className="w-7 h-7" aria-hidden="true" />
                </motion.div>

                <h4 className="font-orbitron font-bold text-2xl text-white group-hover:text-gold-300 transition-colors">
                  Golden Scaffold &amp; Task Deconstruction
                </h4>

                <p className="font-sans text-sm text-slate-300 mt-3 leading-relaxed">
                  Overcomes executive dysfunction and task intimidation. It instantaneously decomposes daunting projects
                  into tiny, frictionless micro-steps with ambient pacing timers and visual dopamine checkpoints.
                </p>

                <ul className="mt-4 space-y-2 text-xs font-rajdhani tracking-wider text-slate-300">
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-400 shrink-0" />
                    <span>Micro-Chunking Engine: 5-minute atomic wins</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-chroma-cyan shrink-0" />
                    <span>Working Memory Offloader: zero context loss</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-gold-400 shrink-0" />
                    <span>Dynamic Time-Blindness Correction</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-gold-400/20 flex justify-between items-center text-xs font-rajdhani tracking-wider text-gold-400">
                <span>STATE: STRUCTURED</span>
                <span className="text-slate-300 tabular-nums">CALCULATED CADENCE · 100%</span>
              </div>
            </TiltCard>
          </motion.div>

          {/* Right Card: Chromatic Rainbow Flow */}
          <motion.div variants={rightCardVariants} className="flex">
            <TiltCard
              variant="rainbow"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                dispatchParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 22, '#ec4899');
              }}
              className="w-full p-6 md:p-8 rounded-2xl border-2 border-chroma-magenta/40 hover:border-chroma-magenta relative group flex flex-col justify-between cursor-pointer"
            >
              <div className="text-right mb-2 sm:mb-0 sm:absolute sm:top-5 sm:right-6 font-rajdhani text-xs tracking-widest text-chroma-magenta">
                RIGHT · DIVERGENT FLOW
              </div>

              <div>
                <motion.div
                  whileHover={{ rotate: -8, scale: 1.1 }}
                  transition={{ type: 'spring', stiffness: 320, damping: 18 }}
                  className="w-14 h-14 rounded-2xl bg-pink-500/10 border border-chroma-magenta/40 flex items-center justify-center text-chroma-magenta mb-5"
                  style={{ boxShadow: '0 0 20px rgba(236,72,153,0.4)' }}
                >
                  <FlaskConical className="w-7 h-7" aria-hidden="true" />
                </motion.div>

                <h4 className="font-orbitron font-bold text-2xl text-white group-hover:text-chroma-magenta transition-colors">
                  Vibrant Ideation &amp; Hyperfocus Harbor
                </h4>

                <p className="font-sans text-sm text-slate-300 mt-3 leading-relaxed">
                  Celebrates non-linear thinking. Instead of forcing rigid spreadsheets, the right hemisphere lets ideas
                  swirl naturally, capturing lightning bolts of inspiration and connecting distant dots seamlessly.
                </p>

                <ul className="mt-4 space-y-2 text-xs font-rajdhani tracking-wider text-slate-300">
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-chroma-purple shrink-0" />
                    <span>Multidimensional Idea Mapping &amp; Synapse Trails</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-chroma-magenta shrink-0" />
                    <span>Hyperfocus Flow State Guardian</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-chroma-lime shrink-0" />
                    <span>Dopamine-Rich Gamified Milestones</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-4 border-t border-purple-500/20 flex justify-between items-center text-xs font-rajdhani tracking-wider text-chroma-magenta">
                <span>STATE: EXPLORATORY</span>
                <span className="text-slate-300">CREATIVE VELOCITY · UNBOUNDED</span>
              </div>
            </TiltCard>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
