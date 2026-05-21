/**
 * Internal linking utilities for SEO optimization
 * Manages internal links with proper SEO attributes and link equity distribution
 */

import { canonicalUrls } from './canonicalUrl';

export interface InternalLinkOptions {
  title?: string;
  rel?: string;
  className?: string;
  prefetch?: boolean;
  priority?: 'high' | 'medium' | 'low';
  trackClick?: boolean;
  openInNewTab?: boolean;
}

export interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

/**
 * Generate SEO-optimized internal link attributes
 */
export function generateLinkAttributes(
  href: string,
  options: InternalLinkOptions = {}
): Record<string, any> {
  const {
    title,
    rel,
    className = '',
    prefetch = true,
    priority = 'medium',
    trackClick = false,
    openInNewTab = false
  } = options;

  const attributes: Record<string, any> = {
    href,
    className
  };

  // Add title for accessibility and SEO
  if (title) {
    attributes.title = title;
  }

  // Add rel attribute
  if (rel) {
    attributes.rel = rel;
  }

  // Handle external links
  if (href.startsWith('http') && !href.includes('ijrcam.com')) {
    attributes.target = '_blank';
    attributes.rel = 'noopener noreferrer';
  }

  // Handle new tab for internal links
  if (openInNewTab) {
    attributes.target = '_blank';
  }

  // Add prefetch for Next.js Link component
  if (prefetch) {
    attributes.prefetch = true;
  }

  // Add priority for resource loading
  if (priority === 'high') {
    attributes['data-priority'] = 'high';
  }

  // Add click tracking
  if (trackClick) {
    attributes['data-track'] = 'click';
  }

  return attributes;
}

/**
 * Generate breadcrumb navigation for SEO
 */
export function generateBreadcrumbs(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' }
  ];

  let currentPath = '';
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;
    
    // Generate human-readable labels
    const label = generateBreadcrumbLabel(segment, currentPath);
    
    breadcrumbs.push({
      label,
      href: currentPath,
      current: isLast
    });
  });

  return breadcrumbs;
}

/**
 * Generate human-readable breadcrumb labels
 */
