'use client';

import { useEffect, useState, useRef } from 'react';

export default function PremiumCursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const trailPositions = useRef<Array<{ x: number; y: number }>>([]);

  useEffect(() => {
    // Only show custom cursor on desktop
    if (window.matchMedia('(pointer: coarse)').matches) {
      return;
    }

    setIsVisible(true);

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
      
      // Update trail positions
      trailPositions.current.push({ x: e.clientX, y: e.clientY });
      if (trailPositions.current.length > 8) {
        trailPositions.current.shift();
      }
    };

    const handleMouseDown = () => setIsClicking(true);
    const handleMouseUp = () => setIsClicking(false);

    const handleMouseEnter = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('a, button, input, textarea, select, [role="button"], .cursor-pointer')) {
        setIsHovering(true);
      }
    };

    const handleMouseLeave = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.matches('a, button, input, textarea, select, [role="button"], .cursor-pointer')) {
        setIsHovering(false);
      }
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mouseover', handleMouseEnter);
    document.addEventListener('mouseout', handleMouseLeave);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mouseover', handleMouseEnter);
      document.removeEventListener('mouseout', handleMouseLeave);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <>
      <style jsx global>{`
        * {
          cursor: none !important;
        }
        
        @media (pointer: coarse) {
          * {
            cursor: auto !important;
          }
        }
      `}</style>
      
      {/* Main cursor dot */}
      <div
        ref={dotRef}
        className="fixed pointer-events-none z-[9999] mix-blend-difference"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
        }}
      >
        <div
          className={`w-2 h-2 bg-white rounded-full transition-all duration-75 ${
            isClicking ? 'scale-150' : 'scale-100'
          }`}
        />
      </div>

      {/* Outer ring with smooth follow */}
      <div
        ref={ringRef}
        className="fixed pointer-events-none z-[9998] mix-blend-difference"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
          transition: 'transform 0.15s ease-out, width 0.2s ease, height 0.2s ease',
        }}
      >
        <div
          className={`border-2 border-white rounded-full transition-all duration-300 ${
            isHovering ? 'w-12 h-12 opacity-100' : 'w-8 h-8 opacity-60'
          } ${isClicking ? 'scale-90' : 'scale-100'}`}
        />
      </div>

      {/* Glow effect */}
      <div
        className="fixed pointer-events-none z-[9997]"
        style={{
          left: position.x,
          top: position.y,
          transform: 'translate(-50%, -50%)',
          transition: 'transform 0.2s ease-out',
        }}
      >
        <div
          className={`absolute rounded-full blur-xl transition-all duration-300 ${
            isHovering
              ? 'w-16 h-16 bg-blue-500/30'
              : 'w-8 h-8 bg-purple-500/20'
          }`}
        />
      </div>

      {/* Trail effect */}
      <div
        ref={trailRef}
        className="fixed pointer-events-none z-[9996]"
      >
        {trailPositions.current.map((pos, index) => {
          const opacity = (index + 1) / trailPositions.current.length * 0.3;
          const size = 4 + (index * 2);
          return (
            <div
              key={index}
              className="absolute rounded-full bg-gradient-to-r from-blue-500 to-purple-500"
              style={{
                left: pos.x,
                top: pos.y,
                width: size,
                height: size,
                opacity,
                transform: 'translate(-50%, -50%)',
                transition: 'opacity 0.1s ease',
              }}
            />
          );
        })}
      </div>

      {/* Click ripple effect */}
      {isClicking && (
        <div
          className="fixed pointer-events-none z-[9995]"
          style={{
            left: position.x,
            top: position.y,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <div className="w-20 h-20 border-2 border-white/50 rounded-full animate-ping" />
        </div>
      )}
    </>
  );
}
