'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Star, Zap, Compass } from 'lucide-react';

interface Star3D {
  x: number;
  y: number;
  z: number;
  size: number;
  color: string;
  alpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface ShootingStar {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: string;
  alpha: number;
  trail: { x: number; y: number; z: number; alpha: number }[];
}

interface NebulaCloud {
  x: number;
  y: number;
  z: number;
  radius: number;
  color: string;
  alpha: number;
  phase: number;
}

const STAR_COLORS = [
  '#FFFFFF', '#FFFACD', '#FFD700', '#FFA500', '#FF6347',
  '#87CEEB', '#00BFFF', '#1E90FF', '#9370DB', '#FF69B4'
];

const NEBULA_COLORS = [
  'rgba(138, 43, 226, 0.1)',
  'rgba(255, 0, 255, 0.1)',
  'rgba(0, 255, 255, 0.1)',
  'rgba(255, 100, 100, 0.1)',
  'rgba(100, 100, 255, 0.1)'
];

export default function Starfield3DAnimation({ customMessage }: { customMessage?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const starsRef = useRef<Star3D[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const nebulaeRef = useRef<NebulaCloud[]>([]);
  const timeRef = useRef(0);
  
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [speed, setSpeed] = useState(1);

  // Create 3D star
  const createStar = useCallback((): Star3D => {
    return {
      x: (Math.random() - 0.5) * 2000,
      y: (Math.random() - 0.5) * 2000,
      z: Math.random() * 2000,
      size: 0.5 + Math.random() * 2,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      alpha: 0.5 + Math.random() * 0.5,
      twinkleSpeed: 0.5 + Math.random() * 2,
      twinklePhase: Math.random() * Math.PI * 2
    };
  }, []);

  // Create shooting star
  const createShootingStar = useCallback((): ShootingStar => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return {
        x: 0, y: 0, z: 0, vx: 0, vy: 0, vz: 0, size: 0, color: '', alpha: 0, trail: []
      };
    }

    return {
      x: (Math.random() - 0.5) * canvas.width,
      y: (Math.random() - 0.5) * canvas.height,
      z: 500 + Math.random() * 500,
      vx: (Math.random() - 0.5) * 10,
      vy: (Math.random() - 0.5) * 10,
      vz: -15 - Math.random() * 10,
      size: 2 + Math.random() * 2,
      color: '#FFFFFF',
      alpha: 1,
      trail: []
    };
  }, []);

  // Create nebula cloud
  const createNebula = useCallback((): NebulaCloud => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { x: 0, y: 0, z: 0, radius: 0, color: '', alpha: 0, phase: 0 };
    }

    return {
      x: (Math.random() - 0.5) * canvas.width,
      y: (Math.random() - 0.5) * canvas.height,
      z: 200 + Math.random() * 300,
      radius: 100 + Math.random() * 200,
      color: NEBULA_COLORS[Math.floor(Math.random() * NEBULA_COLORS.length)],
      alpha: 0.3 + Math.random() * 0.3,
      phase: Math.random() * Math.PI * 2
    };
  }, []);

  // Project 3D to 2D
  const project3D = useCallback((x: number, y: number, z: number, width: number, height: number) => {
    const fov = 500;
    const scale = fov / (fov + z);
    return {
      x: width / 2 + x * scale,
      y: height / 2 + y * scale,
      scale
    };
  }, []);

  // Draw star
  const drawStar = useCallback((ctx: CanvasRenderingContext2D, star: Star3D, width: number, height: number) => {
    const projected = project3D(star.x, star.y, star.z, width, height);
    if (projected.scale <= 0) return;

    const twinkle = 0.5 + Math.sin(timeRef.current * star.twinkleSpeed + star.twinklePhase) * 0.5;
    const size = star.size * projected.scale * twinkle;

    // Glow
    const gradient = ctx.createRadialGradient(projected.x, projected.y, 0, projected.x, projected.y, size * 3);
    gradient.addColorStop(0, star.color + Math.floor(star.alpha * 255).toString(16).padStart(2, '0'));
    gradient.addColorStop(0.5, star.color + Math.floor(star.alpha * 128).toString(16).padStart(2, '0'));
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(projected.x, projected.y, size * 3, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(projected.x, projected.y, size, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.globalAlpha = star.alpha * twinkle;
    ctx.fill();
    ctx.globalAlpha = 1;
  }, [project3D]);

  // Draw shooting star
  const drawShootingStar = useCallback((ctx: CanvasRenderingContext2D, star: ShootingStar, width: number, height: number) => {
    const projected = project3D(star.x, star.y, star.z, width, height);
    if (projected.scale <= 0) return;

    // Draw trail
    star.trail.forEach((point, i) => {
      const p = project3D(point.x, point.y, point.z, width, height);
      if (p.scale <= 0) return;

      const alpha = (i / star.trail.length) * point.alpha * 0.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, star.size * p.scale * (i / star.trail.length), 0, Math.PI * 2);
      ctx.fillStyle = star.color + Math.floor(alpha * 255).toString(16).padStart(2, '0');
      ctx.fill();
    });

    // Draw star
    const gradient = ctx.createRadialGradient(projected.x, projected.y, 0, projected.x, projected.y, star.size * projected.scale * 4);
    gradient.addColorStop(0, '#FFFFFF');
    gradient.addColorStop(0.3, star.color + Math.floor(star.alpha * 200).toString(16).padStart(2, '0'));
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(projected.x, projected.y, star.size * projected.scale * 4, 0, Math.PI * 2);
    ctx.fill();
  }, [project3D]);

  // Draw nebula
  const drawNebula = useCallback((ctx: CanvasRenderingContext2D, nebula: NebulaCloud, width: number, height: number) => {
    const projected = project3D(nebula.x, nebula.y, nebula.z, width, height);
    if (projected.scale <= 0) return;

    const pulse = 0.8 + Math.sin(timeRef.current * 0.5 + nebula.phase) * 0.2;
    const radius = nebula.radius * projected.scale * pulse;

    const gradient = ctx.createRadialGradient(projected.x, projected.y, 0, projected.x, projected.y, radius);
    gradient.addColorStop(0, nebula.color.replace('0.1', (nebula.alpha * 0.5).toString()));
    gradient.addColorStop(0.5, nebula.color.replace('0.1', (nebula.alpha * 0.2).toString()));
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(projected.x, projected.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }, [project3D]);

  // Main animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    timeRef.current += 0.016 * speed;

    // Clear with fade
    ctx.fillStyle = isMinimized ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw nebulae (background layer)
    nebulaeRef.current.forEach(nebula => {
      drawNebula(ctx, nebula, canvas.width, canvas.height);
    });

    // Update and draw stars
    starsRef.current.forEach(star => {
      star.z -= 2 * speed;
      if (star.z < -100) {
        star.z = 2000;
        star.x = (Math.random() - 0.5) * 2000;
        star.y = (Math.random() - 0.5) * 2000;
      }
      drawStar(ctx, star, canvas.width, canvas.height);
    });

    // Update and draw shooting stars
    shootingStarsRef.current = shootingStarsRef.current.filter(star => {
      star.x += star.vx * speed;
      star.y += star.vy * speed;
      star.z += star.vz * speed;
      star.alpha -= 0.01 * speed;

      // Add trail point
      star.trail.push({ x: star.x, y: star.y, z: star.z, alpha: star.alpha });
      if (star.trail.length > 20) star.trail.shift();

      if (star.alpha <= 0 || star.z < -100) return false;

      drawShootingStar(ctx, star, canvas.width, canvas.height);
      return true;
    });

    // Spawn shooting stars
    if (!isMinimized && Math.random() < 0.005 * speed) {
      shootingStarsRef.current.push(createShootingStar());
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [isMinimized, speed, drawStar, drawShootingStar, drawNebula, createShootingStar]);

  // Initialize
  useEffect(() => {
    if (!isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Initialize stars
      starsRef.current = [];
      for (let i = 0; i < 500; i++) {
        starsRef.current.push(createStar());
      }

      // Initialize nebulae
      nebulaeRef.current = [];
      for (let i = 0; i < 5; i++) {
        nebulaeRef.current.push(createNebula());
      }
    };

    resize();
    window.addEventListener('resize', resize);
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isVisible, createStar, createNebula, animate]);

  // Click interaction
  useEffect(() => {
    if (!isVisible || isMinimized) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('input')) return;

      // Create shooting star from click
      const star = createShootingStar();
      star.x = e.clientX - canvasRef.current!.width / 2;
      star.y = e.clientY - canvasRef.current!.height / 2;
      star.z = 500;
      star.vx = (Math.random() - 0.5) * 5;
      star.vy = (Math.random() - 0.5) * 5;
      star.vz = -20;
      shootingStarsRef.current.push(star);

      // Add nebula at click
      const nebula = createNebula();
      nebula.x = e.clientX - canvasRef.current!.width / 2;
      nebula.y = e.clientY - canvasRef.current!.height / 2;
      nebula.z = 300;
      nebulaeRef.current.push(nebula);

      // Limit nebulae
      if (nebulaeRef.current.length > 8) {
        nebulaeRef.current = nebulaeRef.current.slice(-8);
      }
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isVisible, isMinimized, createShootingStar, createNebula]);

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
            className="pointer-events-auto group p-4 bg-gradient-to-br from-indigo-600 via-purple-500 to-pink-500 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 animate-pulse"
            title="Expand Starfield"
          >
            <Star className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-300 rounded-full animate-ping" />
          </button>
        ) : (
          <div className="pointer-events-auto flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-full p-2 shadow-xl border border-white/10">
            <button
              onClick={() => {
                for (let i = 0; i < 5; i++) {
                  setTimeout(() => {
                    shootingStarsRef.current.push(createShootingStar());
                  }, i * 100);
                }
              }}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Shooting stars"
            >
              <Zap className="w-5 h-5 text-yellow-400" />
            </button>

            <button
              onClick={() => {
                nebulaeRef.current.push(createNebula());
                if (nebulaeRef.current.length > 8) {
                  nebulaeRef.current = nebulaeRef.current.slice(-8);
                }
              }}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Add nebula"
            >
              <Compass className="w-5 h-5 text-purple-400" />
            </button>

            <div className="flex items-center gap-1 px-2 border-l border-white/20">
              {[0.5, 1, 2].map((s) => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`w-6 h-6 rounded-full transition-all flex items-center justify-center text-xs font-bold ${
                    speed === s 
                      ? 'bg-indigo-500 text-white scale-110' 
                      : 'bg-white/20 text-white/70 hover:bg-white/30'
                  }`}
                  title={`${s}x speed`}
                >
                  {s}x
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
                background: 'linear-gradient(135deg, #4F46E5 0%, #9333EA 50%, #EC4899 100%)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                animation: 'gradient-shift 3s ease infinite',
                textShadow: '0 0 60px rgba(79, 70, 229, 0.5)'
              }}
            >
              Starfield 3D
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
