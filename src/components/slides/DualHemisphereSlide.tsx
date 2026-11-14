import React from 'react';
import { motion } from 'motion/react';
import { Cpu, FlaskConical } from 'lucide-react';
import { TiltCard } from '../TiltCard';
import { dispatchParticleBurst } from '../NeuralParticleField';

interface DualHemisphereSlideProps {
  isActive: boolean;
}

export function DualHemisphereSlide({ isActive }: DualHemisphereSlideProps) {
  return (
    <section
      id="dual-hemisphere"
      aria-label="The Dual-Hemisphere System"
      className="slide-section min-w-full w-full h-full overflow-y-auto no-scrollbar flex flex-col items-center px-5 sm:px-14 md:px-20 relative py-6 sm:py-8"
    >
      <div className="my-auto max-w-6xl w-full mx-auto">
        <motion.div
          initial={false}
          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0.72, y: 12 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
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
          <motion.div
            initial={false}
            animate={isActive ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0.65, x: -24, scale: 0.97 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="flex will-change-transform"
          >
            <TiltCard
              variant="gold"
              onClick={(e: React.MouseEvent<HTMLDivElement>) => {
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
          <motion.div
            initial={false}
            animate={isActive ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0.65, x: 24, scale: 0.97 }}
            transition={{ duration: 0.5, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="flex will-change-transform"
          >
            <TiltCard
              variant="rainbow"
              onClick={(e: React.MouseEvent<HTMLDivElement>) => {
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
    </section>
  );
}
