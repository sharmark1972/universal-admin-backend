'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Waves, Zap, Layers } from 'lucide-react';

interface WavePoint {
  x: number;
  y: number;
  z: number;
  baseY: number;
  phase: number;
  amplitude: number;
  frequency: number;
}

interface NeonParticle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

const NEON_COLORS = [
  '#FF00FF', '#00FFFF', '#FF0080', '#00FF80', '#8000FF',
  '#FF8000', '#00FFFF', '#FF1493', '#00FF7F', '#FF69B4'
];

export default function NeonWaveAnimation({ customMessage }: { customMessage?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const wavesRef = useRef<WavePoint[][]>([]);
  const particlesRef = useRef<NeonParticle[]>([]);
  const timeRef = useRef(0);
  
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [waveCount, setWaveCount] = useState(5);

  // Create wave points
  const createWave = useCallback((y: number, phaseOffset: number, amplitude: number): WavePoint[] => {
    const canvas = canvasRef.current;
    if (!canvas) return [];

    const points: WavePoint[] = [];
    const pointCount = 100;

    for (let i = 0; i <= pointCount; i++) {
      points.push({
        x: (i / pointCount) * canvas.width,
        y,
        z: 0,
        baseY: y,
        phase: phaseOffset + (i / pointCount) * Math.PI * 4,
        amplitude: amplitude * (0.5 + Math.random() * 0.5),
        frequency: 1 + Math.random() * 2
      });
    }

    return points;
  }, []);

  // Create neon particle
  const createParticle = useCallback((x: number, y: number): NeonParticle => {
    return {
      x,
      y,
      z: Math.random() * 100 - 50,
      vx: (Math.random() - 0.5) * 2,
      vy: -1 - Math.random() * 2,
      size: 2 + Math.random() * 4,
      color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
      alpha: 1,
      life: 0,
      maxLife: 100 + Math.random() * 100
    };
  }, []);

  // Draw wave with neon glow
  const drawWave = useCallback((ctx: CanvasRenderingContext2D, wave: WavePoint[], color: string, time: number) => {
    if (wave.length < 2) return;

    // Calculate wave points
    const points = wave.map(point => ({
      x: point.x,
      y: point.baseY + Math.sin(point.phase + time * point.frequency) * point.amplitude
    }));

    // Draw glow
    ctx.shadowBlur = 20;
    ctx.shadowColor = color;

    // Draw filled area
    const gradient = ctx.createLinearGradient(0, points[0].y - 50, 0, points[0].y + 50);
    gradient.addColorStop(0, color + '00');
    gradient.addColorStop(0.5, color + '30');
    gradient.addColorStop(1, color + '00');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const xc = (points[i].x + points[i - 1].x) / 2;
      const yc = (points[i].y + points[i - 1].y) / 2;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
    }
    ctx.lineTo(points[points.length - 1].x, canvasRef.current?.height || 0);
    ctx.lineTo(points[0].x, canvasRef.current?.height || 0);
    ctx.closePath();
    ctx.fill();

    // Draw line
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const xc = (points[i].x + points[i - 1].x) / 2;
      const yc = (points[i].y + points[i - 1].y) / 2;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, xc, yc);
    }
    ctx.stroke();

    // Draw points
    points.forEach((point, i) => {
      if (i % 10 === 0) {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#FFFFFF';
        ctx.fill();
      }
    });

    ctx.shadowBlur = 0;
  }, []);

  // Draw neon particle
  const drawParticle = useCallback((ctx: CanvasRenderingContext2D, particle: NeonParticle) => {
    // Glow
    const gradient = ctx.createRadialGradient(particle.x, particle.y, 0, particle.x, particle.y, particle.size * 3);
    gradient.addColorStop(0, particle.color + Math.floor(particle.alpha * 255).toString(16).padStart(2, '0'));
    gradient.addColorStop(0.5, particle.color + Math.floor(particle.alpha * 128).toString(16).padStart(2, '0'));
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
    ctx.fill();

    // Core
    ctx.beginPath();
    ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.globalAlpha = particle.alpha;
    ctx.fill();
    ctx.globalAlpha = 1;
  }, []);

  // Main animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    timeRef.current += 0.016;

    // Clear with fade
    ctx.fillStyle = isMinimized ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw background grid
    if (!isMinimized) {
      ctx.strokeStyle = 'rgba(255, 0, 255, 0.05)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      const offset = (timeRef.current * 30) % gridSize;

      for (let x = offset; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = offset; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }
    }

    // Draw waves
    wavesRef.current.forEach((wave, i) => {
      const color = NEON_COLORS[i % NEON_COLORS.length];
      drawWave(ctx, wave, color, timeRef.current);
    });

    // Update and draw particles
    particlesRef.current = particlesRef.current.filter(particle => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.life++;
      particle.alpha = Math.max(0, 1 - particle.life / particle.maxLife);

      if (particle.alpha <= 0) return false;

      drawParticle(ctx, particle);
      return true;
    });

    // Add new particles from wave peaks
    if (!isMinimized && Math.random() < 0.1) {
      const waveIndex = Math.floor(Math.random() * wavesRef.current.length);
      const wave = wavesRef.current[waveIndex];
      const pointIndex = Math.floor(Math.random() * wave.length);
      const point = wave[pointIndex];
      const y = point.baseY + Math.sin(point.phase + timeRef.current * point.frequency) * point.amplitude;
      particlesRef.current.push(createParticle(point.x, y));
    }

    animationRef.current = requestAnimationFrame(animate);
  }, [isMinimized, drawWave, drawParticle, createParticle]);

  // Initialize
  useEffect(() => {
    if (!isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Initialize waves
      wavesRef.current = [];
      const spacing = canvas.height / (waveCount + 1);

      for (let i = 0; i < waveCount; i++) {
        const y = spacing * (i + 1);
        const phaseOffset = i * 0.5;
        const amplitude = 30 + Math.random() * 30;
        wavesRef.current.push(createWave(y, phaseOffset, amplitude));
      }
    };

    resize();
    window.addEventListener('resize', resize);
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isVisible, waveCount, createWave, animate]);

  // Click interaction
  useEffect(() => {
    if (!isVisible || isMinimized) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('input')) return;

      // Create burst of particles
      for (let i = 0; i < 30; i++) {
        const particle = createParticle(e.clientX, e.clientY);
        particle.vx = (Math.random() - 0.5) * 8;
        particle.vy = (Math.random() - 0.5) * 8;
        particlesRef.current.push(particle);
      }

      // Add temporary wave
      const tempWave = createWave(e.clientY, 0, 50);
      wavesRef.current.push(tempWave);
      setTimeout(() => {
        wavesRef.current = wavesRef.current.filter(w => w !== tempWave);
      }, 2000);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isVisible, isMinimized, createParticle, createWave]);

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
            className="pointer-events-auto group p-4 bg-gradient-to-br from-pink-500 via-purple-500 to-cyan-500 rounded-full shadow-2xl hover:scale-110 transition-all duration-300 animate-pulse"
            title="Expand Neon Waves"
          >
            <Waves className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-pink-300 rounded-full animate-ping" />
          </button>
        ) : (
          <div className="pointer-events-auto flex items-center gap-2 bg-black/30 backdrop-blur-md rounded-full p-2 shadow-xl border border-white/10">
            <button
              onClick={() => {
                const canvas = canvasRef.current;
                if (canvas) {
                  for (let i = 0; i < 50; i++) {
                    const particle = createParticle(
                      Math.random() * canvas.width,
                      canvas.height
                    );
                    particlesRef.current.push(particle);
                  }
                }
              }}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Particle burst"
            >
              <Zap className="w-5 h-5 text-pink-400" />
            </button>

            <button
              onClick={() => {
                wavesRef.current.forEach(wave => {
                  wave.forEach(point => {
                    point.amplitude *= 2;
                  });
                });
                setTimeout(() => {
                  wavesRef.current.forEach(wave => {
                    wave.forEach(point => {
                      point.amplitude /= 2;
                    });
                  });
                }, 2000);
              }}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Amplify waves"
            >
              <Layers className="w-5 h-5 text-cyan-400" />
            </button>

            <div className="flex items-center gap-1 px-2 border-l border-white/20">
              {[3, 5, 7].map((count) => (
                <button
                  key={count}
                  onClick={() => setWaveCount(count)}
                  className={`w-6 h-6 rounded-full transition-all flex items-center justify-center text-xs font-bold ${
                    waveCount === count 
                      ? 'bg-pink-500 text-white scale-110' 
                      : 'bg-white/20 text-white/70 hover:bg-white/30'
                  }`}
                  title={`${count} waves`}
                >
                  {count}
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
                background: 'linear-gradient(135deg, #FF00FF 0%, #00FFFF 50%, #FF0080 100%)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                animation: 'gradient-shift 3s ease infinite',
                textShadow: '0 0 60px rgba(255, 0, 255, 0.5)'
              }}
            >
              Neon Waves
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
