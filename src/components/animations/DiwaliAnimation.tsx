'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export default function DiwaliAnimation({ customMessage }: { customMessage?: string }) {
  const [isVisible, setIsVisible] = useState(true);
  const [diyas, setDiyas] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
  const [fireworks, setFireworks] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);

  useEffect(() => {
    const newDiyas = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: 80 + Math.random() * 20,
      delay: Math.random() * 2
    }));
    setDiyas(newDiyas);

    const newFireworks = Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 40,
      delay: Math.random() * 3
    }));
    setFireworks(newFireworks);
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
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-900/30 via-purple-900/20 to-orange-900/30" />
      
      {/* Rangoli pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full border-8 border-yellow-400 animate-spin" style={{ animationDuration: '60s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full border-8 border-orange-400 animate-spin" style={{ animationDuration: '45s', animationDirection: 'reverse' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border-8 border-pink-400 animate-spin" style={{ animationDuration: '30s' }} />
      </div>

      {/* Diyas at bottom */}
      {diyas.map((diya) => (
        <div
          key={diya.id}
          className="absolute text-3xl animate-pulse"
          style={{
            left: `${diya.x}%`,
            top: `${diya.y}%`,
            animationDelay: `${diya.delay}s`
          }}
        >
          🪔
        </div>
      ))}

      {/* Fireworks */}
      {fireworks.map((fw) => (
        <div
          key={fw.id}
          className="absolute"
          style={{
            left: `${fw.x}%`,
            top: `${fw.y}%`
          }}
        >
          <div className="relative">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 rounded-full animate-ping"
                style={{
                  backgroundColor: ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'][i],
                  transform: `rotate(${i * 45}deg) translateX(20px)`,
                  animationDelay: `${fw.delay + i * 0.1}s`
                }}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Center message */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center animate-in fade-in zoom-in duration-1000">
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 bg-clip-text text-transparent drop-shadow-2xl">
            Happy Diwali!
          </h1>
          <p className="mt-4 text-2xl text-yellow-300 drop-shadow-lg">✨ Festival of Lights ✨</p>
          {customMessage && (
            <p className="mt-4 text-xl text-white drop-shadow-lg">
              {customMessage}
            </p>
          )}
          <div className="mt-6 text-5xl animate-bounce">🪔</div>
        </div>
      </div>

      {/* Floating sparkles */}
      {Array.from({ length: 15 }).map((_, i) => (
        <div
          key={i}
          className="absolute text-2xl animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 2}s`
          }}
        >
          ✨
        </div>
      ))}
    </div>
  );
}
