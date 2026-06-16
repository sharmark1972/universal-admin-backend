'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  separator?: React.ReactNode;
}

// Default breadcrumb mappings
const defaultMappings: Record<string, string> = {
  '/': 'Home',
  '/papers': 'Papers',
  '/authors': 'Authors',
  '/about': 'About',
  '/contact': 'Contact',
  '/submit': 'Submit Paper',
  '/guidelines': 'Guidelines',
  '/editorial-board': 'Editorial Board',
  '/announcements': 'Announcements',
  '/archives': 'Archives',
  '/issues': 'Issues',
  '/search': 'Search',
  '/privacy': 'Privacy Policy',
  '/terms': 'Terms of Service'
};

// Category mappings
const categoryMappings: Record<string, string> = {
  'computer-science': 'Computer Science',
  'artificial-intelligence': 'Artificial Intelligence',
  'machine-learning': 'Machine Learning',
  'data-science': 'Data Science',
  'software-engineering': 'Software Engineering',
  'information-systems': 'Information Systems',
  'cybersecurity': 'Cybersecurity',
  'human-computer-interaction': 'Human-Computer Interaction',
  'database-systems': 'Database Systems',
  'networking': 'Networking',
  'management': 'Management',
  'business-strategy': 'Business Strategy',
  'project-management': 'Project Management',
  'operations-management': 'Operations Management',
  'human-resources': 'Human Resources',
  'marketing': 'Marketing',
  'finance': 'Finance',
  'entrepreneurship': 'Entrepreneurship'
};

function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];

  // Always start with home
  breadcrumbs.push({
    label: 'Home',
    href: '/'
  });

  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const isLast = index === segments.length - 1;
    
    let label = defaultMappings[currentPath];
    
    if (!label) {
      // Handle special cases
      if (segments[0] === 'papers' && segments[1] === 'category' && segments[2]) {
        label = categoryMappings[segments[2]] || segments[2].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      } else if (segments[0] === 'papers' && segments[1] && segments[1] !== 'category') {
        label = `Paper: ${segments[1]}`;
      } else if (segments[0] === 'authors' && segments[1]) {
        label = `Author: ${segments[1]}`;
      } else if (segments[0] === 'announcements' && segments[1]) {
        label = `Announcement: ${segments[1]}`;
      } else if (segments[0] === 'archives' && segments[1]) {
        label = `Archive: ${segments[1]}`;
      } else if (segments[0] === 'issues' && segments[1]) {
        label = `Issue: ${segments[1]}`;
      } else {
        // Default formatting
        label = segment.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      }
    }

    breadcrumbs.push({
      label,
      href: currentPath,
      current: isLast
    });
  });

  return breadcrumbs;
}

export default function Breadcrumbs({
  items,
  className = '',
  showHome = true,
  separator = <ChevronRight className="w-4 h-4 text-gray-400" />
}: BreadcrumbsProps) {
  const pathname = usePathname();
  
  // Use provided items or generate from pathname
  const breadcrumbItems = items || generateBreadcrumbsFromPath(pathname);
  
  // Filter out home if showHome is false
  const filteredItems = showHome ? breadcrumbItems : breadcrumbItems.filter(item => item.href !== '/');
  
  if (filteredItems.length <= 1) {
    return null;
  }

  return (
    <nav 
      className={`flex items-center space-x-1 text-sm ${className}`}
      aria-label="Breadcrumb"
    >
      <ol className="flex items-center space-x-1">
        {filteredItems.map((item, index) => {
          const isLast = index === filteredItems.length - 1;
          
          return (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <span className="mx-2" aria-hidden="true">
                  {separator}
                </span>
              )}
              
              {isLast || item.current ? (
                <span 
                  className="text-gray-900 font-medium"
                  aria-current="page"
                >
                  {item.href === '/' && (
                    <Home className="w-4 h-4 inline mr-1" aria-hidden="true" />
                  )}
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  {item.href === '/' && (
                    <Home className="w-4 h-4 inline mr-1" aria-hidden="true" />
                  )}
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Structured data for breadcrumbs
export function BreadcrumbsStructuredData({ items }: { items?: BreadcrumbItem[] }) {
  const pathname = usePathname();
  const breadcrumbItems = items || generateBreadcrumbsFromPath(pathname);
  
  if (breadcrumbItems.length <= 1) {
    return null;
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "item": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ijrcam.com'}${item.href}`
    }))
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// Enhanced breadcrumbs with SEO-friendly navigation
export function EnhancedBreadcrumbs({
  items,
  className = '',
  showHome = true,
  separator = <ChevronRight className="w-4 h-4 text-gray-400" />
}: BreadcrumbsProps) {
  const pathname = usePathname();
  
  // Use provided items or generate from pathname
  const breadcrumbItems = items || generateBreadcrumbsFromPath(pathname);
  
  // Filter out home if showHome is false
  const filteredItems = showHome ? breadcrumbItems : breadcrumbItems.filter(item => item.href !== '/');
  
  if (filteredItems.length <= 1) {
    return null;
  }

  // Generate structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "name": "Breadcrumb Navigation",
    "description": `Navigation breadcrumb trail for ${pathname}`,
    "itemListElement": filteredItems.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.label,
      "description": item.label,
      "item": `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ijrcam.com'}${item.href}`
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <nav
        className={`flex items-center space-x-1 text-sm ${className}`}
        aria-label="Breadcrumb navigation"
        role="navigation"
      >
        <ol className="flex items-center space-x-1">
          {filteredItems.map((item, index) => {
            const isLast = index === filteredItems.length - 1;
            
            return (
              <li key={item.href} className="flex items-center">
                {index > 0 && (
                  <span className="mx-2" aria-hidden="true">
                    {separator}
                  </span>
                )}
                
                {isLast || item.current ? (
                  <span
                    className="text-gray-900 font-medium"
                    aria-current="page"
                  >
                    {item.href === '/' && (
                      <Home className="w-4 h-4 inline mr-1" aria-hidden="true" />
                    )}
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
                    prefetch={false}
                  >
                    {item.href === '/' && (
                      <Home className="w-4 h-4 inline mr-1" aria-hidden="true" />
                    )}
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}