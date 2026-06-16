'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface SessionProviderProps {
  children: ReactNode;
}

function SessionPersistenceManager() {
  const { data: session, status } = useSession();

  useEffect(() => {
    // Only run in browser environment
    if (typeof window === 'undefined') return;

    // Handle session persistence and recovery
    if (status === 'authenticated' && session) {
      // Store session metadata for recovery
      try {
        sessionStorage.setItem('session_timestamp', Date.now().toString());
        sessionStorage.setItem('user_email', session.user?.email || '');
      } catch (error) {
        console.warn('Failed to store session metadata:', error);
      }
    } else if (status === 'unauthenticated') {
      // Clear session metadata on logout
      try {
        sessionStorage.removeItem('session_timestamp');
        sessionStorage.removeItem('user_email');
      } catch (error) {
        console.warn('Failed to clear session metadata:', error);
      }
    }
  }, [session, status]);

  return null;
}

export function SessionProvider({ children }: SessionProviderProps) {
  return (
    <NextAuthSessionProvider>
      <SessionPersistenceManager />
      {children}
    </NextAuthSessionProvider>
  );
}