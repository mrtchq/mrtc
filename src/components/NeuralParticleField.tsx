import React, { useEffect, useMemo, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from 'motion/react';
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

function generateBoxShadowStars(n: number, maxCoord: number, palette: string[]): string {
  const shadows: string[] = [];
  for (let i = 0; i < n; i++) {
    const x = Math.floor(Math.random() * maxCoord);
    const y = Math.floor(Math.random() * maxCoord);
    const color = palette[Math.floor(Math.random() * palette.length)];
    shadows.push(`${x}px ${y}px ${color}`);
  }
  return shadows.join(', ');
}

export function dispatchParticleBurst(x: number, y: number, count = 24, colorHex?: string) {
  window.dispatchEvent(
    new CustomEvent('mrtc:burst', {
      detail: { x, y, count, colorHex },
    })
  );
}

interface NeuralParticleFieldProps {
  isWarping: boolean;
  parallaxProgress: MotionValue<number>;
}

const BOKEH_EMBERS = [
  { left: '12%', top: '40%', size: 'w-3 h-3', color: '#ffd159', delay: 0, dx: 12, dy: -45 },
  { left: '32%', top: '65%', size: 'w-2 h-2', color: '#00e5ff', delay: 1.5, dx: -15, dy: -55 },
  { left: '78%', top: '25%', size: 'w-3.5 h-3.5', color: '#ec4899', delay: 0.8, dx: 18, dy: -50 },
  { left: '88%', top: '60%', size: 'w-2.5 h-2.5', color: '#9333ea', delay: 2.2, dx: -14, dy: -40 },
  { left: '68%', top: '75%', size: 'w-2 h-2', color: '#10b981', delay: 3.1, dx: 10, dy: -60 },
  { left: '62%', top: '38%', size: 'w-3 h-3', color: '#f97316', delay: 1.2, dx: -12, dy: -48 },
  { left: '22%', top: '22%', size: 'w-2.5 h-2.5', color: '#ffd159', delay: 2.7, dx: 14, dy: -38 },
];

export function NeuralParticleField({ isWarping, parallaxProgress }: NeuralParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const warpTargetRef = useRef(1);

  const starParallaxSlowX = useTransform(parallaxProgress, [0, 1], [0, -110]);
  const starParallaxMidX = useTransform(parallaxProgress, [0, 1], [0, -210]);
  const nebulaParallaxX = useTransform(parallaxProgress, [0, 1], [0, -150]);
  const horizonParallaxX = useTransform(parallaxProgress, [0, 1], [0, 85]);

  const cursorX = useMotionValue(-400);
  const cursorY = useMotionValue(-400);
  const smoothCursorX = useSpring(cursorX, { stiffness: 180, damping: 24, mass: 0.6 });
  const smoothCursorY = useSpring(cursorY, { stiffness: 180, damping: 24, mass: 0.6 });

  const starVars = useMemo(() => {
    const sm = generateBoxShadowStars(560, 2800, ['#ffffff', '#fff9c4', '#ffd54f']);
    const md = generateBoxShadowStars(180, 2800, ['#ffffff', '#ffd159', '#00e5ff', '#ec4899']);
    const lg = generateBoxShadowStars(80, 2800, ['#ffd159', '#f5b82e', '#9333ea', '#ec4899', '#00e5ff', '#10b981']);
    return { sm, md, lg };
  }, []);

  useEffect(() => {
    if (isWarping) {
      warpTargetRef.current = 15;
      const timer = window.setTimeout(() => {
        warpTargetRef.current = 1;
      }, 420);
      return () => window.clearTimeout(timer);
    }
  }, [isWarping]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let width = window.innerWidth;
    let height = window.innerHeight;
    let budget = calculateParticlePoolBudget(width, height);
    let nodes: SynapticNode[] = [];

    const resize = () => {
      const prevWidth = width || window.innerWidth;
      const prevHeight = height || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      budget = calculateParticlePoolBudget(width, height);

      if (nodes.length > 0 && prevWidth > 0 && prevHeight > 0) {
        const scaleX = width / prevWidth;
        const scaleY = height / prevHeight;
        for (let i = 0; i < nodes.length; i++) {
          nodes[i].x = Math.min(width, Math.max(0, nodes[i].x * scaleX));
          nodes[i].y = Math.min(height, Math.max(0, nodes[i].y * scaleY));
        }
      }
    };
    resize();

    nodes = Array.from({ length: budget.nodeCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.72,
      vy: (Math.random() - 0.5) * 0.72,
      radius: Math.random() * 2 + 1.2,
      color: BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)],
      phase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.03,
    }));

    const actionPotentials: ActionPotential[] = [];
    const ripples: ShockwaveRipple[] = [];
    const sparks: CanvasSpark[] = [];

    const mouse = { x: -1000, y: -1000, active: false };
    let warpMultiplier = 1;
    let lastTrailTime = 0;

    const spawnBurst = (x: number, y: number, count: number, colorHex?: string) => {
      const matchedColor = colorHex ? BRAND_COLORS.find((c) => c.hex === colorHex) : undefined;
      for (let i = 0; i < count; i++) {
        if (sparks.length >= budget.maxSparks) {
          sparks.shift();
        }
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4.5 + 1.4;
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 2.8 + 1.6,
          life: 1,
          decay: 0.022 + Math.random() * 0.018,
          color: matchedColor ?? BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)],
        });
      }
      ripples.push({
        x,
        y,
        radius: 6,
        maxRadius: 210,
        opacity: 0.78,
        color: matchedColor ?? BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)],
      });
    };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
      cursorX.set(e.clientX - 160);
      cursorY.set(e.clientY - 160);

      if (prefersReducedMotion) return;
      const now = performance.now();
      if (now - lastTrailTime > 55 && sparks.length < budget.maxSparks) {
        lastTrailTime = now;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 1.3 + 0.4;
        sparks.push({
          x: e.clientX,
          y: e.clientY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          size: Math.random() * 2.2 + 1.2,
          life: 0.85,
          decay: 0.032,
          color: BRAND_COLORS[Math.floor(Math.random() * BRAND_COLORS.length)],
        });
      }
    };

    const onMouseLeave = () => {
      mouse.active = false;
    };

    const onClick = (e: MouseEvent) => {
      if (prefersReducedMotion) return;
      spawnBurst(e.clientX, e.clientY, 16);
    };

    const onCustomBurst = (e: Event) => {
      if (prefersReducedMotion) return;
      const detail = (e as CustomEvent<{ x: number; y: number; count?: number; colorHex?: string }>).detail;
      if (detail) {
        spawnBurst(detail.x, detail.y, detail.count ?? 24, detail.colorHex);
      }
    };

    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('click', onClick, { passive: true });
    window.addEventListener('mrtc:burst', onCustomBurst);

    let rafId = 0;

    const renderFrame = () => {
      ctx.clearRect(0, 0, width, height);

      if (!prefersReducedMotion) {
        warpMultiplier += (warpTargetRef.current - warpMultiplier) * 0.085;
        if (Math.abs(warpMultiplier - 1) < 0.04 && warpTargetRef.current === 1) {
          warpMultiplier = 1;
        }
      }

      // 1. Shockwave Ripples
      for (let r = ripples.length - 1; r >= 0; r--) {
        const rip = ripples[r];
        rip.radius += 5.5;
        rip.opacity -= 0.022;
        if (rip.opacity <= 0 || rip.radius >= rip.maxRadius) {
          ripples.splice(r, 1);
          continue;
        }
        ctx.beginPath();
        ctx.arc(rip.x, rip.y, rip.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(${rip.color.r}, ${rip.color.g}, ${rip.color.b}, ${rip.opacity})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // 2. Synaptic Nodes & Filaments
      const connectDist = budget.connectDistance;
      const connectDistSq = connectDist * connectDist;
      const mouseDist = 180;
      const mouseDistSq = mouseDist * mouseDist;

      for (let i = 0; i < nodes.length; i++) {
        const p = nodes[i];
        if (!prefersReducedMotion) {
          p.x += p.vx * warpMultiplier;
          p.y += p.vy * warpMultiplier;
          p.phase += p.pulseSpeed;
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
            p.x += (mdx / mDist) * 0.42;
            p.y += (mdy / mDist) * 0.42;
            const alpha = (1 - mDist / mouseDist) * 0.72;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.strokeStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
            ctx.lineWidth = 1.1;
            ctx.stroke();
          }
        }

        for (let j = i + 1; j < nodes.length; j++) {
          const p2 = nodes[j];
          const dx = p2.x - p.x;
          const dy = p2.y - p.y;
          const distSq = dx * dx + dy * dy;
          if (distSq < connectDistSq) {
            const dist = Math.sqrt(distSq);
            const alpha = (1 - dist / connectDist) * 0.34;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, ${alpha})`;
            ctx.lineWidth = 0.85;
            ctx.stroke();

            if (!prefersReducedMotion && Math.random() < 0.0025 && actionPotentials.length < 16) {
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

        const pulse = 1 + Math.sin(p.phase) * 0.28;
        const currentRadius = p.radius * pulse;

        if (warpMultiplier > 3) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p.x - p.vx * warpMultiplier * 3.2, p.y - p.vy * warpMultiplier * 3.2);
          ctx.strokeStyle = p.color.hex;
          ctx.lineWidth = currentRadius * 1.4;
          ctx.stroke();
        } else {
          // Soft outer halo + bright core without expensive shadowBlur
          ctx.beginPath();
          ctx.arc(p.x, p.y, currentRadius * 2.2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.color.r}, ${p.color.g}, ${p.color.b}, 0.16)`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(p.x, p.y, currentRadius, 0, Math.PI * 2);
          ctx.fillStyle = p.color.hex;
          ctx.fill();
        }
      }

      // 3. Action Potential Photon Pulses
      for (let a = actionPotentials.length - 1; a >= 0; a--) {
        const ap = actionPotentials[a];
        ap.progress += ap.speed;
        if (ap.progress >= 1) {
          actionPotentials.splice(a, 1);
          continue;
        }
        const curX = ap.from.x + (ap.to.x - ap.from.x) * ap.progress;
        const curY = ap.from.y + (ap.to.y - ap.from.y) * ap.progress;

        ctx.beginPath();
        ctx.arc(curX, curY, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${ap.color.r}, ${ap.color.g}, ${ap.color.b}, 0.35)`;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(curX, curY, 2.2, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
      }

      // 4. Pooled Canvas Particle Sparks (Additive glow, zero DOM churn)
      if (sparks.length > 0) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';
        for (let s = sparks.length - 1; s >= 0; s--) {
          const sp = sparks[s];
          sp.x += sp.vx;
          sp.y += sp.vy;
          sp.vx *= 0.96;
          sp.vy *= 0.96;
          sp.life -= sp.decay;

          if (sp.life <= 0) {
            sparks.splice(s, 1);
            continue;
          }

          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size * sp.life * 2.1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${sp.color.r}, ${sp.color.g}, ${sp.color.b}, ${sp.life * 0.28})`;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(sp.x, sp.y, sp.size * sp.life, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${sp.color.r}, ${sp.color.g}, ${sp.color.b}, ${sp.life})`;
          ctx.fill();
        }
        ctx.restore();
      }

      rafId = requestAnimationFrame(renderFrame);
    };

    rafId = requestAnimationFrame(renderFrame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('click', onClick);
      window.removeEventListener('mrtc:burst', onCustomBurst);
    };
  }, [cursorX, cursorY]);

  return (
    <>
      {/* Cursor Radial Aura driven by Framer Motion springs */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none fixed top-0 left-0 w-80 h-80 rounded-full opacity-60 mix-blend-screen z-40 hidden sm:block will-change-transform"
        style={{
          x: smoothCursorX,
          y: smoothCursorY,
          background:
            'radial-gradient(circle, rgba(245, 184, 46, 0.28) 0%, rgba(236, 72, 153, 0.16) 35%, rgba(0, 229, 255, 0.1) 65%, transparent 80%)',
          filter: 'blur(30px)',
        }}
      />

      {/* Warp Speed Flash Overlay */}
      <motion.div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none z-30"
        initial={false}
        animate={{ opacity: isWarping ? 0.65 : 0 }}
        transition={{ duration: isWarping ? 0.14 : 0.45, ease: 'easeOut' }}
        style={{
          background:
            'radial-gradient(circle, rgba(255, 209, 89, 0.36) 0%, rgba(236, 72, 153, 0.22) 38%, rgba(0, 229, 255, 0.14) 68%, transparent 100%)',
        }}
      />

      {/* Ambient Space, Dual-Nebula, Starfield & Neural Canvas */}
      <div
        data-testid="parallax-bg"
        className={`fixed inset-0 overflow-hidden pointer-events-none z-0 ${isWarping ? 'warp-speed' : ''}`}
      >
        <motion.div className="absolute inset-0 will-change-transform" style={{ x: starParallaxSlowX }}>
          <div
            className="star-layer-1"
            style={
              {
                boxShadow: starVars.sm,
                '--stars-sm': starVars.sm,
              } as React.CSSProperties
            }
          />
        </motion.div>

        <motion.div className="absolute inset-0 will-change-transform" style={{ x: starParallaxMidX }}>
          <div
            className="star-layer-2"
            style={
              {
                boxShadow: starVars.md,
                '--stars-md': starVars.md,
              } as React.CSSProperties
            }
          />
          <div
            className="star-layer-3"
            style={
              {
                boxShadow: starVars.lg,
                '--stars-lg': starVars.lg,
              } as React.CSSProperties
            }
          />
        </motion.div>

        <motion.div className="nebula-glow will-change-transform" style={{ x: nebulaParallaxX }} />
        <div className="circuit-grid absolute inset-0 opacity-40" />
        <motion.div className="absolute inset-0 will-change-transform" style={{ x: horizonParallaxX }}>
          <div className="perspective-grid" />
          <div className="horizon-light-beam" />
        </motion.div>
        <div className="hud-scanlines" />

        {/* Framer Motion GPU-composited Floating Bokeh Embers */}
        {BOKEH_EMBERS.map((ember, idx) => (
          <motion.div
            key={idx}
            aria-hidden="true"
            className={`absolute rounded-full pointer-events-none ${ember.size}`}
            style={{
              left: ember.left,
              top: ember.top,
              backgroundColor: ember.color,
              boxShadow: `0 0 14px ${ember.color}`,
            }}
            animate={{
              y: [0, ember.dy, 0],
              x: [0, ember.dx, 0],
              scale: [0.9, 1.25, 0.9],
              opacity: [0.35, 0.85, 0.35],
            }}
            transition={{
              duration: 9 + idx * 1.4,
              repeat: Infinity,
              delay: ember.delay,
              ease: 'easeInOut',
            }}
          />
        ))}

        {/* Unified Synaptic & Particle Canvas */}
        <canvas
          ref={canvasRef}
          data-testid="neural-canvas"
          className="absolute inset-0 pointer-events-none z-[2]"
        />
      </div>
    </>
  );
}
