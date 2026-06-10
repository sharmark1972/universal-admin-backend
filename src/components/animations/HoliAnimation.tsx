'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function HoliAnimation({ customMessage }: { customMessage?: string }) {
  const [isVisible, setIsVisible] = useState(true);
  const [colorSplashes, setColorSplashes] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number }>>([]);
  const [pichkaris, setPichkaris] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9'];
    const newSplashes = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 3
    }));
    setColorSplashes(newSplashes);

    const newPichkaris = Array.from({ length: 6 }, (_, i) => ({
      id: i,
      x: 10 + i * 16,
      y: 70 + Math.random() * 20
    }));
    setPichkaris(newPichkaris);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <button
        onClick={() => setIsVisible(false)}
        className="pointer-events-auto fixed top-4 right-4 z-[60] p-2 bg-white/80 hover:bg-white rounded-full shadow-lg transition-all hover:scale-110"
        title="Close animation"
      >
        <X className="h-6 w-6 text-gray-700" />
      </button>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-400/30 via-purple-400/30 to-blue-400/30 animate-pulse" />
      
      {/* Color splashes */}
      {colorSplashes.map((splash) => (
        <div
          key={splash.id}
          className="absolute rounded-full animate-splash"
          style={{
            left: `${splash.x}%`,
            top: `${splash.y}%`,
            width: `${20 + Math.random() * 60}px`,
            height: `${20 + Math.random() * 60}px`,
            backgroundColor: splash.color,
            opacity: 0.6,
            animationDelay: `${splash.delay}s`
          }}
        />
      ))}

      {/* Pichkaris (water guns) */}
      {pichkaris.map((pichkari) => (
        <div
          key={pichkari.id}
          className="absolute text-5xl animate-bounce"
          style={{
            left: `${pichkari.x}%`,
            top: `${pichkari.y}%`,
            animationDelay: `${pichkari.id * 0.3}s`
          }}
        >
          💦
        </div>
      ))}

      {/* Center message */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center animate-in fade-in zoom-in duration-1000">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 bg-clip-text text-transparent drop-shadow-2xl">
            Happy Holi!
          </h1>
          <p className="mt-4 text-2xl text-white drop-shadow-lg">🎨 Festival of Colors 🎨</p>
          {customMessage && (
            <p className="mt-4 text-xl text-white drop-shadow-lg">
              {customMessage}
            </p>
          )}
          <div className="mt-6 text-5xl animate-bounce">🎨</div>
        </div>
      </div>

      {/* Floating colors */}
      {Array.from({ length: 20 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-8 h-8 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD'][i % 6],
            animationDelay: `${Math.random() * 4}s`,
            animationDuration: `${3 + Math.random() * 3}s`
          }}
        />
      ))}

      {/* Gulal powder effect */}
      <div className="absolute inset-0">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-3 h-3 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              backgroundColor: ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#F7DC6F', '#BB8FCE'][i % 8],
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>
    </div>
  );
}
