'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { X, Minimize2, Zap } from 'lucide-react';

// Particle types and interfaces
interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  rotation: number;
  rotationSpeed: number;
  type: 'confetti' | 'spark' | 'star' | 'glitter' | 'streamer';
  life: number;
  maxLife: number;
  gravity: number;
}

interface Firework {
  id: number;
  x: number;
  y: number;
  targetY: number;
  exploded: boolean;
  color: string;
  particles: FireworkParticle[];
  trail: { x: number; y: number; alpha: number }[];
  pattern: 'circle' | 'heart' | 'star' | 'spiral' | 'double' | 'ring' | 'willow' | 'palm';
}

interface FireworkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
  hasTrail: boolean;
  trail: { x: number; y: number }[];
}

interface GlowOrb {
  x: number;
  y: number;
  radius: number;
  color: string;
  pulsePhase: number;
  pulseSpeed: number;
}

// Color palettes
const PALETTES = {
  celebration: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FF69B4', '#00FF87', '#FE53BB', '#00F5FF', '#F5D300'],
  firework: ['#FF0000', '#FFD700', '#00FF00', '#00FFFF', '#FF69B4', '#FFA500', '#9370DB', '#FF1493', '#00FF7F', '#FFE4E1'],
  confetti: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'],
  golden: ['#FFD700', '#FFA500', '#FF8C00', '#DAA520', '#B8860B', '#F4A460'],
  neon: ['#FF0080', '#00FF80', '#8000FF', '#FF8000', '#00FFFF', '#FF00FF']
};

const EMOJIS = ['🎉', '🎊', '✨', '🥂', '🎆', '🎇', '🌟', '⭐', '💫', '🔥', '🎈', '🪩', '🎁', '💥', '🌈', '🥳', '🎂'];

