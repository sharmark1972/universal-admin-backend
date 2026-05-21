'use client';

import { useVisitorTracking } from '@/hooks/useVisitorTracking';

interface VisitorTrackingProviderProps {
  children: React.ReactNode;
}

export default function VisitorTrackingProvider({ children }: VisitorTrackingProviderProps) {
  // This hook will automatically track page visits
  useVisitorTracking();
  
  return <>{children}</>;
}