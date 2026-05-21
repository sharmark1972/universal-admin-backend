'use client';

import { useEffect } from 'react';
import { onCLS, onFCP, onLCP, onTTFB } from 'web-vitals';

interface Metric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

function sendToAnalytics(metric: Metric) {
  // Send to your analytics service
  if (process.env.NODE_ENV === 'production') {
    // Example: Google Analytics 4
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', metric.name, {
        event_category: 'Web Vitals',
        event_label: metric.id,
        value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
        custom_map: {
          metric_rating: metric.rating,
        },
      });
    }
  }
  
  // Log in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Web Vital:', {
      name: metric.name,
      value: metric.value,
      rating: metric.rating,
      delta: metric.delta,
      id: metric.id,
    });
  }
}

export default function WebVitals() {
  useEffect(() => {
    // Measure Core Web Vitals
    onCLS(sendToAnalytics);
    onFCP(sendToAnalytics);
    onLCP(sendToAnalytics);
    onTTFB(sendToAnalytics);
  }, []);

  return null;
}

// Hook for manual performance tracking
export function usePerformanceTracking() {
  const trackPageLoad = (pageName: string) => {
    if (typeof window !== 'undefined') {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigationEntry) {
        const metrics = {
          page: pageName,
          loadTime: navigationEntry ? navigationEntry.loadEventEnd - navigationEntry.fetchStart : 0,
          domContentLoaded: navigationEntry.domContentLoadedEventEnd - navigationEntry.domContentLoadedEventStart,
          firstByte: navigationEntry.responseStart - navigationEntry.requestStart,
          domInteractive: navigationEntry.domInteractive - navigationEntry.fetchStart,
        };
        
        if (process.env.NODE_ENV === 'development') {
          console.log('Page Performance:', metrics);
        }
        
        // Send to analytics in production
        if (process.env.NODE_ENV === 'production' && (window as any).gtag) {
          (window as any).gtag('event', 'page_load_performance', {
            event_category: 'Performance',
            event_label: pageName,
            custom_map: metrics,
          });
        }
      }
    }
  };

  const trackUserInteraction = (action: string, element: string) => {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      
      if (process.env.NODE_ENV === 'development') {
        console.log('Interaction Performance:', {
          action,
          element,
          duration: Math.round(duration),
        });
      }
      
      // Send to analytics in production
      if (process.env.NODE_ENV === 'production' && (window as any).gtag) {
        (window as any).gtag('event', 'user_interaction_performance', {
          event_category: 'Performance',
          event_label: `${action}_${element}`,
          value: Math.round(duration),
        });
      }
    };
  };

  return {
    trackPageLoad,
    trackUserInteraction,
  };
}