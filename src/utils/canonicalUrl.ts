/**
 * Canonical URL utilities for SEO optimization
 * Ensures proper URL canonicalization across the IJARCM website
 */

export interface CanonicalUrlOptions {
  removeTrailingSlash?: boolean;
  removeQueryParams?: boolean;
  preserveParams?: string[];
  forceHttps?: boolean;
  removeFragment?: boolean;
}

/**
 * Generate canonical URL for a given path
 */
export function generateCanonicalUrl(
  path: string,
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'https://ijrcam.com',
  options: CanonicalUrlOptions = {}
): string {
  const {
    removeTrailingSlash = true,
    removeQueryParams = true,
    preserveParams = [],
    forceHttps = true,
    removeFragment = true
  } = options;

  try {
    // Ensure baseUrl has protocol
    if (!baseUrl.startsWith('http')) {
      baseUrl = `https://${baseUrl}`;
    }

    // Force HTTPS if required
    if (forceHttps && baseUrl.startsWith('http://')) {
      baseUrl = baseUrl.replace('http://', 'https://');
    }

    // Create URL object
    const url = new URL(path, baseUrl);

    // Remove fragment if required
    if (removeFragment) {
      url.hash = '';
    }

    // Handle query parameters
    if (removeQueryParams && preserveParams.length === 0) {
      url.search = '';
    } else if (removeQueryParams && preserveParams.length > 0) {
      const searchParams = new URLSearchParams(url.search);
      const newSearchParams = new URLSearchParams();
      
      preserveParams.forEach(param => {
        const value = searchParams.get(param);
        if (value !== null) {
          newSearchParams.set(param, value);
        }
      });
      
      url.search = newSearchParams.toString();
    }

    // Handle trailing slash
    if (removeTrailingSlash && url.pathname.endsWith('/') && url.pathname !== '/') {
      url.pathname = url.pathname.slice(0, -1);
    }

    return url.toString();
  } catch (error) {
    console.error('Error generating canonical URL:', error);
    return `${baseUrl}${path}`;
  }
}

/**
 * Get current page canonical URL (client-side)
 */
export function getCurrentCanonicalUrl(options?: CanonicalUrlOptions): string {
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_BASE_URL || 'https://ijrcam.com';
  }

  return generateCanonicalUrl(window.location.pathname + window.location.search, undefined, options);
}

/**
 * Generate canonical URLs for different page types
 */
export const canonicalUrls = {
  home: () => generateCanonicalUrl('/'),
  
  about: () => generateCanonicalUrl('/about'),
  
  library: (filters?: { category?: string; year?: string; author?: string }) => {
    const path = '/library';
    if (!filters || Object.keys(filters).length === 0) {
      return generateCanonicalUrl(path);
    }
    
    // For filtered library pages, include relevant filters in canonical URL
    const searchParams = new URLSearchParams();
    if (filters.category) searchParams.set('category', filters.category);
    if (filters.year) searchParams.set('year', filters.year);
    if (filters.author) searchParams.set('author', filters.author);
    
    return generateCanonicalUrl(`${path}?${searchParams.toString()}`, undefined, {
      removeQueryParams: false
    });
  },
  
  paper: (paperId: string) => generateCanonicalUrl(`/papers/${paperId}`),
  
  author: (authorId: string) => generateCanonicalUrl(`/authors/${authorId}`),
  
  conference: (conferenceId: string) => generateCanonicalUrl(`/conferences/${conferenceId}`),
  
  announcement: (announcementId: string) => generateCanonicalUrl(`/announcements/${announcementId}`),
  
  archives: (year?: string, volume?: string, issue?: string) => {
    let path = '/archives';
    if (year) path += `/${year}`;
    if (volume) path += `/${volume}`;
    if (issue) path += `/${issue}`;
    return generateCanonicalUrl(path);
  },
  
  contact: () => generateCanonicalUrl('/contact'),
  
  submit: () => generateCanonicalUrl('/submit'),
  
  guidelines: () => generateCanonicalUrl('/guidelines'),
  
  editorial: () => generateCanonicalUrl('/editorial'),
  
  // API endpoints
  rss: {
    papers: () => generateCanonicalUrl('/api/rss/papers.xml'),
    announcements: () => generateCanonicalUrl('/api/rss/announcements.xml')
  },
  
  sitemap: () => generateCanonicalUrl('/sitemap.xml')
};

/**
 * Validate canonical URL
 */
export function validateCanonicalUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    
    // Check if it's a valid HTTP/HTTPS URL
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      return false;
    }
    
    // Check if it's not a relative URL
    if (!urlObj.hostname) {
      return false;
    }
    
    return true;
  } catch {
    return false;
  }
}

/**
 * Get alternate URLs for different languages/versions
 */
export function getAlternateUrls(currentPath: string): Array<{ rel: string; href: string; hreflang?: string }> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ijrcam.com';
  
  return [
    {
      rel: 'canonical',
      href: generateCanonicalUrl(currentPath)
    },
    {
      rel: 'alternate',
      href: generateCanonicalUrl('/api/rss/papers.xml'),
      hreflang: 'en'
    },
    {
      rel: 'alternate',
      href: generateCanonicalUrl('/api/rss/announcements.xml'),
      hreflang: 'en'
    }
  ];
}

/**
 * Generate hreflang tags for international SEO
 */
export function generateHreflangTags(currentPath: string): Array<{ hreflang: string; href: string }> {
  // Currently IJARCM is English-only, but this can be extended for multilingual support
  return [
    {
      hreflang: 'en',
      href: generateCanonicalUrl(currentPath)
    },
    {
      hreflang: 'x-default',
      href: generateCanonicalUrl(currentPath)
    }
  ];
}

/**
 * Check for duplicate content and suggest canonical URL
 */
export function detectDuplicateContent(urls: string[]): { canonical: string; duplicates: string[] } {
  const normalizedUrls = urls.map(url => {
    try {
      const urlObj = new URL(url);
      // Normalize by removing query params and fragments
      return `${urlObj.protocol}//${urlObj.hostname}${urlObj.pathname}`;
    } catch {
      return url;
    }
  });
  
  // Find the most common normalized URL
  const urlCounts = normalizedUrls.reduce((acc, url) => {
    acc[url] = (acc[url] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const canonical = Object.keys(urlCounts).reduce((a, b) => 
    urlCounts[a] > urlCounts[b] ? a : b
  );
  
  const duplicates = urls.filter((_, index) => normalizedUrls[index] !== canonical);
  
  return { canonical, duplicates };
}