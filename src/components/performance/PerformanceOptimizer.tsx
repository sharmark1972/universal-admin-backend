'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface PerformanceOptimizerProps {
  children: React.ReactNode;
  enableLazyLoading?: boolean;
  enableImageOptimization?: boolean;
  enablePrefetching?: boolean;
}

const PerformanceOptimizer: React.FC<PerformanceOptimizerProps> = ({
  children,
  enableLazyLoading = true,
  enableImageOptimization = true,
  enablePrefetching = true
}) => {
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Implement intersection observer for lazy loading
    if (enableLazyLoading) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setIsVisible(true);
              observer.unobserve(entry.target);
            }
          });
        },
        {
          rootMargin: '50px 0px',
          threshold: 0.1
        }
      );

      const elements = document.querySelectorAll('[data-lazy]');
      elements.forEach((el) => observer.observe(el));

      return () => observer.disconnect();
    }
  }, [enableLazyLoading]);

  useEffect(() => {
    // Prefetch critical resources
    if (enablePrefetching) {
      prefetchCriticalResources();
    }
  }, [enablePrefetching, pathname]);

  useEffect(() => {
    // Optimize images
    if (enableImageOptimization) {
      optimizeImages();
    }
  }, [enableImageOptimization]);

  useEffect(() => {
    // Monitor Core Web Vitals
    monitorCoreWebVitals();
  }, []);

  return (
    <>
      {/* Critical CSS inlining */}
      <style jsx>{`
        /* Critical above-the-fold styles */
        .critical-content {
          font-display: swap;
          contain: layout style paint;
        }
        
        /* Optimize font loading */}
        @font-face {
          font-family: 'Inter';
          font-style: normal;
          font-weight: 400;
          font-display: swap;
          src: url('/fonts/inter-regular.woff2') format('woff2');
        }
        
        /* Reduce layout shift */
        img, video {
          height: auto;
          max-width: 100%;
        }
        
        /* Optimize animations */
        * {
          will-change: auto;
        }
        
        .animate {
          will-change: transform;
        }
        
        /* Reduce paint complexity */
        .complex-bg {
          contain: paint;
        }
      `}</style>
      
      {/* Preload critical resources */}
      <link rel="preload" href="/fonts/inter-regular.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
      <link rel="preload" href="/api/papers" as="fetch" crossOrigin="anonymous" />
      
      {/* DNS prefetch for external resources */}
      <link rel="dns-prefetch" href="//fonts.googleapis.com" />
      <link rel="dns-prefetch" href="//www.google-analytics.com" />
      <link rel="preconnect" href="//fonts.gstatic.com" crossOrigin="anonymous" />
      
      {children}
    </>
  );
};

// Helper functions
function prefetchCriticalResources() {
  // Prefetch critical API endpoints
  const criticalEndpoints = [
    '/api/papers?limit=10',
    '/api/announcements?limit=5',
    '/api/authors?featured=true'
  ];

  criticalEndpoints.forEach(endpoint => {
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        fetch(endpoint, { method: 'HEAD' }).catch(() => {});
      });
    }
  });

  // Prefetch likely next pages
  const likelyPages = ['/papers', '/authors', '/submit'];
  likelyPages.forEach(page => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = page;
    document.head.appendChild(link);
  });
}

function optimizeImages() {
  // Implement progressive image loading
  const images = document.querySelectorAll('img[data-src]');
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.src = img.dataset.src || '';
          img.classList.remove('lazy');
          imageObserver.unobserve(img);
        }
      });
    });

    images.forEach(img => imageObserver.observe(img));
  }

  // Add loading="lazy" to images below the fold
  const belowFoldImages = document.querySelectorAll('img:not([loading])');
  belowFoldImages.forEach((img, index) => {
    if (index > 2) { // First 3 images load eagerly
      img.setAttribute('loading', 'lazy');
    }
  });
}

function monitorCoreWebVitals() {
  // Monitor Largest Contentful Paint (LCP)
  if ('PerformanceObserver' in window) {
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        
        // Log LCP for monitoring
        console.debug('LCP:', lastEntry.startTime);
        
        // Send to analytics if needed
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'web_vitals', {
            name: 'LCP',
            value: Math.round(lastEntry.startTime),
            event_category: 'Performance'
          });
        }
      });
      
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

      // Monitor First Input Delay (FID)
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const fidEntry = entry as PerformanceEventTiming;
          console.debug('FID:', fidEntry.processingStart - fidEntry.startTime);
          
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'web_vitals', {
              name: 'FID',
              value: Math.round(fidEntry.processingStart - fidEntry.startTime),
              event_category: 'Performance'
            });
          }
        });
      });
      
      fidObserver.observe({ entryTypes: ['first-input'] });

      // Monitor Cumulative Layout Shift (CLS)
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          const clsEntry = entry as any; // Layout shift entry
          if (!clsEntry.hadRecentInput) {
            clsValue += clsEntry.value;
          }
        });
        
        console.debug('CLS:', clsValue);
        
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'web_vitals', {
            name: 'CLS',
            value: Math.round(clsValue * 1000),
            event_category: 'Performance'
          });
        }
      });
      
      clsObserver.observe({ entryTypes: ['layout-shift'] });

    } catch (error) {
      console.warn('Performance monitoring not supported:', error);
    }
  }

  // Monitor resource loading performance
  window.addEventListener('load', () => {
    setTimeout(() => {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        const metrics = {
          dns: navigation.domainLookupEnd - navigation.domainLookupStart,
          tcp: navigation.connectEnd - navigation.connectStart,
          ttfb: navigation.responseStart - navigation.requestStart,
          download: navigation.responseEnd - navigation.responseStart,
          domInteractive: navigation.domInteractive - navigation.fetchStart,
          domComplete: navigation.domComplete - navigation.fetchStart,
          loadComplete: navigation.loadEventEnd - navigation.fetchStart
        };
        
        console.debug('Performance Metrics:', metrics);
        
        // Send to analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          Object.entries(metrics).forEach(([key, value]) => {
            (window as any).gtag('event', 'timing_complete', {
              name: key,
              value: Math.round(value),
              event_category: 'Performance'
            });
          });
        }
      }
    }, 0);
  });
}

export default PerformanceOptimizer;

// Export utility functions for use in other components
export {
  prefetchCriticalResources,
  optimizeImages,
  monitorCoreWebVitals
};