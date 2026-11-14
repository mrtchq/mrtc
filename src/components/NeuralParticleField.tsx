import React, { useEffect, useRef } from 'react';
import { motion, type MotionValue } from 'motion/react';
import { calculateParticlePoolBudget } from '../utils/cognitiveEngine';

interface BrandColor {
  r: number;
  g: number;
  b: number;
  hex: string;
}

const BRAND_COLORS: BrandColor[] = [
  { r: 255, g: 209, b: 89, hex: '#ffd159' },
  { r: 0, g: 229, b: 255, hex: '#00e5ff' },
  { r: 236, g: 72, b: 153, hex: '#ec4899' },
  { r: 168, g: 85, b: 247, hex: '#a855f7' },
  { r: 16, g: 185, b: 129, hex: '#10b981' },
  { r: 249, g: 115, b: 22, hex: '#f97316' },
];

const STAR_PALETTES: string[][] = [
  ['#ffffff', '#fff9c4', '#ffd54f'],
  ['#ffffff', '#ffd159', '#00e5ff', '#ec4899'],
  ['#ffd159', '#9333ea', '#ec4899', '#00e5ff', '#10b981'],
];

interface StarParticle {
  x: number;
  y: number;
  depth: 0 | 1 | 2;
  size: number;
  speedY: number;
  color: string;
  alpha: number;
  twinklePhase: number;
  twinkleSpeed: number;
}

interface BokehOrb {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
  color: BrandColor;
}

interface SynapticNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: BrandColor;
  phase: number;
  pulseSpeed: number;
}

interface ActionPotential {
  from: SynapticNode;
  to: SynapticNode;
  progress: number;
  speed: number;
  color: BrandColor;
}

interface ShockwaveRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  opacity: number;
  color: BrandColor;
}

interface CenterAudioRipple {
  elapsedMs: number;
  delayMs: number;
  durationMs: number;
  maxRadius: number;
  baseAlpha: number;
  lineWidth: number;
  color: BrandColor;
}

interface CanvasSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  decay: number;
  color: BrandColor;
}