function generateBreadcrumbLabel(segment: string, fullPath: string): string {
  // Handle special cases
  const labelMap: Record<string, string> = {
    'papers': 'Research Papers',
    'authors': 'Authors',
    'conferences': 'Conferences',
    'announcements': 'Announcements',
    'archives': 'Archives',
    'library': 'Research Library',
    'about': 'About Us',
    'contact': 'Contact',
    'submit': 'Submit Paper',
    'guidelines': 'Guidelines',
    'editorial': 'Editorial Board',
    'admin': 'Administration'
  };

  if (labelMap[segment]) {
    return labelMap[segment];
  }

  // Handle dynamic segments (IDs, slugs)
  if (segment.match(/^[0-9]+$/)) {
    // Numeric ID - try to get more context from path
    if (fullPath.includes('/papers/')) {
      return 'Paper Details';
    }
    if (fullPath.includes('/authors/')) {
      return 'Author Profile';
    }
    if (fullPath.includes('/conferences/')) {
      return 'Conference Details';
    }
    return 'Details';
  }

  // Convert kebab-case or snake_case to title case
  return segment
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Generate related links for content pages
 */
export function generateRelatedLinks(contentType: string, currentId?: string): Array<{
  title: string;
  href: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
}> {
  const relatedLinks: Array<{
    title: string;
    href: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
  }> = [];

  switch (contentType) {
    case 'paper':
      relatedLinks.push(
        {
          title: 'Browse All Papers',
          href: '/library',
          description: 'Explore our complete collection of research papers',
          priority: 'high'
        },
        {
          title: 'Submit Your Research',
          href: '/submit',
          description: 'Share your research with the academic community',
          priority: 'medium'
        },
        {
          title: 'Author Guidelines',
          href: '/guidelines',
          description: 'Learn about our submission and publication process',
          priority: 'medium'
        }
      );
      break;

    case 'author':
      relatedLinks.push(
        {
          title: 'All Authors',
          href: '/authors',
          description: 'Browse profiles of contributing researchers',
          priority: 'high'
        },
        {
          title: 'Research Library',
          href: '/library',
          description: 'Explore published research papers',
          priority: 'medium'
        },
        {
          title: 'Join Our Community',
          href: '/submit',
          description: 'Become a contributing author',
          priority: 'low'
        }
      );
      break;

    case 'conference':
      relatedLinks.push(
        {
          title: 'All Conferences',
          href: '/conferences',
          description: 'View upcoming and past academic conferences',
          priority: 'high'
        },
        {
          title: 'Call for Papers',
          href: '/announcements',
          description: 'Latest conference announcements and deadlines',
          priority: 'medium'
        }
      );
      break;

    default:
      relatedLinks.push(
        {
          title: 'Research Library',
          href: '/library',
          description: 'Browse our collection of academic papers',
          priority: 'high'
        },
        {
          title: 'About IJARCM',
          href: '/about',
          description: 'Learn about our journal and mission',
          priority: 'medium'
        }
      );
  }

  return relatedLinks;
}

/**
 * Generate contextual navigation links
 */
export function generateContextualNavigation(currentPath: string): Array<{
  label: string;
  href: string;
  icon?: string;
  description?: string;
}> {
  const navigation: Array<{
    label: string;
    href: string;
    icon?: string;
    description?: string;
  }> = [];

  // Add contextual links based on current path
  if (currentPath.startsWith('/papers/')) {
    navigation.push(
      { label: 'All Papers', href: '/library', icon: 'library' },
      { label: 'Submit Paper', href: '/submit', icon: 'upload' },
      { label: 'Guidelines', href: '/guidelines', icon: 'info' }
    );
  } else if (currentPath.startsWith('/authors/')) {
    navigation.push(
      { label: 'All Authors', href: '/authors', icon: 'users' },
      { label: 'Research Papers', href: '/library', icon: 'library' }
    );
  } else if (currentPath === '/library') {
    navigation.push(
      { label: 'Submit Research', href: '/submit', icon: 'upload' },
      { label: 'Author Guidelines', href: '/guidelines', icon: 'info' },
      { label: 'Archives', href: '/archives', icon: 'archive' }
    );
  }

  return navigation;
}

/**
 * Generate footer links with proper SEO structure
 */
export function generateFooterLinks(): Record<string, Array<{
  label: string;
  href: string;
  priority: 'high' | 'medium' | 'low';
}>> {
  return {
    'Research': [
      { label: 'Browse Papers', href: '/library', priority: 'high' },
      { label: 'Submit Research', href: '/submit', priority: 'high' },
      { label: 'Author Guidelines', href: '/guidelines', priority: 'medium' },
      { label: 'Archives', href: '/archives', priority: 'medium' }
    ],
    'Community': [
      { label: 'Authors', href: '/authors', priority: 'medium' },
      { label: 'Editorial Board', href: '/editorial', priority: 'medium' },
      { label: 'Conferences', href: '/conferences', priority: 'low' },
      { label: 'Announcements', href: '/announcements', priority: 'low' }
    ],
    'About': [
      { label: 'About IJARCM', href: '/about', priority: 'high' },
      { label: 'Contact Us', href: '/contact', priority: 'high' },
      { label: 'Privacy Policy', href: '/privacy', priority: 'low' },
      { label: 'Terms of Service', href: '/terms', priority: 'low' }
    ]
  };
}

/**
 * Generate sitemap-style link structure for crawlers
 */
export function generateSitemapLinks(): Array<{
  url: string;
  priority: number;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  lastmod?: string;
}> {
  return [
    { url: '/', priority: 1.0, changefreq: 'daily' },
    { url: '/library', priority: 0.9, changefreq: 'daily' },
    { url: '/submit', priority: 0.8, changefreq: 'weekly' },
    { url: '/about', priority: 0.7, changefreq: 'monthly' },
    { url: '/authors', priority: 0.6, changefreq: 'weekly' },
    { url: '/conferences', priority: 0.6, changefreq: 'weekly' },
    { url: '/announcements', priority: 0.5, changefreq: 'weekly' },
    { url: '/archives', priority: 0.5, changefreq: 'monthly' },
    { url: '/guidelines', priority: 0.4, changefreq: 'monthly' },
    { url: '/editorial', priority: 0.4, changefreq: 'monthly' },
    { url: '/contact', priority: 0.3, changefreq: 'yearly' }
  ];
}

/**
 * Validate internal link structure
 */
export function validateInternalLinks(links: string[]): {
  valid: string[];
  invalid: string[];
  warnings: string[];
} {
  const valid: string[] = [];
  const invalid: string[] = [];
  const warnings: string[] = [];

  links.forEach(link => {
    try {
      const url = new URL(link, 'https://ijrcam.com');
      
      // Check if it's an internal link
      if (url.hostname === 'ijrcam.com' || url.hostname === 'localhost') {
        valid.push(link);
        
        // Check for potential issues
        if (link.includes('#') && !link.includes('?')) {
          warnings.push(`Fragment-only link detected: ${link}`);
        }
        
        if (link.endsWith('/') && link !== '/') {
          warnings.push(`Trailing slash detected: ${link}`);
        }
      } else {
        warnings.push(`External link detected: ${link}`);
      }
    } catch (error) {
      invalid.push(link);
    }
  });

  return { valid, invalid, warnings };
}