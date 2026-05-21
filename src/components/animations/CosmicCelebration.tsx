'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X, Sparkles } from 'lucide-react';

interface Star {
  x: number;
  y: number;
  z: number;
  size: number;
  brightness: number;
  color: string;
  twinkleSpeed: number;
  twinklePhase: number;
}

interface ShootingStar {
  x: number;
  y: number;
  vx: number;
  vy: number;
  length: number;
  life: number;
  color: string;
}

interface Nebula {
  x: number;
  y: number;
  radius: number;
  colors: string[];
  rotation: number;
  rotationSpeed: number;
}

interface CosmicDust {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
}

const STAR_COLORS = ['#FFFFFF', '#FFE4B5', '#87CEEB', '#FFB6C1', '#E6E6FA', '#F0E68C'];
const NEBULA_COLORS = [
  ['#FF6B6B', '#4ECDC4', '#45B7D1'],
  ['#A855F7', '#EC4899', '#F97316'],
  ['#06B6D4', '#3B82F6', '#8B5CF6'],
  ['#10B981', '#84CC16', '#FBBF24']
];

export default function CosmicCelebration({ 
  customMessage,
  enableInteraction = true
}: { 
  customMessage?: string;
  enableInteraction?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const shootingStarsRef = useRef<ShootingStar[]>([]);
  const nebulaeRef = useRef<Nebula[]>([]);
  const cosmicDustRef = useRef<CosmicDust[]>([]);
  const animationRef = useRef<number>();
  const timeRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0, active: false });
  
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showWish, setShowWish] = useState(true);

  // Initialize stars
  const initializeStars = useCallback((width: number, height: number) => {
    starsRef.current = Array.from({ length: 200 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      z: Math.random() * 3,
      size: 0.5 + Math.random() * 2,
      brightness: 0.3 + Math.random() * 0.7,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
      twinkleSpeed: 0.02 + Math.random() * 0.05,
      twinklePhase: Math.random() * Math.PI * 2
    }));
  }, []);

  // Initialize nebulae
  const initializeNebulae = useCallback((width: number, height: number) => {
    nebulaeRef.current = Array.from({ length: 3 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      radius: 100 + Math.random() * 200,
      colors: NEBULA_COLORS[Math.floor(Math.random() * NEBULA_COLORS.length)],
      rotation: Math.random() * 360,
      rotationSpeed: 0.05 + Math.random() * 0.1
    }));
  }, []);

  const createShootingStar = useCallback((width: number, height: number) => {
    const startSide = Math.random() < 0.5 ? 'top' : 'right';
    let x, y, vx, vy;
    
    if (startSide === 'top') {
      x = Math.random() * width;
      y = -50;
      vx = (Math.random() - 0.5) * 4;
      vy = 8 + Math.random() * 8;
    } else {
      x = width + 50;
      y = Math.random() * height * 0.5;
      vx = -(8 + Math.random() * 8);
      vy = 2 + Math.random() * 4;
    }

    shootingStarsRef.current.push({
      x, y, vx, vy,
      length: 50 + Math.random() * 100,
      life: 1,
      color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]
    });
  }, []);

  const createCosmicDust = useCallback((x: number, y: number, count: number = 20) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 3;
      cosmicDustRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 1 + Math.random() * 3,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)],
        alpha: 1
      });
    }
  }, []);

  // Main animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    timeRef.current += 0.016; // ~60fps

    // Clear with fade for trail effect
    ctx.fillStyle = isMinimized ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw nebulae (background layer)
    if (!isMinimized) {
      nebulaeRef.current.forEach(nebula => {
        nebula.rotation += nebula.rotationSpeed;
        
        ctx.save();
        ctx.translate(nebula.x, nebula.y);
        ctx.rotate((nebula.rotation * Math.PI) / 180);
        
        // Create nebula gradient
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, nebula.radius);
        gradient.addColorStop(0, nebula.colors[0] + '30');
        gradient.addColorStop(0.5, nebula.colors[1] + '15');
        gradient.addColorStop(1, 'transparent');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.ellipse(0, 0, nebula.radius, nebula.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      });
    }

    // Draw and update stars
    starsRef.current.forEach(star => {
      star.twinklePhase += star.twinkleSpeed;
      const twinkle = 0.5 + Math.sin(star.twinklePhase) * 0.5;
      const currentBrightness = star.brightness * twinkle;
      
      // Parallax effect based on mouse
      let offsetX = 0, offsetY = 0;
      if (mouseRef.current.active && enableInteraction) {
        offsetX = (mouseRef.current.x - canvas.width / 2) * star.z * 0.01;
        offsetY = (mouseRef.current.y - canvas.height / 2) * star.z * 0.01;
      }

      ctx.save();
      ctx.globalAlpha = currentBrightness;
      
      // Draw star glow
      const glowSize = star.size * (2 + twinkle);
      const gradient = ctx.createRadialGradient(
        star.x + offsetX, star.y + offsetY, 0,
        star.x + offsetX, star.y + offsetY, glowSize
      );
      gradient.addColorStop(0, star.color);
      gradient.addColorStop(0.5, star.color + '40');
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(star.x + offsetX, star.y + offsetY, glowSize, 0, Math.PI * 2);
      ctx.fill();

      // Draw star center
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(star.x + offsetX, star.y + offsetY, star.size * 0.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });

    // Draw shooting stars
    if (!isMinimized && Math.random() < 0.01) {
      createShootingStar(canvas.width, canvas.height);
    }

    shootingStarsRef.current = shootingStarsRef.current.filter(star => {
      star.x += star.vx;
      star.y += star.vy;
      star.life -= 0.015;

      if (star.life <= 0) return false;

      ctx.save();
      ctx.globalAlpha = star.life;
      
      // Draw trail
      const gradient = ctx.createLinearGradient(
        star.x, star.y,
        star.x - star.vx * star.length * 0.5,
        star.y - star.vy * star.length * 0.5
      );
      gradient.addColorStop(0, star.color);
      gradient.addColorStop(1, 'transparent');
      
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(star.x, star.y);
      ctx.lineTo(
        star.x - star.vx * star.length * 0.3,
        star.y - star.vy * star.length * 0.3
      );
      ctx.stroke();

      // Draw bright head
      const headGradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, 8);
      headGradient.addColorStop(0, '#FFFFFF');
      headGradient.addColorStop(0.5, star.color);
      headGradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = headGradient;
      ctx.beginPath();
      ctx.arc(star.x, star.y, 8, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
      return true;
    });

    // Draw cosmic dust
    cosmicDustRef.current = cosmicDustRef.current.filter(dust => {
      dust.x += dust.vx;
      dust.y += dust.vy;
      dust.vx *= 0.98;
      dust.vy *= 0.98;
      dust.alpha -= 0.01;

      if (dust.alpha <= 0) return false;

      ctx.save();
      ctx.globalAlpha = dust.alpha;
      
      const gradient = ctx.createRadialGradient(dust.x, dust.y, 0, dust.x, dust.y, dust.size * 2);
      gradient.addColorStop(0, dust.color);
      gradient.addColorStop(1, 'transparent');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(dust.x, dust.y, dust.size * 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      return true;
    });

    animationRef.current = requestAnimationFrame(animate);
  }, [isMinimized, enableInteraction, createShootingStar]);

  // Setup
  useEffect(() => {
    if (!isVisible) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initializeStars(canvas.width, canvas.height);
      initializeNebulae(canvas.width, canvas.height);
    };

    resize();
    window.addEventListener('resize', resize);
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isVisible, animate, initializeStars, initializeNebulae]);

  // Mouse interaction
  useEffect(() => {
    if (!enableInteraction || !isVisible) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('input')) return;
      
      createCosmicDust(e.clientX, e.clientY, 30);
      
      // Create a shooting star from click position
      shootingStarsRef.current.push({
        x: e.clientX,
        y: e.clientY,
        vx: (Math.random() - 0.5) * 15,
        vy: -5 - Math.random() * 10,
        length: 80,
        life: 1,
        color: STAR_COLORS[Math.floor(Math.random() * STAR_COLORS.length)]
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('click', handleClick);
    };
  }, [enableInteraction, isVisible, createCosmicDust]);

  // Auto minimize
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      setIsMinimized(true);
    }, 25000);

    return () => clearTimeout(timer);
  }, [isVisible]);

  // Hide wish message after delay
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      setShowWish(false);
    }, 8000);

    return () => clearTimeout(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <>
      <canvas
        ref={canvasRef}
        className={`fixed inset-0 pointer-events-none transition-opacity duration-1000 ${
          isMinimized ? 'opacity-40' : 'opacity-100'
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
            className="pointer-events-auto group p-3 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full shadow-xl hover:scale-110 transition-transform animate-pulse"
            title="Expand cosmic view"
          >
            <Sparkles className="w-6 h-6 text-white" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-cyan-400 rounded-full animate-ping" />
          </button>
        ) : (
          <div className="pointer-events-auto flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full p-2">
            <button
              onClick={() => {
                const canvas = canvasRef.current;
                if (canvas) {
                  for (let i = 0; i < 5; i++) {
                    createShootingStar(canvas.width, canvas.height);
                  }
                }
              }}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white"
              title="Shooting stars!"
            >
              ⭐
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

      {/* Wish message */}
      {!isMinimized && showWish && (
        <div className="fixed inset-0 pointer-events-none z-45 flex items-center justify-center">
          <div className="text-center animate-in fade-in zoom-in duration-1000">
            <h1 
              className="text-5xl md:text-7xl font-bold mb-4"
              style={{
                background: 'linear-gradient(135deg, #E0E7FF 0%, #C7D2FE 25%, #A5B4FC 50%, #818CF8 75%, #6366F1 100%)',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                textShadow: '0 0 60px rgba(99, 102, 241, 0.5)'
              }}
            >
              ✨ Make a Wish ✨
            </h1>
            {customMessage && (
              <p className="text-xl md:text-2xl text-indigo-200 drop-shadow-lg animate-in fade-in duration-1000" style={{ animationDelay: '500ms' }}>
                {customMessage}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
