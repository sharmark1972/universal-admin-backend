'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function IndependenceDayAnimation({ customMessage }: { customMessage?: string }) {
  const [isVisible, setIsVisible] = useState(true);
  const [flags, setFlags] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const [confetti, setConfetti] = useState<Array<{ id: number; x: number; y: number; color: string; delay: number }>>([]);

  useEffect(() => {
    const newFlags = Array.from({ length: 10 }, (_, i) => ({
      id: i,
      x: 5 + i * 10,
      y: 10 + Math.random() * 20,
      delay: Math.random() * 2
    }));
    setFlags(newFlags);

    const colors = ['#FF9933', '#FFFFFF', '#138808'];
    const newConfetti = Array.from({ length: 50 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      color: colors[Math.floor(Math.random() * colors.length)],
      delay: Math.random() * 3
    }));
    setConfetti(newConfetti);
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
      <div className="absolute inset-0 bg-gradient-to-b from-orange-900/30 via-white/20 to-green-900/30" />
      
      {/* Flags */}
      {flags.map((flag) => (
        <div
          key={flag.id}
          className="absolute text-5xl animate-bounce"
          style={{
            left: `${flag.x}%`,
            top: `${flag.y}%`,
            animationDelay: `${flag.delay}s`
          }}
        >
          🇮🇳
        </div>
      ))}

      {/* Confetti */}
      {confetti.map((c) => (
        <div
          key={c.id}
          className="absolute w-3 h-3 animate-fall"
          style={{
            left: `${c.x}%`,
            top: '-20px',
            backgroundColor: c.color,
            animationDelay: `${c.delay}s`,
            animationDuration: `${4 + Math.random() * 4}s`
          }}
        />
      ))}

      {/* Center message */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center animate-in fade-in zoom-in duration-1000">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-orange-500 via-white to-green-500 bg-clip-text text-transparent drop-shadow-2xl">
            Happy Independence Day!
          </h1>
          <p className="mt-4 text-2xl text-white drop-shadow-lg">🇮🇳 Jai Hind! 🇮🇳</p>
          {customMessage && (
            <p className="mt-4 text-xl text-white drop-shadow-lg">
              {customMessage}
            </p>
          )}
          <div className="mt-6 text-5xl animate-bounce">🇮🇳</div>
        </div>
      </div>

      {/* Ashoka Chakra */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="w-32 h-32 rounded-full border-8 border-blue-900 animate-spin" style={{ animationDuration: '10s' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-4xl">⚙️</div>
          </div>
        </div>
      </div>

      {/* Tricolor stripes */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-gradient-to-r from-orange-500 via-white to-green-500" />
    </div>
  );
}
