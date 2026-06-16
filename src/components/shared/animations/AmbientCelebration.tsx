'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { X } from 'lucide-react';

/**
 * AmbientCelebration - A subtle, non-intrusive celebration effect
 * that adds a festive atmosphere without blocking content
 */

interface AmbientParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  type: 'dot' | 'star' | 'diamond' | 'ring';
}

const AMBIENT_COLORS = [
  'rgba(255, 215, 0, 0.6)',   // Gold
  'rgba(255, 107, 107, 0.5)', // Coral
  'rgba(78, 205, 196, 0.5)',  // Teal
  'rgba(69, 183, 209, 0.5)',  // Sky blue
  'rgba(255, 105, 180, 0.5)', // Pink
];

export default function AmbientCelebration({ 
  customMessage,
  showCornerEffects = true
}: { 
  customMessage?: string;
  showCornerEffects?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<AmbientParticle[]>([]);
  const animationRef = useRef<number>();
  const [isActive, setIsActive] = useState(true);
  const [showMessage, setShowMessage] = useState(true);

  // Create ambient particle
  const createParticle = useCallback((fromEdge: boolean = true): AmbientParticle => {
    const canvas = canvasRef.current;
    if (!canvas) return {} as AmbientParticle;

    let x, y, vx, vy;
    
    if (fromEdge) {
      // Spawn from edges
      const side = Math.floor(Math.random() * 4);
      switch (side) {
        case 0: // top
          x = Math.random() * canvas.width;
          y = -10;
          vx = (Math.random() - 0.5) * 0.5;
          vy = 0.3 + Math.random() * 0.5;
          break;
        case 1: // right
          x = canvas.width + 10;
          y = Math.random() * canvas.height;
          vx = -(0.3 + Math.random() * 0.5);
          vy = (Math.random() - 0.5) * 0.5;
          break;
        case 2: // bottom
          x = Math.random() * canvas.width;
          y = canvas.height + 10;
          vx = (Math.random() - 0.5) * 0.5;
          vy = -(0.3 + Math.random() * 0.5);
          break;
        default: // left
          x = -10;
          y = Math.random() * canvas.height;
          vx = 0.3 + Math.random() * 0.5;
          vy = (Math.random() - 0.5) * 0.5;
          break;
      }
    } else {
      // Random position
      x = Math.random() * canvas.width;
      y = Math.random() * canvas.height;
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.2 + Math.random() * 0.3;
      vx = Math.cos(angle) * speed;
      vy = Math.sin(angle) * speed;
    }

    const types: AmbientParticle['type'][] = ['dot', 'star', 'diamond', 'ring'];
    
    return {
      x,
      y,
      vx,
      vy,
      size: 2 + Math.random() * 4,
      color: AMBIENT_COLORS[Math.floor(Math.random() * AMBIENT_COLORS.length)],
      alpha: 0.3 + Math.random() * 0.4,
      type: types[Math.floor(Math.random() * types.length)]
    };
  }, []);

  // Animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isActive) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Add new particles occasionally
    if (Math.random() < 0.03 && particlesRef.current.length < 50) {
      particlesRef.current.push(createParticle(true));
    }

    // Update and draw particles
    particlesRef.current = particlesRef.current.filter(p => {
      p.x += p.vx;
      p.y += p.vy;
      
      // Add slight wave motion
      p.x += Math.sin(Date.now() * 0.001 + p.y * 0.01) * 0.1;

      // Check bounds
      if (p.x < -20 || p.x > canvas.width + 20 || 
          p.y < -20 || p.y > canvas.height + 20) {
        return false;
      }

      // Draw particle
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;
      ctx.strokeStyle = p.color;

      switch (p.type) {
        case 'dot':
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          break;
          
        case 'star':
          ctx.beginPath();
          for (let i = 0; i < 5; i++) {
            const angle = (i * 4 * Math.PI) / 5 - Math.PI / 2;
            const r = i % 2 === 0 ? p.size : p.size * 0.4;
            const sx = p.x + Math.cos(angle) * r;
            const sy = p.y + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(sx, sy);
            else ctx.lineTo(sx, sy);
          }
          ctx.closePath();
          ctx.fill();
          break;
          
        case 'diamond':
          ctx.beginPath();
          ctx.moveTo(p.x, p.y - p.size);
          ctx.lineTo(p.x + p.size * 0.6, p.y);
          ctx.lineTo(p.x, p.y + p.size);
          ctx.lineTo(p.x - p.size * 0.6, p.y);
          ctx.closePath();
          ctx.fill();
          break;
          
        case 'ring':
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.lineWidth = 1;
          ctx.stroke();
          break;
      }

      ctx.restore();
      return true;
    });

    animationRef.current = requestAnimationFrame(animate);
  }, [isActive, createParticle]);

  // Setup
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    // Initial particles
    for (let i = 0; i < 20; i++) {
      particlesRef.current.push(createParticle(false));
    }

    animate();

    return () => {
      window.removeEventListener('resize', resize);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [animate, createParticle]);

  // Auto hide message
  useEffect(() => {
    const timer = setTimeout(() => setShowMessage(false), 8000);
    return () => clearTimeout(timer);
  }, []);

  if (!isActive) return null;

  return (
    <>
      {/* Canvas for particles */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-30"
        style={{ background: 'transparent' }}
      />

      {/* Corner decorations */}
      {showCornerEffects && (
        <>
          {/* Top left sparkle */}
          <div className="fixed top-4 left-4 pointer-events-none z-40 animate-sparkle">
            <span className="text-2xl">✨</span>
          </div>
          
          {/* Top right sparkle */}
          <div className="fixed top-4 right-16 pointer-events-none z-40 animate-sparkle" style={{ animationDelay: '0.5s' }}>
            <span className="text-2xl">🌟</span>
          </div>
          
          {/* Bottom left */}
          <div className="fixed bottom-4 left-4 pointer-events-none z-40 animate-gentle-float">
            <span className="text-xl">🎊</span>
          </div>
          
          {/* Bottom right */}
          <div className="fixed bottom-4 right-4 pointer-events-none z-40 animate-gentle-float" style={{ animationDelay: '1s' }}>
            <span className="text-xl">🎉</span>
          </div>
        </>
      )}

      {/* Subtle message banner */}
      {showMessage && customMessage && (
        <div className="fixed bottom-20 left-1/2 transform -translate-x-1/2 pointer-events-none z-40 animate-in fade-in slide-in-from-bottom duration-1000">
          <div className="glass-effect rounded-full px-6 py-2 shadow-lg">
            <p className="text-sm md:text-base text-white/90 font-medium text-center">
              ✨ {customMessage} ✨
            </p>
          </div>
        </div>
      )}

      {/* Close button */}
      <button
        onClick={() => setIsActive(false)}
        className="fixed top-4 right-4 z-50 pointer-events-auto p-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full transition-all hover:scale-110"
        title="Hide ambient effects"
      >
        <X className="h-4 w-4 text-white/70" />
      </button>
    </>
  );
}
