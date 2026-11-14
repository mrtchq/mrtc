export interface CognitiveModeSpec {
  id: 'task-anchor' | 'kaleidoscope-brain' | 'dopamine-pacer';
  tabLabel: string;
  protocolClass: string;
  name: string;
  desc: string;
  accentHex: string;
  metrics: [
    { label: string; valueText: string; percent: number; barClass: string; textClass: string },
    { label: string; valueText: string; percent: number; barClass: string; textClass: string },
    { label: string; valueText: string; percent: number; barClass: string; textClass: string },
  ];
}

export interface SynapseNodeSpec {
  id: string;
  label: string;
  status: string;
  telemetry: string;
  borderClass: string;
  textClass: string;
  colorHex: string;
  diagnosticLog: string;
}

export interface WaitlistFormValues {
  name: string;
  email: string;
  cognitiveStyle: string;
  focusFriction: string;
}

export interface WaitlistValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof WaitlistFormValues, string>>;
}

export const TOTAL_SLIDES = 5;

export const COGNITIVE_STYLES = [
  'Divergent Creative (High ideas, need task execution & scaffolding)',
  'Hyperfocus Specialist (Intense sprints, need graceful transitions & pacing)',
  'Executive Function Boost (Need decluttering, micro-steps & zero context loss)',
  'All-in-One Dual Hemisphere Synergy',
] as const;

export const MODES_DATA: CognitiveModeSpec[] = [
  {
    id: 'task-anchor',
    tabLabel: '1. TASK ANCHOR',
    protocolClass: 'COGNITIVE PROTOCOL // ALPHA',
    name: 'THE TASK ANCHOR',
    desc: 'Dissolves initiation friction. It automatically detects tab switching and drifting focus, gently whispering low-stress re-entry cues without shame or rigid alarms.',
    accentHex: '#ffd159',
    metrics: [
      {
        label: 'FRICTION DISSOLUTION',
        valueText: '96%',
        percent: 96,
        barClass: 'from-gold-500 to-amber-400',
        textClass: 'text-gold-400',
      },
      {
        label: 'DOPAMINE FEEDBACK SENSITIVITY',
        valueText: 'OPTIMAL (1.8x)',
        percent: 82,
        barClass: 'from-purple-500 via-pink-500 to-orange-400',
        textClass: 'text-chroma-magenta',
      },
      {
        label: 'COGNITIVE BANDWIDTH SAVINGS',
        valueText: '74% PRESERVED',
        percent: 74,
        barClass: 'from-cyan-400 to-emerald-400',
        textClass: 'text-chroma-lime',
      },
    ],
  },
  {
    id: 'kaleidoscope-brain',
    tabLabel: '2. KALEIDOSCOPE BRAIN',
    protocolClass: 'COGNITIVE PROTOCOL // BETA',
    name: 'KALEIDOSCOPE DIVERGENT BRAIN',
    desc: 'Captures rapid non-linear thought bursts. Mind-maps chaotic ideas in real time, connecting disparate sparks into coherent structured creative projects.',
    accentHex: '#ec4899',
    metrics: [
      {
        label: 'IDEA RETENTION RATE',
        valueText: '100%',
        percent: 100,
        barClass: 'from-gold-500 to-amber-400',
        textClass: 'text-gold-400',
      },
      {
        label: 'SYNAPSE MAPPING VELOCITY',
        valueText: '320 ms',
        percent: 94,
        barClass: 'from-purple-500 via-pink-500 to-orange-400',
        textClass: 'text-chroma-magenta',
      },
      {
        label: 'CREATIVE LATITUDE',
        valueText: 'UNBOUNDED',
        percent: 98,
        barClass: 'from-cyan-400 to-emerald-400',
        textClass: 'text-chroma-lime',
      },
    ],
  },
  {
    id: 'dopamine-pacer',
    tabLabel: '3. DOPAMINE PACER',
    protocolClass: 'COGNITIVE PROTOCOL // GAMMA',
    name: 'DOPAMINE PACER & BURNOUT SHIELD',
    desc: 'Harmonizes hyperfocus cycles with biological recovery. Automatically spaces rewarding micro-intervals to prevent crash-and-burn cycles after intense creative sessions.',
    accentHex: '#10b981',
    metrics: [
      {
        label: 'ENERGY EQUILIBRIUM',
        valueText: 'ZERO CRASH',
        percent: 92,
        barClass: 'from-gold-500 to-amber-400',
        textClass: 'text-gold-400',
      },
      {
        label: 'IDEAL HYPERFOCUS CYCLE',
        valueText: '45 MIN',
        percent: 75,
        barClass: 'from-purple-500 via-pink-500 to-orange-400',
        textClass: 'text-chroma-magenta',
      },
      {
        label: 'RESTORATION PACING',
        valueText: '100%',
        percent: 100,
        barClass: 'from-cyan-400 to-emerald-400',
        textClass: 'text-chroma-lime',
      },
    ],
  },
];

