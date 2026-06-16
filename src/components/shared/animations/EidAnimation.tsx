'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function EidAnimation({ customMessage }: { customMessage?: string }) {
  const [isVisible, setIsVisible] = useState(true);
  const [stars, setStars] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const [crescents, setCrescents] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    const newStars = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 60,
      delay: Math.random() * 3
    }));
    setStars(newStars);

    const newCrescents = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: 10 + i * 12,
      y: 10 + Math.random() * 30,
      delay: Math.random() * 2
    }));
    setCrescents(newCrescents);
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
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/40 via-purple-900/30 to-teal-900/40" />
      
      {/* Stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute text-2xl animate-twinkle"
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            animationDelay: `${star.delay}s`
          }}
        >
          ⭐
        </div>
      ))}

      {/* Crescent moons */}
      {crescents.map((crescent) => (
        <div
          key={crescent.id}
          className="absolute text-4xl animate-float"
          style={{
            left: `${crescent.x}%`,
            top: `${crescent.y}%`,
            animationDelay: `${crescent.delay}s`,
            animationDuration: `${4 + Math.random() * 2}s`
          }}
        >
          🌙
        </div>
      ))}

      {/* Center message */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center animate-in fade-in zoom-in duration-1000">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-yellow-400 via-amber-500 to-teal-400 bg-clip-text text-transparent drop-shadow-2xl">
            Eid Mubarak!
          </h1>
          <p className="mt-4 text-2xl text-white drop-shadow-lg">✨ Eid Mubarak ✨</p>
          {customMessage && (
            <p className="mt-4 text-xl text-white drop-shadow-lg">
              {customMessage}
            </p>
          )}
          <div className="mt-6 text-5xl animate-bounce">🌙</div>
        </div>
      </div>

      {/* Lanterns */}
      <div className="absolute top-10 left-10 text-6xl animate-pulse">🏮</div>
      <div className="absolute top-10 right-10 text-6xl animate-pulse" style={{ animationDelay: '0.5s' }}>🏮</div>
      <div className="absolute bottom-20 left-20 text-5xl animate-pulse" style={{ animationDelay: '1s' }}>🏮</div>
      <div className="absolute bottom-20 right-20 text-5xl animate-pulse" style={{ animationDelay: '1.5s' }}>🏮</div>

      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 border-4 border-yellow-400 rounded-full animate-spin" style={{ animationDuration: '20s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 border-4 border-teal-400 rounded-full animate-spin" style={{ animationDuration: '25s', animationDirection: 'reverse' }} />
      </div>

      {/* Floating particles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full bg-yellow-400 animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        />
      ))}
    </div>
  );
}
