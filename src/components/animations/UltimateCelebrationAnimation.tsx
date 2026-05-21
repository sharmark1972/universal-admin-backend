'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { X } from 'lucide-react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  opacity: number;
  rotation: number;
  rotationSpeed: number;
  type: 'confetti' | 'spark' | 'star' | 'heart' | 'ring' | 'burst';
  life: number;
  maxLife: number;
  gravity: number;
  friction: number;
}

interface Firework {
  id: number;
  x: number;
  y: number;
  targetY: number;
  exploded: boolean;
  color: string;
  particles: FireworkParticle[];
  trail: { x: number; y: number; opacity: number }[];
}

interface FireworkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  opacity: number;
  scale: number;
  rotation: number;
}

const COLORS = {
  NEW_YEAR: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FF69B4', '#00FF87', '#FE53BB', '#00F5FF', '#F5D300'],
  firework: ['#FF0000', '#FFD700', '#00FF00', '#00FFFF', '#FF69B4', '#FFA500', '#9370DB', '#FF1493', '#00FF7F', '#FFE4E1'],
  confetti: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9']
};

const EMOJIS = ['🎉', '🎊', '✨', '🥂', '🎆', '🎇', '🌟', '⭐', '💫', '🔥', '🎈', '🪩', '🎁', '💥', '🌈'];