export const SYNAPSE_NODES: SynapseNodeSpec[] = [
  {
    id: 'focus-01',
    label: 'FOCUS-01',
    status: 'LOCKED',
    telemetry: 'STABILITY 99%',
    borderClass: 'border-gold-500/30 hover:border-gold-400',
    textClass: 'text-gold-400',
    colorHex: '#ffd159',
    diagnosticLog: '> [FOCUS-01] Prefrontal anchor locked at 99% stability. Drift guard armed.',
  },
  {
    id: 'synapse-b',
    label: 'SYNAPSE-B',
    status: 'PULSING',
    telemetry: 'LATENCY 0.1ms',
    borderClass: 'border-chroma-cyan/30 hover:border-chroma-cyan',
    textClass: 'text-chroma-cyan',
    colorHex: '#00e5ff',
    diagnosticLog: '> [SYNAPSE-B] Inter-hemispheric bridge pulsing at 0.1ms latency.',
  },
  {
    id: 'ideation',
    label: 'IDEATION',
    status: 'SWIRLING',
    telemetry: 'DIVERGENCE 10x',
    borderClass: 'border-purple-500/30 hover:border-purple-400',
    textClass: 'text-chroma-purple',
    colorHex: '#9333ea',
    diagnosticLog: '> [IDEATION] Divergent thought stream capturing 10x associative links.',
  },
  {
    id: 'dopamine',
    label: 'DOPAMINE',
    status: 'OPTIMAL',
    telemetry: 'REWARD CURVE',
    borderClass: 'border-pink-500/30 hover:border-pink-400',
    textClass: 'text-chroma-magenta',
    colorHex: '#ec4899',
    diagnosticLog: '> [DOPAMINE] Reward curve calibrated. Micro-win pacing steady.',
  },
  {
    id: 'exec-unit',
    label: 'EXEC-UNIT',
    status: 'ACTIVE',
    telemetry: 'CHUNKING: ON',
    borderClass: 'border-gold-500/30 hover:border-gold-400',
    textClass: 'text-gold-400',
    colorHex: '#f5b82e',
    diagnosticLog: '> [EXEC-UNIT] Complex tasks decomposed into 5-minute atomic steps.',
  },
  {
    id: 'flow-gate',
    label: 'FLOW-GATE',
    status: 'DEEP',
    telemetry: 'ZONE: 48 MIN',
    borderClass: 'border-orange-500/30 hover:border-orange-400',
    textClass: 'text-chroma-orange',
    colorHex: '#f97316',
    diagnosticLog: '> [FLOW-GATE] Deep hyperfocus harbor sustained for 48 consecutive minutes.',
  },
  {
    id: 'recharger',
    label: 'RECHARGER',
    status: 'READY',
    telemetry: 'NO BURNOUT',
    borderClass: 'border-emerald-500/30 hover:border-emerald-400',
    textClass: 'text-chroma-lime',
    colorHex: '#10b981',
    diagnosticLog: '> [RECHARGER] Cortisol threshold nominal. Zero burnout risk detected.',
  },
  {
    id: 'synchrony',
    label: 'SYNCHRONY',
    status: '100%',
    telemetry: 'COGNITIVE SYNC',
    borderClass: 'border-gold-500/30 hover:border-gold-400',
    textClass: 'text-gold-400',
    colorHex: '#ffe082',
    diagnosticLog: '> [SYNCHRONY] Bilateral EEG coherence verified at 100% harmonic lock.',
  },
];

