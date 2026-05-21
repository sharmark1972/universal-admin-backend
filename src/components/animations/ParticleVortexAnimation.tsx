'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Wind, Zap, Maximize2 } from 'lucide-react';

interface VortexParticle {
  x: number;
  y: number;
  z: number;
  angle: number;
  radius: number;
  speed: number;
  size: number;
  color: string;
  alpha: number;
  trail: { x: number; y: number; alpha: number }[];
}

interface EnergyRing {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
  thickness: number;
}

const VORTEX_COLORS = [
  '#00FFFF', '#00BFFF', '#1E90FF', '#4169E1', '#6495ED',
  '#7B68EE', '#9370DB', '#8A2BE2', '#9932CC', '#BA55D3',
  '#DA70D6', '#EE82EE', '#FF00FF', '#FF69B4', '#FF1493'
];

export default function ParticleVortexAnimation({ customMessage }: { customMessage?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<VortexParticle[]>([]);
  const ringsRef = useRef<EnergyRing[]>([]);
  const timeRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [vortexMode, setVortexMode] = useState<'spiral' | 'tornado' | 'galaxy'>('spiral');

  // Create vortex particle
  const createParticle = useCallback((angle?: number, radius?: number): VortexParticle => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return {
        x: 0, y: 0, z: 0, angle: 0, radius: 0, speed: 0, size: 0, color: '', alpha: 0, trail: []
      };
    }

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;

    return {
      x: centerX,
      y: centerY,
      z: Math.random() * 200 - 100,
      angle: angle ?? Math.random() * Math.PI * 2,
      radius: radius ?? Math.random() * maxRadius,
      speed: 0.01 + Math.random() * 0.02,
      size: 2 + Math.random() * 4,
      color: VORTEX_COLORS[Math.floor(Math.random() * VORTEX_COLORS.length)],
      alpha: 0.6 + Math.random() * 0.4,
      trail: []
    };
  }, []);

  // Create energy ring
  const createEnergyRing = useCallback((): EnergyRing => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { x: 0, y: 0, radius: 0, maxRadius: 0, alpha: 0, color: '', thickness: 0 };
    }

    return {
      x: canvas.width / 2,
      y: canvas.height / 2,
      radius: 10,
      maxRadius: Math.min(canvas.width, canvas.height) * 0.45,
      alpha: 1,
      color: VORTEX_COLORS[Math.floor(Math.random() * VORTEX_COLORS.length)],
      thickness: 2 + Math.random() * 3
    };
  }, []);

  // Draw particle with trail
  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: VortexParticle) => {
    // Draw trail
    particle.trail.forEach((point, i) => {
      const alpha = (i / particle.trail.length) * particle.alpha * 0.5;
      ctx.beginPath();
      ctx.arc(point.x, point.y, particle.size * (i / particle.trail.length), 0, Math.PI * 2);
      ctx.fillStyle = particle.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.fill();
    });

    // Draw glow
    const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size * 3);
    gradient.addColorStop(0, particle.color + '80');
    gradient.addColorStop(0.5, particle.color + '40');
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
    ctx.fill();

    // Draw particle
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = particle.color;
    ctx.globalAlpha = particle.alpha;
    ctx.fill();
    ctx.globalAlpha = 1;
  }, []);

  // Draw energy ring
  const drawEnergyRing = useCallback((ctx: CanvasRenderingContext2D, ring: EnergyRing) => {
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.radius, 0, Math.PI * 2);
    ctx.strokeStyle = ring.color + Math.floor(ring.alpha * 255).toString(16).padStart(2, '0');
    ctx.lineWidth = ring.thickness;
    ctx.stroke();

    // Inner glow
    const gradient = ctx.createRadialGradient(ring.x, ring.y, ring.radius - ring.thickness, ring.x, ring.y, ring.radius + ring.thickness);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.5, ring.color + Math.floor(ring.alpha * 100).toString(16).padStart(2, '0'));
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(ring.x, ring.y, ring.radius + ring.thickness, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  // Main animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    timeRef.current += 0.016;

    // Clear with fade
    ctx.fillStyle = isMinimized ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const maxRadius = Math.min(canvas.width, canvas.height) * 0.4;

    // Draw center glow
    if (!isMinimized) {
      const centerGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 100);
      centerGradient.addColorStop(0, 'rgba(0, 255, 255, 0.1)');
      centerGradient.addColorStop(0.5, 'rgba(138, 43, 226, 0.05)');
      centerGradient.addColorStop(1, 'transparent');
      ctx.fillStyle = centerGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 100, 0, Math.PI * 2);
      ctx.fill();
    }

    // Update and draw particles
    particlesRef.current.forEach(particle => {
      // Update angle based on vortex mode
      let speedMultiplier = 1;
      switch (vortexMode) {
        case 'spiral':
          speedMultiplier = 1 + (1 - particle.radius / maxRadius) * 2;
          break;
        case 'tornado':
          speedMultiplier = 1 + Math.sin(timeRef.current * 2 + particle.angle) * 0.5;
          break;
        case 'galaxy':
          speedMultiplier = 1 + Math.cos(particle.angle * 3) * 0.3;
          break;
      }

      particle.angle += particle.speed * speedMultiplier;

      // Calculate position
      let x = centerX + Math.cos(particle.angle) * particle.radius;
      let y = centerY + Math.sin(particle.angle) * particle.radius;

      // Add Z-based parallax
      const parallax = 1 + particle.z / 500;
      x = centerX + (x - centerX) * parallax;
      y = centerY + (y - centerY) * parallax;

      // Update trail
      particle.trail.push({ x: particle.x, y: particle.y, alpha: particle.alpha });
      if (particle.trail.length > 8) particle.trail.shift();

      particle.x = x;
      particle.y = y;

      // Pulse alpha
      particle.alpha = 0.5 + Math.sin(timeRef.current * 2 + particle.angle) * 0.3;

      drawParticle(ctx, particle);
    });

    // Update and draw energy rings
    ringsRef.current = ringsRef.current.filter(ring => {
      ring.radius += 2;
      ring.alpha -= 0.008;

      if (ring.alpha <= 0 || ring.radius >= ring.maxRadius) return false;

      drawEnergyRing(ctx, ring);
      return true;
    });

    // Add new energy rings periodically
    if (!isMinimized && Math.random() < 0.01) {
      ringsRef.current.push(createEnergyRing());
    }

    // Draw connecting lines between nearby particles
    if (!isMinimized) {
      ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < particlesRef.current.length; i++) {
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const p1 = particlesRef.current[i];
          const p2 = particlesRef.current[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 80) {
            ctx.globalAlpha = (1 - dist / 80) * 0.3;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [isMinimized, vortexMode, drawParticle, drawEnergyRing, createEnergyRing]);

  // Initialize
  useEffect(() => {
    if (!isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Initialize particles
      particlesRef.current = [];
      const particleCount = 150;
      for (let i = 0; i < particleCount; i++) {
        const angle = (i / particleCount) * Math.PI * 2;
        const radius = 50 + Math.random() * (Math.min(canvas.width, canvas.height) * 0.35);
        particlesRef.current.push(createParticle(angle, radius));
      }
    };

    resize();
    window.addEventListener('resize', resize);
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isVisible, createParticle, animate]);

  // Mouse interaction
  useEffect(() => {
    if (!isVisible || isMinimized) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('input')) return;

      // Create burst of particles
      for (let i = 0; i < 20; i++) {
        const particle = createParticle();
        particle.x = e.clientX;
        particle.y = e.clientY;
        particle.radius = Math.random() * 100;
        particle.angle = Math.random() * Math.PI * 2;
        particlesRef.current.push(particle);
      }

      // Create energy ring
      ringsRef.current.push({
        x: e.clientX,
        y: e.clientY,
        radius: 10,
        maxRadius: 200,
        alpha: 1,
        color: VORTEX_COLORS[Math.floor(Math.random() * VORTEX_COLORS.length)],
        thickness: 3
      });

      // Limit particles
      if (particlesRef.current.length > 200) {
        particlesRef.current = particlesRef.current.slice(-200);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, [isVisible, isMinimized, createParticle]);

  if (!isVisible) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 pointer-events-none transition-opacity duration-500 ${
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
            onClick={() => setIsMinimized(false)}
            className="pointer-events-auto group p-4 bg-gradient-to-br from-cyan-500 via-purple-500 to-pink-500 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 animate-pulse"
            title="Expand Vortex"
          >
            <Wind className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-300 rounded-full animate-ping" />
          </button>
        ) : (
          <div className="pointer-events-auto flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-full p-2 shadow-xl border border-white/10">
            <button
              onClick={() => {
                const canvas = canvasRef.current;
                if (canvas) {
                  for (let i = 0; i < 5; i++) {
                    ringsRef.current.push(createEnergyRing());
                  }
                }
              }}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Add energy rings"
            >
              <Maximize2 className="w-5 h-5 text-cyan-400" />
            </button>

            <button
              onClick={() => {
                particlesRef.current.forEach(p => {
                  p.speed *= 3;
                });
                setTimeout(() => {
                  particlesRef.current.forEach(p => {
                    p.speed /= 3;
                  });
                }, 2000);
              }}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Speed boost"
            >
              <Zap className="w-5 h-5 text-yellow-400" />
            </button>

            <div className="flex items-center gap-1 px-2 border-l border-white/20">
              {(['spiral', 'tornado', 'galaxy'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setVortexMode(mode)}
                  className={`px-2 py-1 text-xs rounded-full transition-all ${
                    vortexMode === mode 
                      ? 'bg-purple-500 text-white' 
                      : 'bg-white/20 text-white/70 hover:bg-white/30'
                  }`}
                  title={`${mode} mode`}
                >
                  {mode.charAt(0).toUpperCase()}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
              title="Minimize"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            <button
              onClick={() => setIsVisible(false)}
              className="p-2 bg-white/90 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
              title="Close"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        )}
      </div>

      {/* Title overlay */}
      {!isMinimized && (
        <div className="fixed inset-0 pointer-events-none z-45 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 
              className="text-6xl sm:text-7xl md:text-8xl font-black animate-in zoom-in duration-1000"
              style={{
                background: 'linear-gradient(135deg, #00FFFF 0%, #9370DB 50%, #FF1493 100%)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                animation: 'gradient-shift 3s ease infinite',
                textShadow: '0 0 60px rgba(0, 255, 255, 0.5)'
              }}
            >
              Particle Vortex
            </h1>
            {customMessage && (
              <p 
                className="text-lg sm:text-xl md:text-2xl text-white/90 drop-shadow-lg animate-in fade-in duration-1000 max-w-2xl mx-auto mt-4"
                style={{ animationDelay: '0.3s' }}
              >
                {customMessage}
              </p>
            )}
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </>
  );
}