export default function UltimateCelebrationAnimation({ 
  customMessage,
  year = new Date().getFullYear()
}: { 
  customMessage?: string;
  year?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const particlesRef = useRef<Particle[]>([]);
  const fireworksRef = useRef<Firework[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  
  const [isVisible, setIsVisible] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');

  // Particle creation functions
  const createParticle = useCallback((x: number, y: number, type: Particle['type'] = 'confetti'): Particle => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 8;
    return {
      id: Math.random(),
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 5,
      size: type === 'spark' ? 2 + Math.random() * 3 : 8 + Math.random() * 8,
      color: COLORS.confetti[Math.floor(Math.random() * COLORS.confetti.length)],
      opacity: 1,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 10,
      type,
      life: 0,
      maxLife: 100 + Math.random() * 100,
      gravity: type === 'spark' ? 0.1 : 0.15,
      friction: 0.99
    };
  }, []);

  const createFirework = useCallback((x: number, y: number): Firework => {
    return {
      id: Math.random(),
      x,
      y: window.innerHeight + 50,
      targetY: y,
      exploded: false,
      color: COLORS.firework[Math.floor(Math.random() * COLORS.firework.length)],
      particles: [],
      trail: []
    };
  }, []);

  const explodeFirework = useCallback((firework: Firework) => {
    const particleCount = 80 + Math.random() * 40;
    const colors = [firework.color, ...COLORS.firework.slice(0, 3)];
    
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 3 + Math.random() * 5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      
      firework.particles.push({
        x: firework.x,
        y: firework.y,
        vx: Math.cos(angle) * speed * (0.5 + Math.random()),
        vy: Math.sin(angle) * speed * (0.5 + Math.random()),
        life: 1,
        color,
        size: 2 + Math.random() * 2
      });
    }
    firework.exploded = true;
  }, []);

  const createFloatingText = useCallback((text: string, x: number, y: number): FloatingText => {
    return {
      id: Math.random(),
      x,
      y,
      text,
      opacity: 1,
      scale: 0.5,
      rotation: (Math.random() - 0.5) * 30
    };
  }, []);

  // Main animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with slight fade for trail effect
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const particleMultiplier = intensity === 'low' ? 0.3 : intensity === 'medium' ? 0.6 : 1;

    // Add new particles periodically
    if (Math.random() < 0.05 * particleMultiplier && particlesRef.current.length < 200) {
      const side = Math.floor(Math.random() * 4);
      let x, y;
      switch (side) {
        case 0: x = Math.random() * canvas.width; y = -20; break;
        case 1: x = canvas.width + 20; y = Math.random() * canvas.height; break;
        case 2: x = Math.random() * canvas.width; y = canvas.height + 20; break;
        default: x = -20; y = Math.random() * canvas.height; break;
      }
      particlesRef.current.push(createParticle(x, y, Math.random() < 0.3 ? 'spark' : 'confetti'));
    }

    // Add new fireworks periodically
    if (Math.random() < 0.015 * particleMultiplier && fireworksRef.current.length < 5) {
      const x = 100 + Math.random() * (canvas.width - 200);
      const y = 100 + Math.random() * (canvas.height * 0.4);
      fireworksRef.current.push(createFirework(x, y));
    }

    // Update and draw particles
    particlesRef.current = particlesRef.current.filter(particle => {
      particle.life++;
      particle.x += particle.vx;
      particle.y += particle.vy;
      particle.vy += particle.gravity;
      particle.vx *= particle.friction;
      particle.vy *= particle.friction;
      particle.rotation += particle.rotationSpeed;
      particle.opacity = 1 - (particle.life / particle.maxLife);

      if (particle.opacity <= 0) return false;

      // Draw particle
      ctx.save();
      ctx.translate(particle.x, particle.y);
      ctx.rotate((particle.rotation * Math.PI) / 180);
      ctx.globalAlpha = particle.opacity;

      if (particle.type === 'spark') {
        // Draw spark as glowing dot
        const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, particle.size);
        gradient.addColorStop(0, particle.color);
        gradient.addColorStop(0.5, particle.color + '80');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, particle.size * 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (particle.type === 'confetti') {
        // Draw confetti as rectangle
        ctx.fillStyle = particle.color;
        ctx.fillRect(-particle.size / 2, -particle.size / 4, particle.size, particle.size / 2);
        
        // Add shimmer effect
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillRect(-particle.size / 4, -particle.size / 8, particle.size / 2, particle.size / 4);
      } else if (particle.type === 'star') {
        // Draw star
        ctx.fillStyle = particle.color;
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
          const x = Math.cos(angle) * particle.size;
          const y = Math.sin(angle) * particle.size;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
      return true;
    });

    // Update and draw fireworks
    fireworksRef.current = fireworksRef.current.filter(firework => {
      if (!firework.exploded) {
        // Move firework up
        firework.y -= 8;
        
        // Add trail
        firework.trail.push({ x: firework.x, y: firework.y, opacity: 1 });
        if (firework.trail.length > 20) firework.trail.shift();

        // Draw trail
        firework.trail.forEach((point, i) => {
          const opacity = (i / firework.trail.length) * 0.5;
          ctx.beginPath();
          ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 200, 100, ${opacity})`;
          ctx.fill();
        });

        // Draw firework
        const gradient = ctx.createRadialGradient(firework.x, firework.y, 0, firework.x, firework.y, 8);
        gradient.addColorStop(0, '#FFFFFF');
        gradient.addColorStop(0.5, firework.color);
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(firework.x, firework.y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Check if should explode
        if (firework.y <= firework.targetY) {
          explodeFirework(firework);
        }
        return true;
      } else {
        // Update and draw explosion particles
        let hasLiveParticles = false;
        firework.particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.05; // gravity
          p.vx *= 0.98;
          p.vy *= 0.98;
          p.life -= 0.015;

          if (p.life > 0) {
            hasLiveParticles = true;
            
            // Draw with glow
            const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 2);
            gradient.addColorStop(0, p.color);
            gradient.addColorStop(0.5, p.color + Math.floor(p.life * 128).toString(16).padStart(2, '0'));
            gradient.addColorStop(1, 'transparent');
            
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size * 2, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.globalAlpha = p.life;
            ctx.fill();
            ctx.globalAlpha = 1;
          }
        });
        return hasLiveParticles;
      }
    });

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [createParticle, createFirework, explodeFirework, intensity]);

  // Initialize canvas
  useEffect(() => {
    if (!isVisible || isMinimized) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Start animation
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isVisible, isMinimized, animate]);

  // Mouse interaction
  useEffect(() => {
    if (!isVisible || isMinimized) return;

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    const handleClick = (e: MouseEvent) => {
      // Create burst of particles on click
      const target = e.target as HTMLElement;
      if (target.closest('button') || target.closest('a') || target.closest('input')) return;

      for (let i = 0; i < 15; i++) {
        particlesRef.current.push(createParticle(e.clientX, e.clientY, 'spark'));
      }
      
      // Add floating emoji
      const emoji = EMOJIS[Math.floor(Math.random() * EMOJIS.length)];
      floatingTextsRef.current.push(createFloatingText(emoji, e.clientX, e.clientY));
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('click', handleClick);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('click', handleClick);
    };
  }, [isVisible, isMinimized, createParticle, createFloatingText]);

  // Auto-minimize after 30 seconds to not disturb users
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
      {/* Main Canvas Animation - Only shown when not minimized */}
      {!isMinimized && (
        <canvas
          ref={canvasRef}
          className="fixed inset-0 pointer-events-none z-40"
          style={{ background: 'transparent' }}
        />
      )}

      {/* Control Panel */}
      <div 
        className={`fixed z-[70] transition-all duration-500 ${
          isMinimized 
            ? 'bottom-4 right-4' 
            : 'top-4 right-4'
        }`}
      >
        {/* Minimized state - Just a small animated button */}
        {isMinimized && (
          <button
            onClick={() => setIsMinimized(false)}
            className="pointer-events-auto group relative p-3 bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 rounded-full shadow-2xl hover:scale-110 transition-transform animate-pulse"
            title="Expand celebration"
          >
            <span className="text-2xl">🎉</span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-ping" />
          </button>
        )}

        {/* Expanded controls */}
        {!isMinimized && (
          <div className="pointer-events-auto flex items-center gap-2 bg-black/20 backdrop-blur-sm rounded-full p-2">
            {/* Intensity selector */}
            <div className="flex items-center gap-1 px-2">
              {(['low', 'medium', 'high'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => setIntensity(level)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    intensity === level 
                      ? 'bg-yellow-400 scale-125' 
                      : 'bg-white/50 hover:bg-white/70'
                  }`}
                  title={`${level} intensity`}
                />
              ))}
            </div>
            
            {/* Minimize button */}
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white"
              title="Minimize to corner"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Close button */}
            <button
              onClick={() => setIsVisible(false)}
              className="p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
              title="Close animation"
            >
              <X className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        )}
      </div>

      {/* Floating Emojis Layer */}
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {/* Animated corner decorations - Always visible */}
        <div className="absolute top-0 left-0 w-32 h-32">
          <div className="absolute top-4 left-4 text-4xl animate-bounce" style={{ animationDelay: '0s' }}>🎊</div>
          <div className="absolute top-8 left-12 text-2xl animate-bounce" style={{ animationDelay: '0.3s' }}>✨</div>
        </div>
        <div className="absolute top-0 right-0 w-32 h-32">
          <div className="absolute top-4 right-16 text-4xl animate-bounce" style={{ animationDelay: '0.1s' }}>🎉</div>
          <div className="absolute top-12 right-4 text-2xl animate-bounce" style={{ animationDelay: '0.4s' }}>🌟</div>
        </div>
        <div className="absolute bottom-0 left-0 w-32 h-32">
          <div className="absolute bottom-4 left-4 text-3xl animate-bounce" style={{ animationDelay: '0.2s' }}>🥂</div>
        </div>
        <div className="absolute bottom-0 right-0 w-32 h-32">
          <div className="absolute bottom-4 right-4 text-3xl animate-bounce" style={{ animationDelay: '0.5s' }}>🎆</div>
        </div>
      </div>

      {/* Main content overlay - Only when not minimized */}
      {!isMinimized && (
        <div className="fixed inset-0 pointer-events-none z-45 flex items-center justify-center">
          {/* Radial gradient background pulse */}
          <div className="absolute inset-0 bg-gradient-radial from-purple-900/10 via-transparent to-transparent animate-pulse-slow" />
          
          {/* Main text */}
          <div className="text-center animate-in fade-in zoom-in duration-1000">
            {/* Year display with advanced effects */}
            <div className="relative mb-6">
              <h1 
                className="text-8xl md:text-[12rem] font-black tracking-tighter"
                style={{
                  background: 'linear-gradient(135deg, #FFD700 0%, #FF6B6B 25%, #4ECDC4 50%, #45B7D1 75%, #FF69B4 100%)',
                  backgroundSize: '400% 400%',
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  color: 'transparent',
                  animation: 'gradient-shift 3s ease infinite',
                  textShadow: '0 0 80px rgba(255, 215, 0, 0.5)'
                }}
              >
                {year}
              </h1>
              {/* Glowing rings */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-full h-full max-w-lg max-h-32 border-2 border-yellow-400/30 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
              </div>
            </div>

            {/* Happy New Year text */}
            <h2 
              className="text-4xl md:text-6xl font-bold mb-4 animate-text-shimmer"
              style={{
                background: 'linear-gradient(90deg, #fff 0%, #FFD700 50%, #fff 100%)',
                backgroundSize: '200% auto',
                WebkitBackgroundClip: 'text',
                backgroundClip: 'text',
                color: 'transparent',
                animation: 'shimmer 2s linear infinite'
              }}
            >
              Happy New Year!
            </h2>

            {/* Custom message */}
            {customMessage && (
              <p className="text-xl md:text-2xl text-white/90 mt-4 drop-shadow-lg animate-fade-in-up">
                {customMessage}
              </p>
            )}

            {/* Animated emojis */}
            <div className="flex justify-center gap-4 mt-8">
              {['🎊', '🎉', '🥳', '🎆', '✨'].map((emoji, i) => (
                <span 
                  key={i}
                  className="text-4xl md:text-5xl animate-bounce"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  {emoji}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Minimized indicator - small celebration happening in corner */}
      {isMinimized && (
        <div className="fixed bottom-4 right-16 pointer-events-none z-60">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="absolute text-lg animate-float-up"
              style={{
                left: `${(i - 2) * 15}px`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: '3s'
              }}
            >
              {EMOJIS[i % EMOJIS.length]}
            </div>
          ))}
        </div>
      )}

      {/* Styles */}
      <style jsx global>{`
        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        
        @keyframes float-up {
          0% { 
            opacity: 1; 
            transform: translateY(0) scale(1) rotate(0deg);
          }
          100% { 
            opacity: 0; 
            transform: translateY(-100px) scale(0.5) rotate(360deg);
          }
        }
        
        @keyframes fade-in-up {
          0% {
            opacity: 0;
            transform: translateY(20px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-float-up {
          animation: float-up 3s ease-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 1s ease-out forwards;
        }
        
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-from) 0%, var(--tw-gradient-via) 50%, var(--tw-gradient-to) 100%);
        }
      `}</style>
    </>
  );
}