export function wrapSlideIndex(index: number, total: number = TOTAL_SLIDES): number {
  if (total <= 0) return 0;
  return ((index % total) + total) % total;
}

export function formatSectorLabel(index: number, total: number = TOTAL_SLIDES): string {
  const safeIndex = wrapSlideIndex(index, total) + 1;
  const paddedIdx = String(safeIndex).padStart(2, '0');
  const paddedTotal = String(total).padStart(2, '0');
  return `SECTOR ${paddedIdx} / ${paddedTotal}`;
}

export function validateWaitlistForm(values: WaitlistFormValues): WaitlistValidationResult {
  const errors: Partial<Record<keyof WaitlistFormValues, string>> = {};
  const trimmedName = values.name.trim();
  const trimmedEmail = values.email.trim();
  const trimmedFriction = values.focusFriction.trim();

  if (trimmedName.length < 2) {
    errors.name = 'Please enter your name or alias (at least 2 characters).';
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmedEmail)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!values.cognitiveStyle.trim()) {
    errors.cognitiveStyle = 'Please select your primary cognitive style.';
  }

  if (trimmedFriction.length < 5) {
    errors.focusFriction = 'Please share a brief note on your daily focus friction.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function calculateParticlePoolBudget(width: number, height: number): {
  nodeCount: number;
  maxSparks: number;
  connectDistance: number;
  starCount: number;
  bokehCount: number;
} {
  const area = Math.max(320 * 480, width * height);
  const nodeCount = Math.max(14, Math.min(30, Math.floor(area / 45000)));
  const isCompact = width < 768;
  return {
    nodeCount,
    maxSparks: isCompact ? 60 : 100,
    connectDistance: isCompact ? 95 : 120,
    starCount: isCompact ? 80 : 140,
    bokehCount: isCompact ? 4 : 6,
  };
}

export interface PageSectionSpec {
  id: string;
  navLabel: string;
  sectorNumber: string;
}

export const PAGE_SECTIONS: PageSectionSpec[] = [
  { id: 'hero', navLabel: 'Overview', sectorNumber: '01' },
  { id: 'dual-hemisphere', navLabel: 'System', sectorNumber: '02' },
  { id: 'copilot-modes', navLabel: 'Modes', sectorNumber: '03' },
  { id: 'biometric-matrix', navLabel: 'Matrix', sectorNumber: '04' },
  { id: 'waitlist', navLabel: 'Access', sectorNumber: '05' },
];

export function clampSlideIndex(index: number, total: number = TOTAL_SLIDES): number {
  if (total <= 0) return 0;
  return Math.max(0, Math.min(total - 1, index));
}

export function getSlideIndexById(sectionId: string): number {
  const idx = PAGE_SECTIONS.findIndex((s) => s.id === sectionId);
  return idx >= 0 ? idx : 0;
}

export function resolveSwipeNavigation(
  deltaX: number,
  velocityX: number,
  currentIndex: number,
  total: number = TOTAL_SLIDES
): number {
  if (total <= 0) return 0;
  const distanceThreshold = 55;
  const velocityThreshold = 320;

  if (deltaX <= -distanceThreshold || velocityX <= -velocityThreshold) {
    return clampSlideIndex(currentIndex + 1, total);
  }
  if (deltaX >= distanceThreshold || velocityX >= velocityThreshold) {
    return clampSlideIndex(currentIndex - 1, total);
  }
  return clampSlideIndex(currentIndex, total);
}