function createGlowSprite(color: BrandColor): HTMLCanvasElement {
  const sprite = document.createElement('canvas');
  sprite.width = 32;
  sprite.height = 32;
  const sctx = sprite.getContext('2d');
  if (sctx) {
    const grad = sctx.createRadialGradient(16, 16, 0, 16, 16, 16);
    grad.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, 0.92)`);
    grad.addColorStop(0.35, `rgba(${color.r}, ${color.g}, ${color.b}, 0.38)`);
    grad.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 32, 32);
  }
  return sprite;
}

function createCursorAuraSprite(): HTMLCanvasElement {
  const sprite = document.createElement('canvas');
  sprite.width = 192;
  sprite.height = 192;
  const sctx = sprite.getContext('2d');
  if (sctx) {
    const grad = sctx.createRadialGradient(96, 96, 0, 96, 96, 96);
    grad.addColorStop(0, 'rgba(245, 184, 46, 0.18)');
    grad.addColorStop(0.38, 'rgba(236, 72, 153, 0.1)');
    grad.addColorStop(0.7, 'rgba(0, 229, 255, 0.05)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    sctx.fillStyle = grad;
    sctx.fillRect(0, 0, 192, 192);
  }
  return sprite;
}

export function dispatchParticleBurst(x: number, y: number, count = 24, colorHex?: string) {
  window.dispatchEvent(
    new CustomEvent('mrtc:burst', {
      detail: { x, y, count, colorHex },
    })
  );
}

export function dispatchCenterRipple(kind: 'speaking' | 'listening_finished') {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent('mrtc:audio-ripple', {
      detail: { kind },
    })
  );
}

interface NeuralParticleFieldProps {
  isWarping: boolean;
  parallaxProgress: MotionValue<number>;
}

export function NeuralParticleField({ isWarping, parallaxProgress }: NeuralParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const warpTargetRef = useRef(1);

  useEffect(() => {
    if (isWarping) {
      warpTargetRef.current = 12;
      const timer = window.setTimeout(() => {
        warpTargetRef.current = 1;
      }, 380);
      return () => window.clearTimeout(timer);
    }
  }, [isWarping]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Pre-render tiny glow textures once to avoid per-frame shadowBlur / multi-arc passes
    const glowSprites = new Map<string, HTMLCanvasElement>();
    for (const color of BRAND_COLORS) {
      glowSprites.set(color.hex, createGlowSprite(color));
    }
    const cursorAuraSprite = createCursorAuraSprite();

    let width = window.innerWidth;
    let height = window.innerHeight;
    let budget = calculateParticlePoolBudget(width, height);
    let nodes: SynapticNode[] = [];
    let stars: StarParticle[] = [];
    let bokehOrbs: BokehOrb[] = [];

    const buildPools = () => {
      stars = Array.from({ length: budget.starCount }, (_, idx) => {
        const depth = (idx % 3) as 0 | 1 | 2;
        const palette = STAR_PALETTES[depth];
        return {
          x: Math.random() * width,
          y: Math.random() * height,
          depth,
          size: depth === 0 ? 1.1 : depth === 1 ? 1.7 : 2.3,
          speedY: depth === 0 ? 0.14 : depth === 1 ? 0.26 : 0.42,
          color: palette[Math.floor(Math.random() * palette.length)],
          alpha: depth === 0 ? 0.45 + Math.random() * 0.3 : depth === 1 ? 0.65 + Math.random() * 0.25 : 0.8 + Math.random() * 0.2,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.02 + Math.random() * 0.03,
        };
      });

      bokehOrbs = Array.from({ length: budget.bokehCount }, (_, idx) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.16,
        vy: -0.12 - Math.random() * 0.18,
        radius: 14 + (idx % 3) * 8,
        phase: Math.random() * Math.PI * 2,
        color: BRAND_COLORS[idx % BRAND_COLORS.length],
      }));

      nodes = Array.from({ length: budget.nodeCount }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.55,
        vy: (Math.random() - 0.5) * 0.55,
        radius: Math.random() * 1.6 + 1.1,
        color: BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)],
        phase: Math.random() * Math.PI * 2,
        pulseSpeed: 0.02 + Math.random() * 0.025,
      }));
    };

    const resize = () => {
      const prevWidth = width || window.innerWidth;
      const prevHeight = height || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      budget = calculateParticlePoolBudget(width, height);

      if (nodes.length === 0) {
        buildPools();
      } else if (prevWidth > 0 && prevHeight > 0) {
        const scaleX = width / prevWidth;
        const scaleY = height / prevHeight;
        for (let i = 0; i < nodes.length; i++) {
          nodes[i].x = Math.min(width, Math.max(0, nodes[i].x * scaleX));
          nodes[i].y = Math.min(height, Math.max(0, nodes[i].y * scaleY));
        }
        for (let i = 0; i < stars.length; i++) {
          stars[i].x = Math.min(width, Math.max(0, stars[i].x * scaleX));
          stars[i].y = Math.min(height, Math.max(0, stars[i].y * scaleY));
        }
        for (let i = 0; i < bokehOrbs.length; i++) {
          bokehOrbs[i].x = Math.min(width, Math.max(0, bokehOrbs[i].x * scaleX));
          bokehOrbs[i].y = Math.min(height, Math.max(0, bokehOrbs[i].y * scaleY));
        }
      }
    };
    resize();

    const actionPotentials: ActionPotential[] = [];
    const ripples: ShockwaveRipple[] = [];
    const centerAudioRipples: CenterAudioRipple[] = [];
    const sparks: CanvasSpark[] = [];

    const mouse = { x: -1000, y: -1000, smoothX: -1000, smoothY: -1000, active: false };
    let warpMultiplier = 1;
    let lastTrailTime = 0;
    let lastFrameTime = performance.now();
    let audioRippleSeq = 0;

    const spawnCenterAudioRipple = (kind: 'speaking' | 'listening_finished') => {
      audioRippleSeq += 1;
      canvas.dataset.audioRippleSeq = String(audioRippleSeq);
      canvas.dataset.lastAudioRipple = kind;

      if (prefersReducedMotion) return;

      // Cap active ripples to keep frame time steady
      while (centerAudioRipples.length >= 6) {
        centerAudioRipples.shift();
      }

      const maxRadius = Math.max(180, Math.min(width, height) * 0.44);
      const goldColor = BRAND_COLORS[0]; // #ffd159
      const cyanColor = BRAND_COLORS[1]; // #00e5ff
      const emeraldColor = BRAND_COLORS[4]; // #10b981

      if (kind === 'speaking') {
        centerAudioRipples.push(
          {
            elapsedMs: 0,
            delayMs: 0,
            durationMs: 1400,
            maxRadius,
            baseAlpha: 0.34,
            lineWidth: 1.6,
            color: goldColor,
          },
          {
            elapsedMs: 0,
            delayMs: 180,
            durationMs: 1550,
            maxRadius: maxRadius * 0.86,
            baseAlpha: 0.22,
            lineWidth: 1.1,
            color: cyanColor,
          }
        );
      } else {
        centerAudioRipples.push(
          {
            elapsedMs: 0,
            delayMs: 0,
            durationMs: 1250,
            maxRadius: maxRadius * 0.9,
            baseAlpha: 0.3,
            lineWidth: 1.4,
            color: emeraldColor,
          },
          {
            elapsedMs: 0,
            delayMs: 160,
            durationMs: 1400,
            maxRadius: maxRadius * 0.74,
            baseAlpha: 0.18,
            lineWidth: 1.0,
            color: cyanColor,
          }
        );
      }
    };

    const spawnBurst = (x: number, y: number, count: number, colorHex?: string) => {
      const matchedColor = colorHex ? BRAND_COLORS.find((c) => c.hex === colorHex) : undefined;
      const clampedCount = Math.min(count, 24);
      for (let i = 0; i < clampedCount; i++) {
        if (sparks.length >= budget.maxSparks) {
          sparks.shift();
        }
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4.2 + 1.4;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 2.4 + 1.6,
          life: 1,
          decay: 0.025 + Math.random() * 0.02,
          color: matchedColor ?? BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)],
        });
      }
      if (ripples.length < 6) {
        ripples.push({
          x,
          y,
          radius: 8,
          maxRadius: 190,
          opacity: 0.72,
          color: matchedColor ?? BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)],
        });
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!mouse.active) {
        mouse.smoothX = e.clientX;
        mouse.smoothY = e.clientY;
      }
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;

      if (prefersReducedMotion) return;
      const now = performance.now();
      if (now - lastTrailTime > 75 && sparks.length < budget.maxSparks) {
        lastTrailTime = now;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.1 + 0.35;
        sparks.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 1.8 + 1.2,
          life: 0.8,
          decay: 0.036,
          color: BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)],
        });
      }
    };

    const onMouseLeave = () => {
      mouse.active = false;
    };

    const onClick = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      spawnBurst(e.clientX, e.clientY, 14);
    };

    const onCustomBurst = (e: Event) => {
      if (prefersReducedMotion) return;
      const detail = (e as CustomEvent<{ x: number; y: number; count?: number; colorHex?: string }>).detail;
      if (detail) {
        spawnBurst(detail.x, detail.y, detail.count ?? 20, detail.colorHex);
      }
    };

    const onAudioRipple = (e: Event) => {
      const detail = (e as CustomEvent<{ kind?: 'speaking' | 'listening_finished' }>).detail;
      if (detail?.kind) {
        spawnCenterAudioRipple(detail.kind);
      }
    };

    let rafId = 0;
    let isPaused = document.hidden;

    const renderFrame = (now: number) => {
      const elapsedMs = Math.min(48, Math.max(4, now - lastFrameTime));
      // Normalized delta (1 = 60fps ~ 16.67ms), clamped so tab switches never jump
      const dtScale = Math.min(2.2, Math.max(0.4, elapsedMs / 16.67));
      lastFrameTime = now;

      ctx.clearRect(0, 0, width, height);

      const progress = parallaxProgress.get();

      if (!prefersReducedMotion) {
        warpMultiplier += (warpTargetRef.current - warpMultiplier) * 0.1 * dtScale;
        if (Math.abs(warpMultiplier - 1) < 0.04 && warpTargetRef.current === 1) {
          warpMultiplier = 1;
        }
      }

      // 1. Multi-depth Parallax Starfield with subtle twinkle pulse
      const depthSpans = [70, 145, 230];
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        if (!prefersReducedMotion) {
          s.y -= s.speedY * warpMultiplier * dtScale;
          s.twinklePhase += s.twinkleSpeed * dtScale;
          if (s.y < -8) {
            s.y = height + 4;
            s.x = Math.random() * width;
          }
        }
        const shiftedX = s.x - progress * depthSpans[s.depth];
        const drawX = ((shiftedX % width) + width) % width;
        const twinkle = 0.68 + 0.32 * Math.sin(s.twinklePhase);
        ctx.globalAlpha = s.alpha * twinkle;
        ctx.fillStyle = s.color;
        if (warpMultiplier > 2.2) {
          const streakLen = s.size + warpMultiplier * (s.depth + 1) * 0.85;
          ctx.fillRect(drawX, s.y, s.size, streakLen);
        } else {
          ctx.fillRect(drawX, s.y, s.size, s.size);
        }
      }
      ctx.globalAlpha = 1;

      // 2. Soft Drifting Bokeh Embers with subtle breath pulse
      for (let b = 0; b < bokehOrbs.length; b++) {
        const orb = bokehOrbs[b];
        if (!prefersReducedMotion) {
          orb.x += orb.vx * dtScale;
          orb.y += orb.vy * dtScale;
          orb.phase += 0.02 * dtScale;
          if (orb.y < -orb.radius * 2) {
            orb.y = height + orb.radius * 2;
            orb.x = Math.random() * width;
          }
          if (orb.x < -orb.radius * 2) orb.x = width + orb.radius * 2;
          if (orb.x > width + orb.radius * 2) orb.x = -orb.radius * 2;
        }
        const sprite = glowSprites.get(orb.color.hex);
        if (sprite) {
          const orbX = ((orb.x - progress * 90) % width + width) % width;
          const wave = Math.sin(orb.phase);
          const pulseRadius = orb.radius * (1 + 0.12 * wave);
          ctx.globalAlpha = 0.22 + 0.14 * wave;
          ctx.drawImage(sprite, orbX - pulseRadius, orb.y - pulseRadius, pulseRadius * 2, pulseRadius * 2);
        }
      }
      ctx.globalAlpha = 1;

      // 3. Smoothed Cursor Radial Aura (canvas-drawn, zero DOM blur)
      if (mouse.active && width >= 640) {
        mouse.smoothX += (mouse.x - mouse.smoothX) * 0.22;
        mouse.smoothY += (mouse.y - mouse.smoothY) * 0.22;
        ctx.drawImage(cursorAuraSprite, mouse.smoothX - 96, mouse.smoothY - 96, 192, 192);
      }

      // 4. Shockwave Ripples
      for (let r = ripples.length - 1; r >= 0; r--) {
        const rip = ripples[r];
        rip.radius += 5.5 * dtScale;
        rip.opacity -= 0.025 * dtScale;
        if (rip.opacity <= 0 || rip.radius >= rip.maxRadius) {
          ripples.splice(r, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rip.color.r}, ${rip.color.g}, ${rip.color.b}, ${rip.opacity})`;
        ctx.lineWidth = 1.8;
        ctx.stroke();
      }

      // 4b. Subtle Center-Radiating Audio Activity Ripples
      const centerX = width * 0.5;
      const centerY = height * 0.5;
      for (let ar = centerAudioRipples.length - 1; ar >= 0; ar--) {
        const rip = centerAudioRipples[ar];
        rip.elapsedMs += elapsedMs;
        if (rip.elapsedMs < rip.delayMs) {
          continue;
        }
        const activeMs = rip.elapsedMs - rip.delayMs;
        const t = activeMs / rip.durationMs;
        if (t >= 1) {
          centerAudioRipples.splice(ar, 1);
          continue;
        }

        const eased = 1 - Math.pow(1 - t, 3);
        const radius = 28 + (rip.maxRadius - 28) * eased;
        const fadeIn = t < 0.14 ? t / 0.14 : 1;
        const alpha = rip.baseAlpha * fadeIn * (1 - t);

        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rip.color.r}, ${rip.color.g}, ${rip.color.b}, ${alpha.toFixed(3)})`;
        ctx.lineWidth = Math.max(0.6, rip.lineWidth * (1 - t * 0.35));
        ctx.stroke();
      }

      // 5. Synaptic Nodes & Filaments
      const connectDist = budget.connectDistance;
      const connectDistSq = connectDist * connectDist;
      const mouseDist = 170;
      const mouseDistSq = mouseDist * mouseDist;

      ctx.lineWidth = 0.85;
      for (let i = 0; i < nodes.length; i++) {
        const p = nodes[i];
        if (!prefersReducedMotion) {
          p.x += p.vx * warpMultiplier * dtScale;
          p.y += p.vy * warpMultiplier * dtScale;
          p.phase += p.pulseSpeed * dtScale;
        }

        if (p.x < 0) {
          p.x = 0;
          p.vx *= -1;
        } else if (p.x > width) {
          p.x = width;
          p.vx *= -1;
        }
        if (p.y < 0) {
          p.y = 0;
          p.vy *= -1;
        } else if (p.y > height) {
          p.y = height;
          p.vy *= -1;
        }

        if (mouse.active && !prefersReducedMotion) {
          const mdx = mouse.x - p.x;
          const mdy = mouse.y - p.y;
          const mDistSq = mdx * mdx + mdy * mdy;
          if (mDistSq < mouseDistSq && mDistSq > 1) {
            const mDist = Math.sqrt(mDistSq);
            p.x += (mdx / mDist) * 0.35 * dtScale;
            p.y += (mdy / mDist) * 0.35 * dtScale;
            const alpha = (1 - mDist / mouseDist) * 0.65;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
            ctx.stroke();
          }
        }

      const networkBreath = prefersReducedMotion ? 1 : 0.8 + 0.2 * Math.sin(now * 0.0018);
      for (let j = i + 1; j < nodes.length; j++) {
          const p2 = nodes[j];
          const dx = p2.x - p.x;
          const dy = p2.y - p.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < connectDistSq) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / connectDist) * 0.32 * networkBreath;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
            ctx.stroke();

            if (!prefersReducedMotion && Math.random() < 0.0022 && actionPotentials.length < 8) {
              actionPotentials.push({
                from: p,
                to: p2,
                progress: 0,
                speed: 0.032 + Math.random() * 0.02,
                color: p.color,
              });
            }
          }
        }

        const pulseWave = Math.sin(p.phase);
        const pulse = 1 + pulseWave * 0.26;
        const currentRadius = p.radius * pulse;

        if (warpMultiplier > 2.8) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * warpMultiplier * 2.8, p.y - p.vy * warpMultiplier * 2.8);
          ctx.strokeStyle = p.color.hex;
          ctx.lineWidth = currentRadius * 1.25;
          ctx.stroke();
          ctx.lineWidth = 0.85;
        } else {
          const sprite = glowSprites.get(p.color.hex);
          if (sprite) {
            const haloSize = currentRadius * 4.8;
            ctx.globalAlpha = 0.4 + pulseWave * 0.2;
            ctx.drawImage(sprite, p.x - haloSize, p.y - haloSize, haloSize * 2, haloSize * 2);
            ctx.globalAlpha = 1;
          }
          ctx.fillStyle = p.color.hex;
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // 6. Action Potential Photon Pulses
      for (let a = actionPotentials.length - 1; a >= 0; a--) {
        const ap = actionPotentials[a];
        ap.progress += ap.speed * dtScale;
        if (ap.progress >= 1) {
          actionPotentials.splice(a, 1);
          continue;
        }
        const curX = ap.from.x + (ap.to.x - ap.from.x) * ap.progress;
        const curY = ap.from.y + (ap.to.y - ap.from.y) * ap.progress;
        const sprite = glowSprites.get(ap.color.hex);
        if (sprite) {
          ctx.drawImage(sprite, curX - 7, curY - 7, 14, 14);
        }
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(curX - 1.25, curY - 1.25, 2.5, 2.5);
      }

      // 7. Pooled Canvas Particle Sparks (cached radial sprites, zero save/restore or globalCompositeOperation churn)
      for (let s = sparks.length - 1; s >= 0; s--) {
        const sp = sparks[s];
        sp.x += sp.vx * dtScale;
        sp.y += sp.vy * dtScale;
        sp.vx *= 0.96;
        sp.vy *= 0.96;
        sp.life -= sp.decay * dtScale;

        if (sp.life <= 0) {
          sparks.splice(s, 1);
          continue;
        }

        const sprite = glowSprites.get(sp.color.hex);
        const radius = Math.max(2, sp.size * sp.life * 3.2);
        if (sprite) {
          ctx.globalAlpha = sp.life;
          ctx.drawImage(sprite, sp.x - radius, sp.y - radius, radius * 2, radius * 2);
        }
      }
      ctx.globalAlpha = 1;

      if (!prefersReducedMotion && !isPaused) {
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    const startLoop = () => {
      if (prefersReducedMotion) {
        renderFrame(performance.now());
        return;
      }
      if (!isPaused && rafId === 0) {
        lastFrameTime = performance.now();
        rafId = requestAnimationFrame(renderFrame);
      }
    };

    const stopLoop = () => {
      if (rafId !== 0) {
        cancelAnimationFrame(rafId);
        rafId = 0;
      }
    };

    const onVisibilityChange = () => {
      isPaused = document.hidden;
      if (isPaused) {
        stopLoop();
      } else {
        startLoop();
      }
    };

    const unsubscribeProgress = prefersReducedMotion
      ? parallaxProgress.on('change', () => renderFrame(performance.now()))
      : undefined;

    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('click', onClick, { passive: true });
    window.addEventListener('mrtc:burst', onCustomBurst);
    window.addEventListener('mrtc:audio-ripple', onAudioRipple);
    document.addEventListener('visibilitychange', onVisibilityChange);

    startLoop();

    return () => {
      stopLoop();
      unsubscribeProgress?.();
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('click', onClick);
      window.removeEventListener('mrtc:burst', onCustomBurst);
      window.removeEventListener('mrtc:audio-ripple', onAudioRipple);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [parallaxProgress]);

  return (
    <>
      {/* Warp Speed Flash Overlay */}
      <motion.div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-30"
        initial={false}
        animate={{ opacity: isWarping ? 0.5 : 0 }}
        transition={{ duration: isWarping ? 0.14 : 0.4, ease: 'easeOut' }}
        style={{
          background:
            'radial-gradient(circle, rgba(255, 209, 89, 0.32) 0%, rgba(236, 72, 153, 0.18) 40%, rgba(0, 229, 255, 0.12) 70%, transparent 100%)',
        }}
      />

      {/* Lightweight Static Space Backdrop + Single High-FPS Interactive Canvas */}
      <div data-testid="parallax-bg" className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="nebula-glow" />
        <div className="circuit-grid absolute inset-0 opacity-35" />
        <div className="perspective-grid" />
        <div className="horizon-light-beam" />
        <div className="hud-scanlines" />

        <canvas
          ref={canvasRef}
          data-testid="neural-canvas"
          className="absolute inset-0 pointer-events-none z-[2]"
        />
      </div>
    </>
  );
}
