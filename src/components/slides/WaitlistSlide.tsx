import React, { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { CheckCircle2 } from 'lucide-react';
import {
  COGNITIVE_STYLES,
  validateWaitlistForm,
  type WaitlistFormValues,
} from '../../utils/cognitiveEngine';
import { synthAudio } from '../../utils/synthAudio';
import { dispatchParticleBurst } from '../NeuralParticleField';
import { TiltCard } from '../TiltCard';

const INITIAL_FORM: WaitlistFormValues = {
  name: '',
  email: '',
  cognitiveStyle: COGNITIVE_STYLES[0],
  focusFriction: '',
};

export function WaitlistSlide() {
  const [form, setForm] = useState<WaitlistFormValues>(INITIAL_FORM);
  const [errors, setErrors] = useState<Partial<Record<keyof WaitlistFormValues, string>>>({});
  const [submittedName, setSubmittedName] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validation = validateWaitlistForm(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      synthAudio.playBeep(260, 'sawtooth', 0.14, 0.03);
      return;
    }

    setErrors({});
    setSubmittedName(form.name.trim());
    synthAudio.playSuccessChime();

    const submitBtn = e.currentTarget.querySelector('button[type="submit"]');
    if (submitBtn) {
      const rect = submitBtn.getBoundingClientRect();
      dispatchParticleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 40, '#ffd159');
    }

    setForm(INITIAL_FORM);
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      aria-label="Request Early Access"
      className="w-full h-full flex flex-col items-center px-11 sm:px-16 relative py-6 overflow-y-auto no-scrollbar"
    >
      <div className="max-w-3xl w-full mx-auto my-auto">
        <div className="text-center mb-6">
          <span className="text-xs font-rajdhani tracking-[0.3em] uppercase text-gold-400">
            Section 05 · Cognitive Frontier
          </span>
          <h3 className="font-orbitron text-2xl md:text-4xl font-extrabold text-white mt-1">
            REQUEST EARLY ACCESS
          </h3>
          <p className="font-sans text-xs md:text-sm text-slate-300 mt-2">
            Join thousands of neurodivergent creators, engineers, and founders unlocking their full cognitive potential.
          </p>
        </div>

        <TiltCard
          variant="gold"
          tiltMax={3}
          className="p-6 md:p-8 rounded-2xl border border-gold-400/30 rainbow-border-pulse"
        >
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="waitlist-name"
                  className="block font-rajdhani text-xs font-semibold tracking-widest uppercase text-gold-300 mb-1"
                >
                  Your Name / Alias
                </label>
                <input
                  id="waitlist-name"
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Alex Hunter"
                  className="w-full bg-space-950/85 border border-slate-700 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-sans outline-none transition-colors"
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-rose-400 font-sans" role="alert">
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="waitlist-email"
                  className="block font-rajdhani text-xs font-semibold tracking-widest uppercase text-gold-300 mb-1"
                >
                  Email Address
                </label>
                <input
                  id="waitlist-email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="alex@neuroflow.io"
                  className="w-full bg-space-950/85 border border-slate-700 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-sans outline-none transition-colors"
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-rose-400 font-sans" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label
                htmlFor="waitlist-style"
                className="block font-rajdhani text-xs font-semibold tracking-widest uppercase text-gold-300 mb-1"
              >
                Your Primary Cognitive Style &amp; Goal
              </label>
              <select
                id="waitlist-style"
                value={form.cognitiveStyle}
                onChange={(e) => setForm((prev) => ({ ...prev, cognitiveStyle: e.target.value }))}
                className="w-full bg-space-950/85 border border-slate-700 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 rounded-lg px-3.5 py-2.5 text-sm text-slate-200 font-sans outline-none transition-colors"
              >
                {COGNITIVE_STYLES.map((style) => (
                  <option key={style} value={style}>
                    {style}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="waitlist-friction"
                className="block font-rajdhani text-xs font-semibold tracking-widest uppercase text-gold-300 mb-1"
              >
                What&apos;s your biggest daily focus friction?
              </label>
              <textarea
                id="waitlist-friction"
                rows={3}
                required
                value={form.focusFriction}
                onChange={(e) => setForm((prev) => ({ ...prev, focusFriction: e.target.value }))}
                placeholder="Starting tasks, staying on one tab, overwhelm when opening big projects..."
                className="w-full bg-space-950/85 border border-slate-700 focus:border-gold-400 focus:ring-1 focus:ring-gold-400 rounded-lg px-3.5 py-2.5 text-sm text-white placeholder-slate-500 font-sans outline-none transition-colors"
              />
              {errors.focusFriction && (
                <p className="mt-1 text-xs text-rose-400 font-sans" role="alert">
                  {errors.focusFriction}
                </p>
              )}
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-[11px] font-rajdhani text-slate-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-chroma-lime shrink-0" aria-hidden="true" />
                <span>ZERO-SPAM NEURO-ETHICAL PRIVACY GUARANTEE</span>
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                className="btn-glow-pulse w-full sm:w-auto px-8 py-3 rounded-xl font-orbitron text-xs font-bold tracking-widest uppercase bg-gradient-to-r from-gold-400 via-amber-500 to-chroma-magenta hover:opacity-95 text-space-950 shadow-lg shadow-gold-500/30 whitespace-nowrap cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-gold-300"
              >
                SECURE MY VIP ACCESS
              </motion.button>
            </div>
          </form>

          <AnimatePresence>
            {submittedName && (
              <motion.div
                role="status"
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                className="mt-4 p-4 rounded-xl bg-space-900 border border-gold-400 text-gold-300 text-sm font-sans flex items-center space-x-3"
              >
                <CheckCircle2 className="w-6 h-6 text-chroma-lime shrink-0" aria-hidden="true" />
                <div>
                  <div className="font-orbitron font-bold text-xs uppercase text-white">
                    VIP Invitation Confirmed for {submittedName}!
                  </div>
                  <div className="text-xs text-slate-300 mt-0.5">
                    Your spot on the Alpha Cohort is secured. Welcome to the future of neuro-adaptive cognition.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TiltCard>
      </div>
    </motion.section>
  );
}
