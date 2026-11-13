import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { SYNAPSE_NODES, type SynapseNodeSpec } from '../../utils/cognitiveEngine';
import { synthAudio } from '../../utils/synthAudio';
import { dispatchParticleBurst } from '../NeuralParticleField';
import { TiltCard } from '../TiltCard';

const DEFAULT_LOGS = [
  '> [NEURAL-ENGINE] Left hemisphere scaffold verified. Zero task-paralysis detected.',
  '> [HYPERFOCUS] Right hemisphere flow state sustained across 4 creative vectors.',
  '> [BALANCE] Dopamine depletion neutralized. Cognitive energy remaining: 92%.',
];

export function BioMetricMatrixSlide() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>(DEFAULT_LOGS);

  const handleNodeClick = (e: React.MouseEvent<HTMLButtonElement>, node: SynapseNodeSpec) => {
    const rect = e.currentTarget.getBoundingClientRect();
    dispatchParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 18, node.colorHex);
    synthAudio.playBeep(700, 'sine', 0.12, 0.045);
    setSelectedNodeId(node.id);
    setLogs((prev) => [node.diagnosticLog, prev[0], prev[1]].slice(0, 3));
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Neural Bio-Metric Matrix"
      className="w-full h-full flex flex-col items-center px-11 sm:px-16 relative py-6 overflow-y-auto no-scrollbar"
    >
      <div className="max-w-6xl w-full mx-auto my-auto">
        <div className="text-center md:text-left mb-6">
          <span className="text-xs font-rajdhani tracking-[0.3em] uppercase text-chroma-magenta">
            Section 04 · Synaptic Telemetry
          </span>
          <h3 className="font-orbitron text-2xl md:text-4xl font-extrabold text-white mt-1">
            NEURAL BIO-METRIC MATRIX
          </h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Interactive Synapse Matrix */}
          <TiltCard
            variant="gold"
            tiltMax={4}
            className="lg:col-span-7 p-6 rounded-2xl border border-gold-400/20 flex flex-col justify-between"
          >
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="font-orbitron text-xs text-gold-400 tracking-wider">LIVE SYNAPSE NODES</span>
              <span className="text-[11px] font-rajdhani tracking-widest text-chroma-lime flex items-center gap-1.5">
                <motion.span
                  aria-hidden="true"
                  className="w-2 h-2 rounded-full bg-chroma-lime"
                  animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <span>8 NEURO-PATHWAYS MAPPED</span>
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-6 font-rajdhani">
              {SYNAPSE_NODES.map((node, idx) => {
                const isSelected = selectedNodeId === node.id;
                return (
                  <motion.button
                    key={node.id}
                    type="button"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.04, duration: 0.35 }}
                    whileHover={{ y: -3, scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => handleNodeClick(e, node)}
                    aria-pressed={isSelected}
                    className={`p-3 rounded-lg bg-space-950/75 border transition-colors text-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 ${
                      isSelected ? 'border-white shadow-[0_0_18px_rgba(255,209,89,0.35)]' : node.borderClass
                    }`}
                  >
                    <div className="text-[10px] text-slate-400">{node.label}</div>
                    <div className={`${node.textClass} font-bold text-sm`}>{node.status}</div>
                    <div className="text-[9px] text-slate-400 tabular-nums">{node.telemetry}</div>
                  </motion.button>
                );
              })}
            </div>

            {/* Live Terminal Stream */}
            <div
              data-testid="synapse-terminal"
              className="bg-space-950 p-3 rounded-lg font-mono text-[11px] text-slate-300 border border-slate-800 space-y-1 overflow-hidden"
            >
              <AnimatePresence mode="popLayout" initial={false}>
                {logs.map((line, idx) => (
                  <motion.div
                    key={`${idx}-${line}`}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 12 }}
                    transition={{ duration: 0.25 }}
                    className={
                      idx === 0 ? 'text-gold-400' : idx === 1 ? 'text-chroma-magenta' : 'text-chroma-lime'
                    }
                  >
                    {line}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </TiltCard>

          {/* Features & Guarantees */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
            <TiltCard variant="gold" tiltMax={6} className="p-6 rounded-2xl border border-gold-400/20">
              <h4 className="font-orbitron text-base font-bold text-white mb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-gold-400 rounded-full shrink-0" />
                <span>Zero-Shame Prompting</span>
              </h4>
              <p className="font-sans text-xs md:text-sm text-slate-300 leading-relaxed">
                Traditional productivity tools trigger guilt with red badges. Our AI uses positive neuro-dopaminergic
                reinforcement, turning restarts into effortless momentum.
              </p>
            </TiltCard>

            <TiltCard variant="rainbow" tiltMax={6} className="p-6 rounded-2xl border border-chroma-magenta/20">
              <h4 className="font-orbitron text-base font-bold text-white mb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-chroma-magenta rounded-full shrink-0" />
                <span>Multi-Track Divergent Storage</span>
              </h4>
              <p className="font-sans text-xs md:text-sm text-slate-300 leading-relaxed">
                Never lose a breakthrough thought while working on another task. Speak or dump thoughts raw—the AI
                catalogs, tags, and resurfaces them at the exact right moment.
              </p>
            </TiltCard>

            <TiltCard variant="gold" tiltMax={6} className="p-6 rounded-2xl border border-chroma-cyan/20">
              <h4 className="font-orbitron text-base font-bold text-white mb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-chroma-cyan rounded-full shrink-0" />
                <span>Circadian Rhythm Adaptation</span>
              </h4>
              <p className="font-sans text-xs md:text-sm text-slate-300 leading-relaxed">
                Whether you peak at 2 AM or mid-afternoon, our models dynamically tune their output complexity to match
                your current brainwave and focus bandwidth.
              </p>
            </TiltCard>
          </div>
        </div>
      </div>
    </motion.section>
  );
}
