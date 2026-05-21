'use client';

import React, { useEffect } from 'react';
import { 
  loadCriticalResources, 
  measureWebVitals, 
  preconnectToDomains 
} from '@/utils/performance';

interface PerformanceProviderProps {
  children: React.ReactNode;
}

const PerformanceProvider: React.FC<PerformanceProviderProps> = ({ children }) => {
  useEffect(() => {
    // Initialize performance optimizations
    loadCriticalResources();
    
    // Preconnect to external domains
    preconnectToDomains([
      'https://fonts.googleapis.com',
      'https://fonts.gstatic.com',
      'https://api.ijrcam.com'
    ]);
    
    // Start measuring Web Vitals
    measureWebVitals((metrics) => {
      // Log metrics or send to analytics
      console.log('Web Vitals metrics:', metrics);
    });
    
    // Report Web Vitals to analytics (if available)
    if (typeof window !== 'undefined' && 'gtag' in window) {
      import('web-vitals').then(({ onCLS, onINP, onFCP, onLCP, onTTFB }) => {
        onCLS((metric) => {
          // gtag is added by Google Analytics script
          (window as Window & { gtag?: (...args: unknown[]) => void }).gtag?.('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: metric.name,
            value: Math.round(metric.value),
            non_interaction: true,
          });
        });
        
        onINP((metric) => {
          // gtag is added by Google Analytics script
          (window as Window & { gtag?: (...args: unknown[]) => void }).gtag?.('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: metric.name,
            value: Math.round(metric.value),
            non_interaction: true,
          });
        });
        
        onFCP((metric) => {
          // gtag is added by Google Analytics script
          (window as Window & { gtag?: (...args: unknown[]) => void }).gtag?.('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: metric.name,
            value: Math.round(metric.value),
            non_interaction: true,
          });
        });
        
        onLCP((metric) => {
          // gtag is added by Google Analytics script
          (window as Window & { gtag?: (...args: unknown[]) => void }).gtag?.('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: metric.name,
            value: Math.round(metric.value),
            non_interaction: true,
          });
        });
        
        onTTFB((metric) => {
          // gtag is added by Google Analytics script
          (window as Window & { gtag?: (...args: unknown[]) => void }).gtag?.('event', 'web_vitals', {
            event_category: 'Web Vitals',
            event_label: metric.name,
            value: Math.round(metric.value),
            non_interaction: true,
          });
        });
      }).catch(() => {
        // Silently fail if web-vitals is not available
      });
    }
  }, []);

  return <>{children}</>;
};

export default PerformanceProvider;