'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Zap } from 'lucide-react';

interface RocketParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  type: 'spark' | 'smoke' | 'trail';
}

interface Rocket {
  id: number;
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  speed: number;
  angle: number;
  exploded: boolean;
  color: string;
  trail: { x: number; y: number; alpha: number }[];
  explosionParticles: ExplosionParticle[];
  pattern: 'circle' | 'heart' | 'star' | 'spiral' | 'double' | 'ring';
}

interface ExplosionParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  gravity: number;
  hasTrail: boolean;
  trail: { x: number; y: number; alpha: number }[];
}

const EXPLOSION_COLORS = [
  ['#FF0000', '#FF4500', '#FFD700'], // Fire
  ['#00FF00', '#32CD32', '#7FFF00'], // Green
  ['#0000FF', '#1E90FF', '#00BFFF'], // Blue
  ['#FF69B4', '#FF1493', '#FFB6C1'], // Pink
  ['#FFD700', '#FFA500', '#FF8C00'], // Gold
  ['#8B00FF', '#9400D3', '#DA70D6'], // Purple
  ['#00FFFF', '#40E0D0', '#48D1CC'], // Cyan
  ['#FFFFFF', '#F5F5F5', '#DCDCDC'], // White
];

export default function FireworksSpectacular({ 
  customMessage,
  year = new Date().getFullYear()
}: { 
  customMessage?: string;
  year?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rocketsRef = useRef<Rocket[]>([]);
  const particlesRef = useRef<RocketParticle[]>([]);
  const animationRef = useRef<number>();
  const rocketIdRef = useRef(0);
  
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [autoLaunch, setAutoLaunch] = useState(true);

  // Create explosion pattern
  const createExplosion = useCallback((rocket: Rocket, pattern: Rocket['pattern']) => {
    const colors = EXPLOSION_COLORS[Math.floor(Math.random() * EXPLOSION_COLORS.length)];
    const particles: ExplosionParticle[] = [];
    
    const createParticle = (angle: number, speed: number, hasTrail: boolean = true) => ({
      x: rocket.x,
      y: rocket.y,
      vx: Math.cos(angle) * speed * (0.5 + Math.random() * 0.5),
      vy: Math.sin(angle) * speed * (0.5 + Math.random() * 0.5),
      size: 2 + Math.random() * 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: 0.008 + Math.random() * 0.008,
      gravity: 0.03,
      hasTrail,
      trail: []
    });

    switch (pattern) {
      case 'circle':
        for (let i = 0; i < 100; i++) {
          const angle = (i / 100) * Math.PI * 2;
          particles.push(createParticle(angle, 4 + Math.random() * 4));
        }
        break;
        
      case 'heart':
        for (let i = 0; i < 80; i++) {
          const t = (i / 80) * Math.PI * 2;
          const heartX = 16 * Math.pow(Math.sin(t), 3);
          const heartY = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
          const angle = Math.atan2(heartY, heartX);
          const speed = Math.sqrt(heartX * heartX + heartY * heartY) * 0.3;
          particles.push(createParticle(angle, speed));
        }
        break;
        
      case 'star':
        for (let i = 0; i < 60; i++) {
          const isPoint = i % 6 === 0;
          const angle = (i / 60) * Math.PI * 2;
          const speed = isPoint ? 8 : 4;
          particles.push(createParticle(angle, speed));
        }
        // Add center burst
        for (let i = 0; i < 30; i++) {
          const angle = Math.random() * Math.PI * 2;
          particles.push(createParticle(angle, 2 + Math.random() * 2, false));
        }
        break;
        
      case 'spiral':
        for (let i = 0; i < 80; i++) {
          const angle = (i / 80) * Math.PI * 6;
          const speed = 2 + (i / 80) * 6;
          particles.push(createParticle(angle, speed));
        }
        break;
        
      case 'double':
        // Inner ring
        for (let i = 0; i < 50; i++) {
          const angle = (i / 50) * Math.PI * 2;
          particles.push(createParticle(angle, 3));
        }
        // Outer ring
        for (let i = 0; i < 70; i++) {
          const angle = (i / 70) * Math.PI * 2;
          particles.push(createParticle(angle, 7));
        }
        break;
        
      case 'ring': {
        const ringCount = 3;
        for (let r = 0; r < ringCount; r++) {
          const particleCount = 30 + r * 20;
          for (let i = 0; i < particleCount; i++) {
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = 3 + r * 2.5;
            const particle = createParticle(angle, speed);
            particle.color = colors[r % colors.length];
            particles.push(particle);
          }
        }
        break;
      }
    }
    
    return particles;
  }, []);

  // Launch a rocket
  const launchRocket = useCallback((x?: number, targetX?: number, targetY?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const patterns: Rocket['pattern'][] = ['circle', 'heart', 'star', 'spiral', 'double', 'ring'];
    const startX = x ?? 50 + Math.random() * (canvas.width - 100);
    const endX = targetX ?? startX + (Math.random() - 0.5) * 200;
    const endY = targetY ?? 80 + Math.random() * (canvas.height * 0.35);

    const colors = EXPLOSION_COLORS[Math.floor(Math.random() * EXPLOSION_COLORS.length)];

    rocketsRef.current.push({
      id: rocketIdRef.current++,
      x: startX,
      y: canvas.height + 20,
      targetX: endX,
      targetY: endY,
      speed: 12 + Math.random() * 6,
      angle: 0,
      exploded: false,
      color: colors[0],
      trail: [],
      explosionParticles: [],
      pattern: patterns[Math.floor(Math.random() * patterns.length)]
    });
  }, []);

  // Main animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear with fade for trails
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Auto launch rockets
    if (autoLaunch && !isMinimized && Math.random() < 0.02 && rocketsRef.current.length < 5) {
      launchRocket();
    }

    // Update and draw rockets
    rocketsRef.current = rocketsRef.current.filter(rocket => {
      if (!rocket.exploded) {
        // Calculate direction to target
        const dx = rocket.targetX - rocket.x;
        const dy = rocket.targetY - rocket.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < rocket.speed) {
          // Explode!
          rocket.exploded = true;
          rocket.explosionParticles = createExplosion(rocket, rocket.pattern);
          return true;
        }

        // Move towards target
        rocket.angle = Math.atan2(dy, dx);
        rocket.x += Math.cos(rocket.angle) * rocket.speed;
        rocket.y += Math.sin(rocket.angle) * rocket.speed;

        // Add trail point
        rocket.trail.push({ x: rocket.x, y: rocket.y, alpha: 1 });
        if (rocket.trail.length > 15) rocket.trail.shift();

        // Draw trail
        rocket.trail.forEach((point, i) => {
          const alpha = (i / rocket.trail.length) * 0.8;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 2 + (i / rocket.trail.length) * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 200, 100, ${alpha})`;
          ctx.fill();
        });

        // Draw rocket
        ctx.save();
        ctx.translate(rocket.x, rocket.y);
        ctx.rotate(rocket.angle + Math.PI / 2);
        
        // Rocket body
        const gradient = ctx.createLinearGradient(0, -10, 0, 10);
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.5, rocket.color);
        gradient.addColorStop(1, '#FFA500');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.moveTo(0, -10);
        ctx.lineTo(-4, 10);
        ctx.lineTo(4, 10);
        ctx.closePath();
        ctx.fill();

        // Rocket glow
        const glowGradient = ctx.createRadialGradient(0, 5, 0, 0, 5, 15);
        glowGradient.addColorStop(0, 'rgba(255, 150, 0, 0.8)');
        glowGradient.addColorStop(1, 'transparent');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(0, 8, 15, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();

        // Add spark particles
        if (Math.random() < 0.5) {
          particlesRef.current.push({
            x: rocket.x + (Math.random() - 0.5) * 6,
            y: rocket.y + 10,
            vx: (Math.random() - 0.5) * 2,
            vy: 2 + Math.random() * 2,
            size: 1 + Math.random() * 2,
            color: '#FFA500',
            alpha: 1,
            type: 'spark'
          });
        }

        return true;
      } else {
        // Update explosion particles
        let hasLiveParticles = false;
        
        rocket.explosionParticles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += p.gravity;
          p.vx *= 0.99;
          p.vy *= 0.99;
          p.alpha -= p.decay;

          if (p.alpha > 0) {
            hasLiveParticles = true;

            // Add trail
            if (p.hasTrail && p.trail.length < 8) {
              p.trail.push({ x: p.x, y: p.y, alpha: p.alpha });
            }
            if (p.trail.length > 8) p.trail.shift();

            // Draw trail
            p.trail.forEach((t, i) => {
              ctx.beginPath();
              ctx.arc(t.x, t.y, p.size * (i / p.trail.length), 0, Math.PI * 2);
              ctx.fillStyle = p.color + Math.floor(t.alpha * 100).toString(16).padStart(2, '0');
              ctx.fill();
            });

            // Draw particle with glow
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 3);
            gradient.addColorStop(0, p.color);
            gradient.addColorStop(0.5, p.color + '80');
            gradient.addColorStop(1, 'transparent');
            
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 3, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        });

        return hasLiveParticles;
      }
    });

    // Update and draw loose particles
    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.02;

      if (p.alpha <= 0) return false;

      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      return true;
    });

    animationRef.current = requestAnimationFrame(animate);
  }, [autoLaunch, isMinimized, launchRocket, createExplosion]);

  // Setup canvas
  useEffect(() => {
    if (!isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Initial burst
    setTimeout(() => {
      for (let i = 0; i < 3; i++) {
        setTimeout(() => launchRocket(), i * 300);
      }
    }, 500);

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isVisible, animate, launchRocket]);

  // Click to launch
  useEffect(() => {
    if (!isVisible) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('input')) return;
      
      launchRocket(e.clientX, e.clientX, e.clientY);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isVisible, launchRocket]);

  // Auto minimize
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      setIsMinimized(true);
    }, 30000);

    return () => clearTimeout(timer);
  }, [isVisible]);

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
            onClick={() => {
              setIsMinimized(false);
              for (let i = 0; i < 3; i++) {
                setTimeout(() => launchRocket(), i * 200);
              }
            }}
            className="pointer-events-auto group p-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-full shadow-xl hover:scale-110 transition-transform animate-pulse"
            title="Expand fireworks"
          >
            <span className="text-2xl">🎆</span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
          </button>
        ) : (
          <div className="pointer-events-auto flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full p-2">
            <button
              onClick={() => {
                for (let i = 0; i < 5; i++) {
                  setTimeout(() => launchRocket(), i * 100);
                }
              }}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Launch barrage!"
            >
              <Zap className="w-5 h-5 text-yellow-400" />
            </button>
            <button
              onClick={() => setAutoLaunch(!autoLaunch)}
              className={`p-2 rounded-full transition-colors ${autoLaunch ? 'bg-green-500/30' : 'hover:bg-white/20'}`}
              title={autoLaunch ? 'Auto launch ON' : 'Auto launch OFF'}
            >
              <span className="text-lg">{autoLaunch ? '🚀' : '💤'}</span>
            </button>
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
              title="Minimize"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
              title="Close"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        )}
      </div>

      {/* Year display - only when not minimized */}
      {!isMinimized && (
        <div className="fixed inset-0 pointer-events-none z-45 flex items-center justify-center">
          <div className="text-center">
            <h1 
              className="text-7xl md:text-9xl font-black animate-in zoom-in duration-1000"
              style={{
                background: 'linear-gradient(135deg, #FFD700 0%, #FF6B6B 30%, #4ECDC4 60%, #FF69B4 100%)',
                backgroundSize: '300% 300%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                animation: 'gradient-shift 3s ease infinite',
                textShadow: '0 0 100px rgba(255, 215, 0, 0.6)'
              }}
            >
              {year}
            </h1>
            <h2 className="text-3xl md:text-5xl font-bold text-white mt-4 drop-shadow-lg animate-in fade-in slide-in-from-bottom duration-1000" style={{ animationDelay: '300ms' }}>
              Happy New Year! 🎉
            </h2>
            {customMessage && (
              <p className="text-xl text-white/90 mt-4 drop-shadow-lg animate-in fade-in duration-1000" style={{ animationDelay: '600ms' }}>
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
