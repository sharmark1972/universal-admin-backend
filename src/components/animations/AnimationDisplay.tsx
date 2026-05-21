'use client';

import { useEffect, useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamic imports for better code splitting and reduced initial bundle
const NewYearAnimation = dynamic(() => import('./NewYearAnimation'), {
  ssr: false,
  loading: () => null
});
const DiwaliAnimation = dynamic(() => import('./DiwaliAnimation'), {
  ssr: false,
  loading: () => null
});
const ChristmasAnimation = dynamic(() => import('./ChristmasAnimation'), {
  ssr: false,
  loading: () => null
});
const HoliAnimation = dynamic(() => import('./HoliAnimation'), {
  ssr: false,
  loading: () => null
});
const EidAnimation = dynamic(() => import('./EidAnimation'), {
  ssr: false,
  loading: () => null
});
const IndependenceDayAnimation = dynamic(() => import('./IndependenceDayAnimation'), {
  ssr: false,
  loading: () => null
});
const Geometric3DAnimation = dynamic(() => import('./Geometric3DAnimation'), {
  ssr: false,
  loading: () => null
});
const ParticleVortexAnimation = dynamic(() => import('./ParticleVortexAnimation'), {
  ssr: false,
  loading: () => null
});
const NeonWaveAnimation = dynamic(() => import('./NeonWaveAnimation'), {
  ssr: false,
  loading: () => null
});
const Starfield3DAnimation = dynamic(() => import('./Starfield3DAnimation'), {
  ssr: false,
  loading: () => null
});

// Advanced animation components - available for future use
// const MasterCelebration = dynamic(() => import('./MasterCelebration'), {
//   ssr: false,
//   loading: () => null
// });

type AnimationType = 'NEW_YEAR' | 'DIWALI' | 'CHRISTMAS' | 'HOLI' | 'EID' | 'INDEPENDENCE_DAY' | 'GEOMETRIC_3D' | 'PARTICLE_VORTEX' | 'NEON_WAVES' | 'STARFIELD_3D' | 'NONE';

interface ActiveAnimation {
  animationType: AnimationType;
  customMessage: string | null;
}

export default function AnimationDisplay() {
  const pathname = usePathname();
  const [activeAnimation, setActiveAnimation] = useState<ActiveAnimation | null>(null);
  const [loading, setLoading] = useState(true);
  const [useAdvanced, setUseAdvanced] = useState(true); // Use advanced animations by default

  // Don't show animation on admin, auth, or dashboard pages
  const isAdminPage = pathname?.startsWith('/admin') || 
                      pathname?.startsWith('/auth') || 
                      pathname?.startsWith('/dashboard');

  const fetchActiveAnimation = useCallback(async () => {
    try {
      const response = await fetch(`/api/animations/active?t=${Date.now()}`);
      if (response.ok) {
        const data = await response.json();
        setActiveAnimation(data);
      }
    } catch (error) {
      console.error('Failed to fetch active animation:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdminPage) {
      setActiveAnimation(null);
      setLoading(false);
      return;
    }
    
    fetchActiveAnimation();
    // Refresh every 5 minutes to check for changes
    const interval = setInterval(fetchActiveAnimation, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [isAdminPage, fetchActiveAnimation]);

  // Check localStorage for user preference
  useEffect(() => {
    const preference = localStorage.getItem('useAdvancedAnimations');
    if (preference !== null) {
      setUseAdvanced(preference === 'true');
    }
  }, []);

  if (loading || !activeAnimation || activeAnimation.animationType === 'NONE') {
    return null;
  }

  const renderAnimation = () => {
    const { animationType, customMessage } = activeAnimation;
    const message = customMessage || undefined;

    // Use advanced animations for New Year and Christmas (most celebratory occasions)
    if (useAdvanced && (animationType === 'NEW_YEAR')) {
      return <NewYearAnimation customMessage={message} />;
    }

    // Fallback to standard animations
    switch (animationType) {
      case 'NEW_YEAR':
        return <NewYearAnimation customMessage={message} />;
      case 'DIWALI':
        return <DiwaliAnimation customMessage={message} />;
      case 'CHRISTMAS':
        return <ChristmasAnimation customMessage={message} />;
      case 'HOLI':
        return <HoliAnimation customMessage={message} />;
      case 'EID':
        return <EidAnimation customMessage={message} />;
      case 'INDEPENDENCE_DAY':
        return <IndependenceDayAnimation customMessage={message} />;
      case 'GEOMETRIC_3D':
        return <Geometric3DAnimation customMessage={message} />;
      case 'PARTICLE_VORTEX':
        return <ParticleVortexAnimation customMessage={message} />;
      case 'NEON_WAVES':
        return <NeonWaveAnimation customMessage={message} />;
      case 'STARFIELD_3D':
        return <Starfield3DAnimation customMessage={message} />;
      default:
        return null;
    }
  };

  return renderAnimation();
}
