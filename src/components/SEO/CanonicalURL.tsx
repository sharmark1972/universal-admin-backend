'use client';

import { usePathname } from 'next/navigation';
import Head from 'next/head';

interface CanonicalURLProps {
  customUrl?: string;
  baseUrl?: string;
}

export default function CanonicalURL({ 
  customUrl, 
  baseUrl = 'https://ijrcam.com' 
}: CanonicalURLProps) {
  const pathname = usePathname();
  
  // Use custom URL if provided, otherwise construct from pathname
  const canonicalUrl = customUrl || `${baseUrl}${pathname}`;
  
  // Clean up the URL (remove trailing slashes, normalize)
  const cleanUrl = canonicalUrl
    .replace(/\/+/g, '/') // Replace multiple slashes with single slash
    .replace(/\/$/, '') // Remove trailing slash
    .replace(/^([^:]+):\/([^/])/, '$1://$2'); // Ensure proper protocol format
  
  // Add base URL if it's a relative path
  const finalUrl = cleanUrl.startsWith('http') ? cleanUrl : `${baseUrl}${cleanUrl}`;
  
  return (
    <Head>
      <link rel="canonical" href={finalUrl} />
    </Head>
  );
}

// Hook for getting canonical URL in components
export function useCanonicalURL(customUrl?: string, baseUrl = 'https://ijrcam.com') {
  const pathname = usePathname();
  
  const canonicalUrl = customUrl || `${baseUrl}${pathname}`;
  
  const cleanUrl = canonicalUrl
    .replace(/\/+/g, '/')
    .replace(/\/$/, '')
    .replace(/^([^:]+):\/([^/])/, '$1://$2');
  
  return cleanUrl.startsWith('http') ? cleanUrl : `${baseUrl}${cleanUrl}`;
}

// Utility function for internal linking
export function getInternalLink(path: string, baseUrl = 'https://ijrcam.com') {
  // Ensure path starts with /
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  
  // Clean up the path
  const cleanPath = normalizedPath
    .replace(/\/+/g, '/')
    .replace(/\/$/, '') || '/';
  
  return `${baseUrl}${cleanPath}`;
}

// Generate structured internal links for SEO
export function generateInternalLinks() {
  const baseUrl = 'https://ijrcam.com';
  
  return {
    home: getInternalLink('/', baseUrl),
    about: getInternalLink('/about', baseUrl),
    library: getInternalLink('/library', baseUrl),
    conferences: getInternalLink('/conferences', baseUrl),
    issues: getInternalLink('/issues', baseUrl),
    contact: getInternalLink('/contact', baseUrl),
    submission: getInternalLink('/submission', baseUrl),
    editorial: getInternalLink('/editorial', baseUrl),
    policies: getInternalLink('/policies', baseUrl),
    sitemap: getInternalLink('/sitemap.xml', baseUrl),
    rss: {
      papers: getInternalLink('/api/rss/papers', baseUrl),
      announcements: getInternalLink('/api/rss/announcements', baseUrl)
    }
  };
}

// Component for adding internal linking structure
export function InternalLinkStructure() {
  const links = generateInternalLinks();
  
  return (
    <Head>
      {/* Preload important internal pages */}
      <link rel="preload" href={links.library} as="document" />
      <link rel="preload" href={links.conferences} as="document" />
      
      {/* DNS prefetch for same domain */}
      <link rel="dns-prefetch" href="https://ijrcam.com" />
      
      {/* Alternate links for RSS feeds */}
      <link 
        rel="alternate" 
        type="application/rss+xml" 
        title="IJARCM Papers RSS Feed"
        href={links.rss.papers} 
      />
      <link 
        rel="alternate" 
        type="application/rss+xml" 
        title="IJARCM Announcements RSS Feed"
        href={links.rss.announcements} 
      />
    </Head>
  );
}