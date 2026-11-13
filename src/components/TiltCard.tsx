import React, { useRef } from 'react';
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from 'motion/react';

interface TiltCardProps extends Omit<HTMLMotionProps<'div'>, 'style'> {
  variant?: 'gold' | 'rainbow';
  children: React.ReactNode;
  className?: string;
  tiltMax?: number;
}

export function TiltCard({
  variant = 'gold',
  children,
  className = '',
  tiltMax = 6,
  ...rest
}: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);

  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const glareOpacity = useMotionValue(0);

  const smoothX = useSpring(mouseX, { stiffness: 260, damping: 24, mass: 0.5 });
  const smoothY = useSpring(mouseY, { stiffness: 260, damping: 24, mass: 0.5 });
  const smoothGlare = useSpring(glareOpacity, { stiffness: 220, damping: 26 });

  const rotateX = useTransform(smoothY, [0, 1], [tiltMax, -tiltMax]);
  const rotateY = useTransform(smoothX, [0, 1], [-tiltMax, tiltMax]);
  const glareX = useTransform(smoothX, [0, 1], ['0%', '100%']);
  const glareY = useTransform(smoothY, [0, 1], ['0%', '100%']);

  const glareGradient = useMotionTemplate`radial-gradient(circle 280px at ${glareX} ${glareY}, rgba(255, 255, 255, 0.16), transparent 72%)`;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return;
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
    glareOpacity.set(1);
  };

  const handleMouseLeave = () => {
    mouseX.set(0.5);
    mouseY.set(0.5);
    glareOpacity.set(0);
  };

  const baseClass = variant === 'rainbow' ? 'glass-hud-rainbow' : 'glass-hud';

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformPerspective: 950,
      }}
      whileHover={{ y: -3, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 320, damping: 25 }}
      className={`${baseClass} glass-hud-interactive relative ${className}`}
      {...rest}
    >
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 rounded-[inherit] z-10"
        style={{
          background: glareGradient,
          opacity: smoothGlare,
        }}
      />
      {children}
    </motion.div>
  );
}
