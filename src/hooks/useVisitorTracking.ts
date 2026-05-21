import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

// Generate a simple session ID
function generateSessionId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

// Get or create session ID
function getSessionId(): string {
  if (typeof window === 'undefined') return '';
  
  let sessionId = sessionStorage.getItem('visitor_session_id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('visitor_session_id', sessionId);
  }
  return sessionId;
}

export function useVisitorTracking() {
  const pathname = usePathname();
  const trackedPages = useRef(new Set<string>());
  const isTracking = useRef(false);
  
  useEffect(() => {
    // Only track in browser environment
    if (typeof window === 'undefined') return;
    
    // Skip tracking for authentication pages to avoid interference during login
    const authPaths = ['/auth/login', '/auth/register', '/api/auth'];
    if (authPaths.some(path => pathname.startsWith(path))) {
      return;
    }
    
    // Don't track the same page multiple times in the same session
    if (trackedPages.current.has(pathname)) return;
    
    // Prevent multiple simultaneous tracking requests
    if (isTracking.current) return;
    
    const trackVisitor = async () => {
      try {
        isTracking.current = true;
        const sessionId = getSessionId();
        
        // Add a small delay to ensure page is fully loaded
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        const response = await fetch('/api/visitors', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            page: pathname,
            sessionId,
          }),
        });
        
        if (response.ok) {
          // Mark this page as tracked for this session
          trackedPages.current.add(pathname);
        }
      } catch (error) {
        console.error('Failed to track visitor:', error);
      } finally {
        isTracking.current = false;
      }
    };
    
    // Track after a delay to avoid blocking page load
    const timeoutId = setTimeout(trackVisitor, 2000);
    
    return () => {
      clearTimeout(timeoutId);
      isTracking.current = false;
    };
  }, [pathname]);
}

export async function getVisitorAnalytics(timeframe: '1d' | '7d' | '30d' = '7d') {
  try {
    const response = await fetch(`/api/visitors?timeframe=${timeframe}`);
    if (!response.ok) {
      throw new Error('Failed to fetch analytics');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching visitor analytics:', error);
    return null;
  }
}