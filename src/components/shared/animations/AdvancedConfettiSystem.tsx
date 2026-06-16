'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X } from 'lucide-react';

interface GlitterParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  decay: number;
  tilt: number;
  tiltAngle: number;
  tiltAngleIncrement: number;
}

interface StreamerParticle {
  x: number;
  y: number;
  rotation: number;
  color: string;
  width: number;
  height: number;
  physics: {
    x: number;
    y: number;
    angle: number;
    speed: number;
    friction: number;
    gravity: number;
  };
}

const GLITTER_COLORS = [
  '#FFD700', '#C0C0C0', '#FF69B4', '#00FF00', '#FF4500',
  '#1E90FF', '#FF1493', '#00FFFF', '#FFD700', '#ADFF2F'
];

const STREAMER_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
  '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'
];

export default function AdvancedConfettiSystem({ 
  customMessage,
  autoMinimize = true,
  minimizeDelay = 20000
}: { 
  customMessage?: string;
  autoMinimize?: boolean;
  minimizeDelay?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glitterRef = useRef<GlitterParticle[]>([]);
  const streamersRef = useRef<StreamerParticle[]>([]);
  const animationRef = useRef<number>();
  
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  // Burst mode state reserved for future enhancements

  const createGlitter = useCallback((x: number, y: number, count: number = 20) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 5 + Math.random() * 10;
      
      glitterRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 8,
        size: 4 + Math.random() * 6,
        color: GLITTER_COLORS[Math.floor(Math.random() * GLITTER_COLORS.length)],
        alpha: 1,
        decay: 0.01 + Math.random() * 0.01,
        tilt: Math.random() * 10 - 5,
        tiltAngle: Math.random() * Math.PI,
        tiltAngleIncrement: 0.05 + Math.random() * 0.1
      });
    }
  }, []);

  const createStreamer = useCallback((x: number, y: number) => {
    const angle = Math.random() * Math.PI * 2;
    streamersRef.current.push({
      x,
      y,
      rotation: Math.random() * 360,
      color: STREAMER_COLORS[Math.floor(Math.random() * STREAMER_COLORS.length)],
      width: 8 + Math.random() * 4,
      height: 15 + Math.random() * 15,
      physics: {
        x: Math.cos(angle) * (3 + Math.random() * 3),
        y: Math.sin(angle) * (3 + Math.random() * 3) - 5,
        angle: Math.random() * 360,
        speed: 0.5 + Math.random() * 2,
        friction: 0.97,
        gravity: 0.1
      }
    });
  }, []);

  const triggerBurst = useCallback((x?: number, y?: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const burstX = x ?? canvas.width / 2;
    const burstY = y ?? canvas.height / 3;

    // Create massive burst
    createGlitter(burstX, burstY, 100);
    
    // Create streamers
    for (let i = 0; i < 30; i++) {
      createStreamer(
        burstX + (Math.random() - 0.5) * 100,
        burstY + (Math.random() - 0.5) * 50
      );
    }
  }, [createGlitter, createStreamer]);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear with fade effect for trails
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Periodically add new particles from edges
    if (!isMinimized && Math.random() < 0.1) {
      const x = Math.random() * canvas.width;
      createGlitter(x, -10, 3);
    }

    if (!isMinimized && Math.random() < 0.03) {
      const x = Math.random() * canvas.width;
      createStreamer(x, -20);
    }

    // Update and draw glitter
    glitterRef.current = glitterRef.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15; // gravity
      p.vx *= 0.98;
      p.alpha -= p.decay;
      p.tiltAngle += p.tiltAngleIncrement;
      p.tilt = Math.sin(p.tiltAngle) * 15;

      if (p.alpha <= 0) return false;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.tilt * Math.PI) / 180);
      ctx.globalAlpha = p.alpha;

      // Draw glitter with shimmer effect
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
      gradient.addColorStop(0, '#FFFFFF');
      gradient.addColorStop(0.3, p.color);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      
      // Draw as diamond shape
      ctx.moveTo(0, -p.size);
      ctx.lineTo(p.size * 0.6, 0);
      ctx.lineTo(0, p.size);
      ctx.lineTo(-p.size * 0.6, 0);
      ctx.closePath();
      ctx.fill();

      // Add sparkle highlight
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.arc(-p.size * 0.2, -p.size * 0.2, p.size * 0.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      return true;
    });

    // Update and draw streamers
    streamersRef.current = streamersRef.current.filter(s => {
      s.physics.y += s.physics.gravity;
      s.x += s.physics.x;
      s.y += s.physics.y;
      s.rotation += s.physics.speed;
      s.physics.x *= s.physics.friction;
      s.physics.y *= s.physics.friction;

      // Remove if off screen
      if (s.y > canvas.height + 50) return false;

      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate((s.rotation * Math.PI) / 180);
      
      // Create wavy streamer effect
      ctx.fillStyle = s.color;
      ctx.beginPath();
      
      const wave = Math.sin(s.rotation * 0.1) * 5;
      ctx.moveTo(-s.width / 2, -s.height / 2);
      ctx.quadraticCurveTo(wave, 0, -s.width / 2, s.height / 2);
      ctx.lineTo(s.width / 2, s.height / 2);
      ctx.quadraticCurveTo(-wave, 0, s.width / 2, -s.height / 2);
      ctx.closePath();
      ctx.fill();

      // Add shine
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fillRect(-s.width / 4, -s.height / 2, s.width / 2, s.height);

      ctx.restore();
      return true;
    });

    animationRef.current = requestAnimationFrame(animate);
  }, [isMinimized, createGlitter, createStreamer]);

  // Setup canvas and animation
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
    setTimeout(() => triggerBurst(), 500);

    // Start animation
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, animate, triggerBurst]);

  // Click handler for interactive bursts
  useEffect(() => {
    if (!isVisible || isMinimized) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('input')) return;
      
      triggerBurst(e.clientX, e.clientY);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, [isVisible, isMinimized, triggerBurst]);

  // Auto minimize
  useEffect(() => {
    if (!autoMinimize || !isVisible) return;

    const timer = setTimeout(() => {
      setIsMinimized(true);
    }, minimizeDelay);

    return () => clearTimeout(timer);
  }, [autoMinimize, minimizeDelay, isVisible]);

  // Periodic bursts when not minimized
  useEffect(() => {
    if (!isVisible || isMinimized) return;

    const interval = setInterval(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      triggerBurst(
        100 + Math.random() * (canvas.width - 200),
        50 + Math.random() * (canvas.height * 0.3)
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isVisible, isMinimized, triggerBurst]);

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

      {/* Control buttons */}
      <div className={`fixed z-[70] transition-all duration-300 ${
        isMinimized ? 'bottom-4 right-4' : 'top-4 right-4'
      }`}>
        {isMinimized ? (
          <button
            onClick={() => {
              setIsMinimized(false);
              setTimeout(() => triggerBurst(), 100);
            }}
            className="pointer-events-auto group p-3 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full shadow-xl hover:scale-110 transition-transform"
            title="Expand confetti"
          >
            <span className="text-2xl">✨</span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping" />
          </button>
        ) : (
          <div className="pointer-events-auto flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full p-2">
            <button
              onClick={() => triggerBurst()}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
              title="Burst!"
            >
              💥
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

      {/* Message overlay - only when not minimized */}
      {!isMinimized && customMessage && (
        <div className="fixed inset-0 pointer-events-none z-45 flex items-end justify-center pb-32">
          <div className="text-center animate-in fade-in slide-in-from-bottom duration-1000">
            <p className="text-2xl md:text-3xl font-bold text-white drop-shadow-lg px-6 py-3 bg-black/20 backdrop-blur-sm rounded-full">
              {customMessage}
            </p>
          </div>
        </div>
      )}
    </>
  );
}
