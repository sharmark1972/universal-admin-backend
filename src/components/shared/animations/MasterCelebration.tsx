'use client';

/**
 * MasterCelebration - The ultimate celebration component that combines
 * multiple animation systems for a spectacular but non-intrusive experience
 */

import { useState, useEffect, useCallback } from 'react';
import { X, Sparkles, ChevronDown, ChevronUp, Zap } from 'lucide-react';
import dynamic from 'next/dynamic';

// Lazy load animation components
const FireworksSpectacular = dynamic(() => import('./FireworksSpectacular'), { ssr: false });
const CosmicCelebration = dynamic(() => import('./CosmicCelebration'), { ssr: false });
const AdvancedConfettiSystem = dynamic(() => import('./AdvancedConfettiSystem'), { ssr: false });
const AmbientCelebration = dynamic(() => import('./AmbientCelebration'), { ssr: false });

type AnimationMode = 'spectacular' | 'cosmic' | 'confetti' | 'ambient' | 'auto';

interface MasterCelebrationProps {
  customMessage?: string;
  defaultMode?: AnimationMode;
  year?: number;
  autoRotate?: boolean;
  autoRotateInterval?: number;
}

export default function MasterCelebration({
  customMessage,
  defaultMode = 'auto',
  year = new Date().getFullYear(),
  autoRotate = false,
  autoRotateInterval = 30000
}: MasterCelebrationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [currentMode, setCurrentMode] = useState<AnimationMode>(defaultMode);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showModeSelector, setShowModeSelector] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Mode configurations
  const modes: { id: AnimationMode; name: string; icon: string; description: string }[] = [
    { id: 'spectacular', name: 'Fireworks', icon: '🎆', description: 'Stunning firework display' },
    { id: 'cosmic', name: 'Cosmic', icon: '✨', description: 'Starry night celebration' },
    { id: 'confetti', name: 'Confetti', icon: '🎊', description: 'Festive confetti shower' },
    { id: 'ambient', name: 'Ambient', icon: '🌟', description: 'Subtle floating particles' },
    { id: 'auto', name: 'Auto', icon: '🔄', description: 'Cycles through all modes' }
  ];

  // Auto mode rotation
  useEffect(() => {
    if (currentMode !== 'auto' && !autoRotate) return;

    const availableModes: AnimationMode[] = ['spectacular', 'cosmic', 'confetti', 'ambient'];
    let currentIndex = 0;

    const rotateMode = () => {
      setIsTransitioning(true);
      setTimeout(() => {
        currentIndex = (currentIndex + 1) % availableModes.length;
        setCurrentMode(availableModes[currentIndex]);
        setIsTransitioning(false);
      }, 500);
    };

    // Set initial mode for auto
    if (currentMode === 'auto') {
      setCurrentMode(availableModes[0]);
    }

    const interval = setInterval(rotateMode, autoRotateInterval);
    return () => clearInterval(interval);
  }, [currentMode, autoRotate, autoRotateInterval]);

  // Switch mode with transition
  const switchMode = useCallback((mode: AnimationMode) => {
    if (mode === currentMode) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentMode(mode);
      setIsTransitioning(false);
      setShowModeSelector(false);
    }, 300);
  }, [currentMode]);

  // Random burst effect
  const triggerBurst = useCallback(() => {
    // This would need to communicate with the active animation
    // For now, we'll just cycle to a random mode
    const modes: AnimationMode[] = ['spectacular', 'cosmic', 'confetti'];
    const randomMode = modes[Math.floor(Math.random() * modes.length)];
    switchMode(randomMode);
  }, [switchMode]);

  // Auto minimize after delay
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      setIsMinimized(true);
    }, 45000); // 45 seconds before minimizing

    return () => clearTimeout(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  // Determine which animation to render
  const renderAnimation = () => {
    const actualMode = currentMode === 'auto' ? 'spectacular' : currentMode;
    
    switch (actualMode) {
      case 'spectacular':
        return <FireworksSpectacular customMessage={customMessage} year={year} />;
      case 'cosmic':
        return <CosmicCelebration customMessage={customMessage} />;
      case 'confetti':
        return <AdvancedConfettiSystem customMessage={customMessage} />;
      case 'ambient':
        return <AmbientCelebration customMessage={customMessage} />;
      default:
        return <FireworksSpectacular customMessage={customMessage} year={year} />;
    }
  };

  return (
    <>
      {/* Transition overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 z-[100] bg-black/50 animate-pulse pointer-events-none" />
      )}

      {/* Main animation */}
      <div className={`transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {renderAnimation()}
      </div>

      {/* Master controls - only show when not using individual animation controls */}
      {!isMinimized && (
        <div className="fixed top-4 left-4 z-[80] pointer-events-auto">
          <div className="relative">
            {/* Mode selector toggle */}
            <button
              onClick={() => setShowModeSelector(!showModeSelector)}
              className="flex items-center gap-2 px-4 py-2 bg-black/30 hover:bg-black/40 backdrop-blur-md rounded-full transition-all border border-white/10 shadow-xl"
            >
              <span className="text-xl">{modes.find(m => m.id === currentMode)?.icon}</span>
              <span className="text-white/90 text-sm font-medium hidden sm:inline">
                {modes.find(m => m.id === currentMode)?.name}
              </span>
              {showModeSelector ? (
                <ChevronUp className="w-4 h-4 text-white/70" />
              ) : (
                <ChevronDown className="w-4 h-4 text-white/70" />
              )}
            </button>

            {/* Mode selector dropdown */}
            {showModeSelector && (
              <div className="absolute top-full left-0 mt-2 w-64 bg-black/50 backdrop-blur-xl rounded-xl border border-white/10 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                {modes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => switchMode(mode.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors ${
                      currentMode === mode.id ? 'bg-white/10' : ''
                    }`}
                  >
                    <span className="text-2xl">{mode.icon}</span>
                    <div className="text-left">
                      <div className="text-white font-medium">{mode.name}</div>
                      <div className="text-white/60 text-xs">{mode.description}</div>
                    </div>
                    {currentMode === mode.id && (
                      <Sparkles className="w-4 h-4 text-yellow-400 ml-auto" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Minimized state indicator */}
      {isMinimized && (
        <button
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-4 left-4 z-[80] pointer-events-auto p-4 bg-gradient-to-br from-purple-600 via-pink-500 to-yellow-500 rounded-full shadow-2xl hover:scale-110 transition-transform animate-pulse"
          title="Expand celebration controls"
        >
          <span className="text-2xl">🎉</span>
        </button>
      )}

      {/* Quick actions */}
      {!isMinimized && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[80] pointer-events-auto">
          <div className="flex items-center gap-2 px-4 py-2 bg-black/30 backdrop-blur-md rounded-full border border-white/10">
            <button
              onClick={triggerBurst}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
              title="Surprise me!"
            >
              <Zap className="w-5 h-5 text-yellow-400" />
            </button>
            <div className="w-px h-6 bg-white/20" />
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/70"
              title="Minimize"
            >
              <ChevronDown className="w-5 h-5" />
            </button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/70"
              title="Close all celebrations"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* Year badge - corner display */}
      <div className="fixed top-4 right-1/2 transform translate-x-1/2 z-[75] pointer-events-none">
        <div className="celebration-text text-4xl md:text-5xl font-black animate-text-glow">
          {year}
        </div>
      </div>
    </>
  );
}
