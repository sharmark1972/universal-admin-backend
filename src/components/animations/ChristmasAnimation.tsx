'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function ChristmasAnimation({ customMessage }: { customMessage?: string }) {
  const [isVisible, setIsVisible] = useState(true);
  const [snowflakes, setSnowflakes] = useState<Array<{ id: number; x: number; delay: number; size: number }>>([]);
  const [ornaments, setOrnaments] = useState<Array<{ id: number; x: number; y: number; emoji: string }>>([]);

  useEffect(() => {
    const newSnowflakes = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 5,
      size: 1 + Math.random() * 2
    }));
    setSnowflakes(newSnowflakes);

    const newOrnaments = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: 10 + (i % 4) * 25,
      y: 20 + Math.floor(i / 4) * 25,
      emoji: ['🎄', '🎅', '⭐', '🎁', '🦌', '❄️'][Math.floor(Math.random() * 6)]
    }));
    setOrnaments(newOrnaments);
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
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-blue-800/30 to-green-900/40" />
      
      {/* Snowflakes */}
      {snowflakes.map((flake) => (
        <div
          key={flake.id}
          className="absolute text-white animate-fall"
          style={{
            left: `${flake.x}%`,
            top: '-20px',
            fontSize: `${flake.size}rem`,
            animationDelay: `${flake.delay}s`,
            animationDuration: `${5 + Math.random() * 5}s`
          }}
        >
          ❄️
        </div>
      ))}

      {/* Christmas tree */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2">
        <div className="text-9xl animate-bounce">🎄</div>
      </div>

      {/* Ornaments */}
      {ornaments.map((ornament) => (
        <div
          key={ornament.id}
          className="absolute text-4xl animate-pulse"
          style={{
            left: `${ornament.x}%`,
            top: `${ornament.y}%`,
            animationDelay: `${ornament.id * 0.2}s`
          }}
        >
          {ornament.emoji}
        </div>
      ))}

      {/* Center message */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center animate-in fade-in zoom-in duration-1000">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-red-500 via-green-500 to-red-500 bg-clip-text text-transparent drop-shadow-2xl">
            Merry Christmas!
          </h1>
          <p className="mt-4 text-2xl text-white drop-shadow-lg">🎄 Ho Ho Ho! 🎅</p>
          {customMessage && (
            <p className="mt-4 text-xl text-white drop-shadow-lg">
              {customMessage}
            </p>
          )}
          <div className="mt-6 text-5xl animate-bounce">🎁</div>
        </div>
      </div>

      {/* Candy canes */}
      <div className="absolute bottom-10 left-10 text-6xl animate-pulse">🍬</div>
      <div className="absolute bottom-10 right-10 text-6xl animate-pulse" style={{ animationDelay: '1s' }}>🍬</div>

      {/* Stars */}
      {Array.from({ length: 10 }).map((_, i) => (
        <div
          key={i}
          className="absolute text-2xl animate-twinkle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 50}%`,
            animationDelay: `${Math.random() * 3}s`
          }}
        >
          ⭐
        </div>
      ))}
    </div>
  );
}
