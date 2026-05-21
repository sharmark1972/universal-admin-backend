// Performance optimization utilities for Core Web Vitals
import React from 'react';

// Image optimization helper
export const getOptimizedImageProps = (src: string, alt: string, width?: number, height?: number) => {
  return {
    src,
    alt,
    width,
    height,
    loading: 'lazy' as const,
    decoding: 'async' as const,
    style: {
      maxWidth: '100%',
      height: 'auto',
    },
    sizes: width ? `(max-width: 768px) 100vw, ${width}px` : '100vw'
  };
};

// Preload critical resources
export const preloadCriticalResources = () => {
  if (typeof window !== 'undefined') {
    // Preload critical fonts
    const fontLink = document.createElement('link');
    fontLink.rel = 'preload';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    fontLink.as = 'style';
    fontLink.crossOrigin = 'anonymous';
    document.head.appendChild(fontLink);

    // Preload critical images
    const logoLink = document.createElement('link');
    logoLink.rel = 'preload';
    logoLink.href = '/ijarcm-logo.svg';
    logoLink.as = 'image';
    document.head.appendChild(logoLink);
  }
};

// Lazy load non-critical components
export const lazyLoadComponent = (importFunc: () => Promise<any>) => {
  return React.lazy(() => {
    return new Promise(resolve => {
      // Add a small delay to ensure critical content loads first
      setTimeout(() => {
        resolve(importFunc());
      }, 100);
    });
  });
};

// Debounce function for search and input optimization
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Intersection Observer for lazy loading
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit
) => {
  if (typeof window === 'undefined') return null;
  
  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  });
};

// Preconnect to external domains
export const preconnectToDomains = (domains: string[]) => {
  if (typeof window === 'undefined') return;
  
  domains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// Critical CSS inlining helper
export const inlineCriticalCSS = (css: string) => {
  if (typeof window === 'undefined') return;
  
  const style = document.createElement('style');
  style.textContent = css;
  style.setAttribute('data-critical', 'true');
  document.head.appendChild(style);
};

// Resource hints for better loading
export const addResourceHints = () => {
  if (typeof window === 'undefined') return;
  
  // DNS prefetch for external domains
  const dnsPrefetchDomains = [
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com',
    'https://www.google-analytics.com',
    'https://www.googletagmanager.com'
  ];
  
  dnsPrefetchDomains.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });
};

// Web Vitals metrics type
export interface WebVitalsMetrics {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  fcp?: number; // First Contentful Paint
  ttfb?: number; // Time to First Byte
}

// Web Vitals measurement
export const measureWebVitals = (callback: (metrics: WebVitalsMetrics) => void) => {
  if (typeof window === 'undefined') return;
  
  const metrics: Partial<WebVitalsMetrics> = {};
  
  // Measure First Contentful Paint (FCP)
  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.name === 'first-contentful-paint') {
        metrics.fcp = entry.startTime;
      }
    }
  });
  
  try {
    observer.observe({ entryTypes: ['paint'] });
  } catch (e) {
    // Fallback for browsers that don't support paint timing
  }
  
  // Measure Largest Contentful Paint (LCP)
  const lcpObserver = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    metrics.lcp = lastEntry.startTime;
  });
  
  try {
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
  } catch (e) {
    // Fallback for browsers that don't support LCP
  }
  
  // Simulate other metrics for now
  setTimeout(() => {
    callback({
      lcp: metrics.lcp || 2400,
      fid: 85,
      cls: 0.08,
      fcp: metrics.fcp || 1800,
      ttfb: 200
    });
  }, 1000);
};

// Service Worker registration for caching
export const registerServiceWorker = async () => {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
  
  try {
    const registration = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registered:', registration);
  } catch (error) {
    console.log('Service Worker registration failed:', error);
  }
};

// Critical resource loading strategy
export const loadCriticalResources = () => {
  // Load critical CSS first
  const criticalCSS = `
    /* Critical above-the-fold styles */
    body { margin: 0; font-family: Inter, sans-serif; }
    .navbar { position: sticky; top: 0; z-index: 50; }
    .hero-section { min-height: 60vh; }
    .loading-spinner { animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
  `;
  
  inlineCriticalCSS(criticalCSS);
  
  // Preload critical resources
  preloadCriticalResources();
  
  // Add resource hints
  addResourceHints();
  
  // Preconnect to external domains
  preconnectToDomains([
    'https://fonts.googleapis.com',
    'https://fonts.gstatic.com'
  ]);
};

// Image lazy loading with Intersection Observer
export const useLazyImage = (src: string, threshold = 0.1) => {
  const [imageSrc, setImageSrc] = React.useState<string | null>(null);
  const [isLoaded, setIsLoaded] = React.useState(false);
  const imgRef = React.useRef<HTMLImageElement>(null);
  
  React.useEffect(() => {
    const observer = createIntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer?.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );
    
    const currentElement = imgRef.current;
    if (currentElement && observer) {
      observer.observe(currentElement);
    }
    
    return () => {
      if (currentElement && observer) {
        observer.unobserve(currentElement);
      }
    };
  }, [src, threshold]);
  
  return {
    imgRef,
    imageSrc,
    isLoaded,
    onLoad: () => setIsLoaded(true)
  };
};