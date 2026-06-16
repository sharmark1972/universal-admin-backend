'use client';

import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  type: 'circle' | 'square' | 'triangle' | 'star' | 'heart';
  rotation: number;
  rotationSpeed: number;
}

interface ParticleBurstOptions {
  x: number;
  y: number;
  count?: number;
  colors?: string[];
  minSize?: number;
  maxSize?: number;
  minSpeed?: number;
  maxSpeed?: number;
  types?: Particle['type'][];
  gravity?: number;
  fadeSpeed?: number;
}

const DEFAULT_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
  '#FF69B4', '#00CED1', '#FFD700', '#FF4500', '#9370DB'
];

export const useParticleEffects = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animationRef = useRef<number>();

  // Create a single particle
  const createParticle = useCallback((options: Partial<ParticleBurstOptions> & { angle?: number; speed?: number }): Particle => {
    const colors = options.colors || DEFAULT_COLORS;
    const types = options.types || ['circle', 'square', 'triangle', 'star'];
    
    const angle = options.angle ?? Math.random() * Math.PI * 2;
    const speed = options.speed ?? (options.minSpeed ?? 2) + Math.random() * ((options.maxSpeed ?? 8) - (options.minSpeed ?? 2));
    
    return {
      x: options.x ?? 0,
      y: options.y ?? 0,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      size: (options.minSize ?? 2) + Math.random() * ((options.maxSize ?? 8) - (options.minSize ?? 2)),
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      life: 0,
      maxLife: 60 + Math.random() * 60,
      type: types[Math.floor(Math.random() * types.length)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10
    };
  }, []);

  // Create a burst of particles
  const createBurst = useCallback((options: ParticleBurstOptions) => {
    const count = options.count ?? 20;
    const newParticles: Particle[] = [];
    
    for (let i = 0; i < count; i++) {
      newParticles.push(createParticle(options));
    }
    
    particlesRef.current.push(...newParticles);
  }, [createParticle]);

  // Create a heart-shaped burst
  const createHeartBurst = useCallback((x: number, y: number, color?: string) => {
    const colors = color ? [color] : DEFAULT_COLORS.filter(c => c.includes('FF') || c.includes('69'));
    const count = 30;
    
    for (let i = 0; i < count; i++) {
      const t = (i / count) * Math.PI * 2;
      const heartX = 16 * Math.pow(Math.sin(t), 3);
      const heartY = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
      const angle = Math.atan2(heartY, heartX);
      const speed = Math.sqrt(heartX * heartX + heartY * heartY) * 0.3;
      
      particlesRef.current.push(createParticle({
        x, y,
        angle,
        speed,
        colors,
        types: ['heart'],
        minSize: 3,
        maxSize: 6
      }));
    }
  }, [createParticle]);

  // Create a spiral burst
  const createSpiralBurst = useCallback((x: number, y: number, count: number = 40) => {
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 6;
      const speed = 2 + (i / count) * 6;
      
      particlesRef.current.push(createParticle({
        x, y,
        angle,
        speed,
        minSize: 2,
        maxSize: 4
      }));
    }
  }, [createParticle]);

  // Create a ring burst
  const createRingBurst = useCallback((x: number, y: number, ringCount: number = 3) => {
    for (let r = 0; r < ringCount; r++) {
      const particleCount = 20 + r * 15;
      const speed = 3 + r * 2;
      
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        
        particlesRef.current.push(createParticle({
          x, y,
          angle,
          speed,
          minSize: 2,
          maxSize: 3
        }));
      }
    }
  }, [createParticle]);

  // Draw a particle
  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: Particle) => {
    ctx.save();
    ctx.translate(particle.x, particle.y);
    ctx.rotate((particle.rotation * Math.PI) / 180);
    ctx.globalAlpha = particle.alpha;

    // Glow effect
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size * 2);
    gradient.addColorStop(0, particle.color + '80');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(0, 0, particle.size * 2, 0, Math.PI * 2);
    ctx.fill();

    // Draw shape
    ctx.fillStyle = particle.color;
    ctx.beginPath();

    switch (particle.type) {
      case 'circle':
        ctx.arc(0, 0, particle.size, 0, Math.PI * 2);
        break;
      case 'square':
        ctx.rect(-particle.size / 2, -particle.size / 2, particle.size, particle.size);
        break;
      case 'triangle':
        ctx.moveTo(0, -particle.size);
        ctx.lineTo(particle.size, particle.size);
        ctx.lineTo(-particle.size, particle.size);
        ctx.closePath();
        break;
      case 'star':
        for (let i = 0; i < 5; i++) {
          const outerAngle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const innerAngle = ((i * 4 + 2) * Math.PI) / 5 - Math.PI / 2;
          const outerR = particle.size;
          const innerR = particle.size * 0.4;
          
          if (i === 0) {
            ctx.moveTo(Math.cos(outerAngle) * outerR, Math.sin(outerAngle) * outerR);
          } else {
            ctx.lineTo(Math.cos(outerAngle) * outerR, Math.sin(outerAngle) * outerR);
          }
          ctx.lineTo(Math.cos(innerAngle) * innerR, Math.sin(innerAngle) * innerR);
        }
        ctx.closePath();
        break;
      case 'heart': {
        const scale = particle.size / 16;
        ctx.moveTo(0, -5 * scale);
        ctx.bezierCurveTo(5 * scale, -10 * scale, 10 * scale, -5 * scale, 0, 5 * scale);
        ctx.bezierCurveTo(-10 * scale, -5 * scale, -5 * scale, -10 * scale, 0, -5 * scale);
        break;
      }
    }

    ctx.fill();
    ctx.restore();
  }, []);

  // Animation loop
  const animate = useCallback((gravity: number = 0.1, fadeSpeed: number = 0.015) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear with fade
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Update and draw particles
    particlesRef.current = particlesRef.current.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += gravity;
      particle.vx *= 0.99;
      particle.vy *= 0.99;
      particle.rotation += particle.rotationSpeed;
      particle.life++;
      particle.alpha = Math.max(0, 1 - particle.life / particle.maxLife);

      if (particle.alpha <= 0) return false;

      drawParticle(ctx, particle);
      return true;
    });

    animationRef.current = requestAnimationFrame(() => animate(gravity, fadeSpeed));
  }, [drawParticle]);

  // Initialize canvas
  const initCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [animate]);

  return {
    canvasRef,
    createBurst,
    createHeartBurst,
    createSpiralBurst,
    createRingBurst,
    initCanvas
  };
};

// Standalone particle effects component
export default function ParticleEffects() {
  const { canvasRef, createBurst, createHeartBurst, createSpiralBurst, createRingBurst, initCanvas } = useParticleEffects();

  useEffect(() => {
    const cleanup = initCanvas();
    return cleanup;
  }, [initCanvas]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('input')) return;

      const effectIndex = Math.floor(Math.random() * 4);
      
      switch (effectIndex) {
        case 0:
          createBurst({ x: e.clientX, y: e.clientY });
          break;
        case 1:
          createHeartBurst(e.clientX, e.clientY);
          break;
        case 2:
          createSpiralBurst(e.clientX, e.clientY);
          break;
        case 3:
          createRingBurst(e.clientX, e.clientY);
          break;
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [createBurst, createHeartBurst, createSpiralBurst, createRingBurst]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none"
      style={{ zIndex: 50, background: 'transparent' }}
    />
  );
}