export default function NewYearAnimation({ customMessage }: { customMessage?: string }) {
  // Canvas refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  
  // Particle storage refs
  const particlesRef = useRef<Particle[]>([]);
  const fireworksRef = useRef<Firework[]>([]);
  const glowOrbsRef = useRef<GlowOrb[]>([]);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  const timeRef = useRef(0);
  
  // State
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('low'); // Start at LOW by default
  // Controls state reserved for future use
  const [showText, setShowText] = useState(true);
  
  const year = useMemo(() => new Date().getFullYear(), []);

  // Intensity multipliers
  const intensityMultiplier = useMemo(() => {
    switch (intensity) {
      case 'low': return 0.3;
      case 'medium': return 0.6;
      case 'high': return 1;
    }
  }, [intensity]);

  // Create particle helper
  const createParticle = useCallback((x: number, y: number, type: Particle['type'] = 'confetti'): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const speed = type === 'spark' ? 8 + Math.random() * 8 : 3 + Math.random() * 6;
    const colors = type === 'glitter' ? PALETTES.golden : PALETTES.confetti;
    
    return {
      id: Math.random(),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - (type === 'confetti' ? 5 : 8),
      size: type === 'spark' ? 2 + Math.random() * 3 : type === 'glitter' ? 3 + Math.random() * 4 : 6 + Math.random() * 8,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 15,
      type,
      life: 0,
      maxLife: type === 'spark' ? 60 : 120 + Math.random() * 80,
      gravity: type === 'spark' ? 0.15 : type === 'glitter' ? 0.08 : 0.12
    };
  }, []);

  // Create firework helper
  const createFirework = useCallback((x: number, targetY?: number): Firework => {
    const canvas = canvasRef.current;
    const patterns: Firework['pattern'][] = ['circle', 'heart', 'star', 'spiral', 'double', 'ring', 'willow', 'palm'];
    
    return {
      id: Math.random(),
      x,
      y: canvas ? canvas.height + 50 : 800,
      targetY: targetY ?? 80 + Math.random() * (canvas ? canvas.height * 0.35 : 250),
      exploded: false,
      color: PALETTES.firework[Math.floor(Math.random() * PALETTES.firework.length)],
      particles: [],
      trail: [],
      pattern: patterns[Math.floor(Math.random() * patterns.length)]
    };
  }, []);

  // Explode firework with pattern
  const explodeFirework = useCallback((firework: Firework) => {
    const colors = [firework.color, ...PALETTES.firework.slice(0, 3)];
    
    const addParticle = (angle: number, speed: number, hasTrail: boolean = true) => {
      firework.particles.push({
        x: firework.x,
        y: firework.y,
        vx: Math.cos(angle) * speed * (0.6 + Math.random() * 0.4),
        vy: Math.sin(angle) * speed * (0.6 + Math.random() * 0.4),
        life: 1,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 2 + Math.random() * 2,
        hasTrail,
        trail: []
      });
    };

    switch (firework.pattern) {
      case 'circle':
        for (let i = 0; i < 100; i++) {
          addParticle((i / 100) * Math.PI * 2, 4 + Math.random() * 4);
        }
        break;
      case 'heart':
        for (let i = 0; i < 80; i++) {
          const t = (i / 80) * Math.PI * 2;
          const heartX = 16 * Math.pow(Math.sin(t), 3);
          const heartY = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
          addParticle(Math.atan2(heartY, heartX), Math.sqrt(heartX * heartX + heartY * heartY) * 0.35);
        }
        break;
      case 'star':
        for (let i = 0; i < 60; i++) {
          const isPoint = i % 6 === 0;
          addParticle((i / 60) * Math.PI * 2, isPoint ? 8 : 4);
        }
        for (let i = 0; i < 30; i++) {
          addParticle(Math.random() * Math.PI * 2, 2 + Math.random() * 2, false);
        }
        break;
      case 'spiral':
        for (let i = 0; i < 100; i++) {
          addParticle((i / 100) * Math.PI * 8, 2 + (i / 100) * 6);
        }
        break;
      case 'double':
        for (let i = 0; i < 50; i++) {
          addParticle((i / 50) * Math.PI * 2, 3);
        }
        for (let i = 0; i < 70; i++) {
          addParticle((i / 70) * Math.PI * 2, 7);
        }
        break;
      case 'ring':
        for (let r = 0; r < 3; r++) {
          for (let i = 0; i < 30 + r * 15; i++) {
            addParticle((i / (30 + r * 15)) * Math.PI * 2, 3 + r * 2);
          }
        }
        break;
      case 'willow':
        for (let i = 0; i < 150; i++) {
          const angle = (i / 150) * Math.PI * 2;
          const particle = {
            x: firework.x,
            y: firework.y,
            vx: Math.cos(angle) * (3 + Math.random() * 2),
            vy: Math.sin(angle) * (3 + Math.random() * 2) - 2,
            life: 1.5,
            color: colors[Math.floor(Math.random() * colors.length)],
            size: 2,
            hasTrail: true,
            trail: [] as { x: number; y: number }[]
          };
          firework.particles.push(particle);
        }
        break;
      case 'palm':
        for (let branch = 0; branch < 8; branch++) {
          const baseAngle = (branch / 8) * Math.PI * 2 - Math.PI / 2;
          for (let i = 0; i < 15; i++) {
            const spread = (Math.random() - 0.5) * 0.3;
            addParticle(baseAngle + spread, 3 + i * 0.3);
          }
        }
        break;
    }
    
    firework.exploded = true;
  }, []);

  // Initialize glow orbs
  const initializeGlowOrbs = useCallback((width: number, height: number) => {
    glowOrbsRef.current = Array.from({ length: 5 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 100 + Math.random() * 150,
      color: PALETTES.neon[Math.floor(Math.random() * PALETTES.neon.length)],
      pulsePhase: Math.random() * Math.PI * 2,
      pulseSpeed: 0.02 + Math.random() * 0.02
    }));
  }, []);

  // Main animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    timeRef.current += 0.016;

    // Clear with strong fade for less visual clutter
    ctx.fillStyle = isMinimized ? 'rgba(0, 0, 0, 0.5)' : 'rgba(0, 0, 0, 0.25)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw glow orbs (background layer) - MUCH more subtle
    if (!isMinimized) {
      glowOrbsRef.current.forEach(orb => {
        orb.pulsePhase += orb.pulseSpeed;
        const pulse = 0.05 + Math.sin(orb.pulsePhase) * 0.03; // Reduced from 0.3/0.2 to 0.05/0.03
        
        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius);
        gradient.addColorStop(0, orb.color + Math.floor(pulse * 15).toString(16).padStart(2, '0')); // Reduced opacity
        gradient.addColorStop(0.5, orb.color + '05'); // Much more transparent
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    // Add new particles from edges - REDUCED FREQUENCY
    if (!isMinimized && Math.random() < 0.02 * intensityMultiplier && particlesRef.current.length < 100) {
      const side = Math.floor(Math.random() * 4);
      let x, y;
      switch (side) {
        case 0: x = Math.random() * canvas.width; y = -20; break;
        case 1: x = canvas.width + 20; y = Math.random() * canvas.height; break;
        case 2: x = Math.random() * canvas.width; y = canvas.height + 20; break;
        default: x = -20; y = Math.random() * canvas.height; break;
      }
      const types: Particle['type'][] = ['confetti', 'spark', 'glitter', 'star'];
      particlesRef.current.push(createParticle(x, y, types[Math.floor(Math.random() * types.length)]));
    }

    // Add new fireworks - REDUCED FREQUENCY
    if (!isMinimized && Math.random() < 0.008 * intensityMultiplier && fireworksRef.current.length < 3) {
      const x = 80 + Math.random() * (canvas.width - 160);
      fireworksRef.current.push(createFirework(x));
    }

    // Update and draw particles
    particlesRef.current = particlesRef.current.filter(p => {
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.99;
      p.rotation += p.rotationSpeed;
      p.alpha = Math.max(0, 1 - (p.life / p.maxLife));

      if (p.alpha <= 0) return false;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.alpha;

      if (p.type === 'spark') {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size * 2);
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.3, p.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, p.size * 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.type === 'confetti') {
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fillRect(-p.size / 4, -p.size / 8, p.size / 2, p.size / 4);
      } else if (p.type === 'glitter') {
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.5, p.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        // Diamond shape
        ctx.beginPath();
        ctx.moveTo(0, -p.size);
        ctx.lineTo(p.size * 0.6, 0);
        ctx.lineTo(0, p.size);
        ctx.lineTo(-p.size * 0.6, 0);
        ctx.closePath();
        ctx.fill();
      } else if (p.type === 'star') {
        ctx.fillStyle = p.color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const r = i % 2 === 0 ? p.size : p.size * 0.4;
          const sx = Math.cos(angle) * r;
          const sy = Math.sin(angle) * r;
          if (i === 0) ctx.moveTo(sx, sy);
          else ctx.lineTo(sx, sy);
        }
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
      return true;
    });

    // Update and draw fireworks
    fireworksRef.current = fireworksRef.current.filter(fw => {
      if (!fw.exploded) {
        fw.y -= 10;
        
        fw.trail.push({ x: fw.x, y: fw.y, alpha: 1 });
        if (fw.trail.length > 20) fw.trail.shift();

        fw.trail.forEach((pt, i) => {
          const alpha = (i / fw.trail.length) * 0.6;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, 2 + (i / fw.trail.length) * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 200, 100, ${alpha})`;
          ctx.fill();
        });

        const gradient = ctx.createRadialGradient(fw.x, fw.y, 0, fw.x, fw.y, 10);
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.5, fw.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(fw.x, fw.y, 10, 0, Math.PI * 2);
        ctx.fill();

        if (fw.y <= fw.targetY) {
          explodeFirework(fw);
        }
        return true;
      } else {
        let hasLive = false;
        
        fw.particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += fw.pattern === 'willow' ? 0.08 : 0.04;
          p.vx *= fw.pattern === 'willow' ? 0.98 : 0.99;
          p.vy *= fw.pattern === 'willow' ? 0.98 : 0.99;
          p.life -= fw.pattern === 'willow' ? 0.008 : 0.012;

          if (p.life > 0) {
            hasLive = true;

            if (p.hasTrail) {
              p.trail.push({ x: p.x, y: p.y });
              if (p.trail.length > 6) p.trail.shift();
              
              p.trail.forEach((t, i) => {
                ctx.beginPath();
                ctx.arc(t.x, t.y, p.size * (i / p.trail.length) * 0.8, 0, Math.PI * 2);
                ctx.fillStyle = p.color + Math.floor((i / p.trail.length) * p.life * 80).toString(16).padStart(2, '0');
                ctx.fill();
              });
            }

            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
            gradient.addColorStop(0, p.color);
            gradient.addColorStop(0.4, p.color + Math.floor(p.life * 128).toString(16).padStart(2, '0'));
            gradient.addColorStop(1, 'transparent');
            
            ctx.globalAlpha = p.life;
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        });

        return hasLive;
      }
    });

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [isMinimized, intensityMultiplier, createParticle, createFirework, explodeFirework]);

  // Setup
  useEffect(() => {
    if (!isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeGlowOrbs(canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, [isVisible, animate, initializeGlowOrbs]);

  // Mouse interactions
  useEffect(() => {
    if (!isVisible || isMinimized) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('input') || target.closest('[role="button"]')) return;

      // Create burst effect
      for (let i = 0; i < 20; i++) {
        particlesRef.current.push(createParticle(e.clientX, e.clientY, Math.random() < 0.5 ? 'spark' : 'glitter'));
      }
      
      // Launch firework from click
      fireworksRef.current.push(createFirework(e.clientX, e.clientY));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, [isVisible, isMinimized, createParticle, createFirework]);

  // Auto minimize - MUCH FASTER
  useEffect(() => {
    if (!isVisible) return;

    const textTimer = setTimeout(() => setShowText(false), 3000); // 3 seconds instead of 10
    const minimizeTimer = setTimeout(() => setIsMinimized(true), 5000); // 5 seconds instead of 25

    return () => {
      clearTimeout(textTimer);
      clearTimeout(minimizeTimer);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 pointer-events-none transition-opacity duration-700 ${
          isMinimized ? 'opacity-30' : 'opacity-100'
        }`}
        style={{ zIndex: 40, background: 'transparent' }}
      />

      {/* Controls */}
      <div className={`fixed z-[70] transition-all duration-500 ${
        isMinimized ? 'bottom-4 right-4' : 'top-4 right-4'
      }`}>
        {isMinimized ? (
          <button
            onClick={() => {
              setIsMinimized(false);
              setShowText(true);
              const canvas = canvasRef.current;
              if (canvas) {
                for (let i = 0; i < 4; i++) {
                  setTimeout(() => {
                    fireworksRef.current.push(createFirework(100 + Math.random() * (canvas.width - 200)));
                  }, i * 150);
                }
              }
            }}
            className="pointer-events-auto group p-4 bg-gradient-to-br from-yellow-500 via-red-500 to-pink-500 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 animate-pulse"
            title="Celebrate!"
          >
            <span className="text-3xl">🎆</span>
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-300 rounded-full animate-ping" />
            <span className="absolute -bottom-1 -left-1 w-3 h-3 bg-pink-400 rounded-full animate-ping" style={{ animationDelay: '0.5s' }} />
          </button>
        ) : (
          <div className="pointer-events-auto flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-full p-2 shadow-xl border border-white/10">
            {/* Burst button */}
            <button
              onClick={() => {
                const canvas = canvasRef.current;
                if (canvas) {
                  for (let i = 0; i < 5; i++) {
                    setTimeout(() => {
                      fireworksRef.current.push(createFirework(100 + Math.random() * (canvas.width - 200)));
                    }, i * 100);
                  }
                  for (let i = 0; i < 50; i++) {
                    particlesRef.current.push(createParticle(
                      Math.random() * canvas.width,
                      Math.random() * canvas.height * 0.5,
                      'glitter'
                    ));
                  }
                }
              }}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Burst!"
            >
              <Zap className="w-5 h-5 text-yellow-400" />
            </button>

            {/* Intensity controls */}
            <div className="flex items-center gap-1 px-2 border-l border-white/20">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setIntensity(level)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    intensity === level 
                      ? 'bg-yellow-400 scale-125 shadow-lg shadow-yellow-400/50' 
                      : 'bg-white/40 hover:bg-white/60'
                  }`}
                  title={`${level} intensity`}
                />
              ))}
            </div>

            {/* Minimize */}
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
              title="Minimize"
            >
              <Minimize2 className="w-5 h-5" />
            </button>

            {/* Close */}
            <button
              onClick={() => setIsVisible(false)}
              className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
              title="Close celebration"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        )}
      </div>

      {/* Corner decorations - Always visible */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        <div className="absolute top-0 left-0 p-4">
          <div className="text-3xl animate-bounce" style={{ animationDelay: '0s' }}>🎊</div>
        </div>
        <div className="absolute top-0 right-20 p-4">
          <div className="text-3xl animate-bounce" style={{ animationDelay: '0.2s' }}>🎉</div>
        </div>
        <div className="absolute bottom-0 left-0 p-4">
          <div className="text-2xl animate-bounce" style={{ animationDelay: '0.4s' }}>🥳</div>
        </div>
        <div className="absolute bottom-0 right-0 p-4">
          <div className="text-2xl animate-bounce" style={{ animationDelay: '0.6s' }}>✨</div>
        </div>
      </div>

      {/* Main text overlay */}
      {!isMinimized && showText && (
        <div className="fixed inset-0 pointer-events-none z-45 flex items-center justify-center">
          <div className="text-center px-4">
            {/* Year display */}
            <div className="relative mb-4">
              <h1 
                className="text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-black tracking-tighter animate-in zoom-in duration-1000"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FF6B6B 25%, #4ECDC4 50%, #45B7D1 75%, #FF69B4 100%)',
                  backgroundSize: '400% 400%',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  animation: 'gradient-shift 3s ease infinite',
                  textShadow: '0 0 80px rgba(255, 215, 0, 0.4), 0 0 120px rgba(255, 107, 107, 0.3)'
                }}
              >
                {year}
              </h1>
              {/* Glow rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-full h-full max-w-2xl border border-yellow-400/20 rounded-full animate-ping" style={{ animationDuration: '3s' }} />
              </div>
            </div>

            {/* Happy New Year */}
            <h2 
              className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 animate-in fade-in slide-in-from-bottom duration-1000"
              style={{
                background: 'linear-gradient(90deg, #fff 0%, #FFD700 30%, #fff 50%, #FFD700 70%, #fff 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                animation: 'shimmer 2.5s linear infinite',
                animationDelay: '0.3s'
              }}
            >
              Happy New Year!
            </h2>

            {/* Custom message */}
            {customMessage && (
              <p 
                className="text-lg sm:text-xl md:text-2xl text-white/90 drop-shadow-lg animate-in fade-in duration-1000 max-w-2xl mx-auto"
                style={{ animationDelay: '0.6s' }}
              >
                {customMessage}
              </p>
            )}

            {/* Emoji row */}
            <div className="flex justify-center gap-3 sm:gap-4 mt-6 sm:mt-8">
              {['🎊', '🎉', '🥳', '🎆', '✨'].map((emoji, i) => (
                <span 
                  key={i}
                  className="text-3xl sm:text-4xl md:text-5xl animate-bounce drop-shadow-lg"
                  style={{ animationDelay: `${i * 0.15}s` }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Minimized floating emojis */}
      {isMinimized && (
        <div className="fixed bottom-4 right-20 pointer-events-none z-60">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute text-xl animate-float-away"
              style={{
                left: `${(i - 1) * 20}px`,
                animationDelay: `${i * 0.8}s`,
                animationDuration: '4s'
              }}
            >
              {EMOJIS[(i + Math.floor(Date.now() / 1000)) % EMOJIS.length]}
            </div>
          ))}
        </div>
      )}

      {/* Global styles */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes float-away {
          0% { 
            opacity: 1; 
            transform: translateY(0) scale(1) rotate(0deg);
          }
          100% { 
            opacity: 0; 
            transform: translateY(-80px) scale(0.3) rotate(360deg);
          }
        }
        
        .animate-float-away {
          animation: float-away 4s ease-out infinite;
        }
      `}</style>
    </>
  );
}
