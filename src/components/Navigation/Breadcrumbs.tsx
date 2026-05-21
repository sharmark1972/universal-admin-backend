'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbsProps {
  customItems?: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export default function Breadcrumbs({ 
  customItems, 
  showHome = true, 
  className = '' 
}: BreadcrumbsProps) {
  const pathname = usePathname();
  
  // Generate breadcrumb items from pathname if no custom items provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (customItems) return customItems;
    
    const pathSegments = pathname.split('/').filter(segment => segment !== '');
    const breadcrumbs: BreadcrumbItem[] = [];
    
    if (showHome) {
      breadcrumbs.push({
        label: 'Home',
        href: '/'
      });
    }
    
    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      // Format segment label
      let label = segment
        .replace(/-/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      // Handle special cases
      if (segment === 'api') label = 'API';
      if (segment === 'rss') label = 'RSS';
      if (segment === 'admin') label = 'Administration';
      if (segment === 'auth') label = 'Authentication';
      
      // Handle dynamic routes
      if (segment.startsWith('[') && segment.endsWith(']')) {
        const paramName = segment.slice(1, -1);
        label = `${paramName.charAt(0).toUpperCase() + paramName.slice(1)} Details`;
      }
      
      breadcrumbs.push({
        label,
        href: currentPath,
        isCurrentPage: isLast
      });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbItems = generateBreadcrumbs();
  
  // Don't render if only home page
  if (breadcrumbItems.length <= 1 && pathname === '/') {
    return null;
  }
  
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={`flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400 ${className}`}
    >
      <ol className="flex items-center space-x-2">
        {breadcrumbItems.map((item, index) => {
          const isLast = index === breadcrumbItems.length - 1;
          
          return (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />
              )}
              
              {isLast || item.isCurrentPage ? (
                <span 
                  className="font-medium text-gray-900 dark:text-gray-100"
                  aria-current="page"
                >
                  {index === 0 && showHome ? (
                    <span className="flex items-center">
                      <Home className="w-4 h-4 mr-1" />
                      {item.label}
                    </span>
                  ) : (
                    item.label
                  )}
                </span>
              ) : (
                <Link 
                  href={item.href}
                  className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200"
                >
                  {index === 0 && showHome ? (
                    <span className="flex items-center">
                      <Home className="w-4 h-4 mr-1" />
                      {item.label}
                    </span>
                  ) : (
                    item.label
                  )}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

// Structured data for breadcrumbs (JSON-LD)
export function BreadcrumbStructuredData({ items }: { items: BreadcrumbItem[] }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': items.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item.label,
      'item': `https://ijrcam.com${item.href}`
    }))
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// Hook for getting breadcrumb data
export function useBreadcrumbs(customItems?: BreadcrumbItem[]) {
  const pathname = usePathname();
  
  const generateBreadcrumbs = React.useCallback((): BreadcrumbItem[] => {
    if (customItems) return customItems;
    
    const pathSegments = pathname.split('/').filter(segment => segment !== '');
    const breadcrumbs: BreadcrumbItem[] = [
      {
        label: 'Home',
        href: '/'
      }
    ];
    
    let currentPath = '';
    
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const isLast = index === pathSegments.length - 1;
      
      let label = segment
        .replace(/-/g, ' ')
        .replace(/([a-z])([A-Z])/g, '$1 $2')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      if (segment === 'api') label = 'API';
      if (segment === 'rss') label = 'RSS';
      if (segment === 'admin') label = 'Administration';
      if (segment === 'auth') label = 'Authentication';
      
      if (segment.startsWith('[') && segment.endsWith(']')) {
        const paramName = segment.slice(1, -1);
        label = `${paramName.charAt(0).toUpperCase() + paramName.slice(1)} Details`;
      }
      
      breadcrumbs.push({
        label,
        href: currentPath,
        isCurrentPage: isLast
      });
    });
    
    return breadcrumbs;
  }, [pathname, customItems]);
  
  return generateBreadcrumbs();
}

// Predefined breadcrumbs for common pages
export const commonBreadcrumbs = {
  library: [
    { label: 'Home', href: '/' },
    { label: 'Library', href: '/library', isCurrentPage: true }
  ],
  conferences: [
    { label: 'Home', href: '/' },
    { label: 'Conferences', href: '/conferences', isCurrentPage: true }
  ],
  about: [
    { label: 'Home', href: '/' },
    { label: 'About', href: '/about', isCurrentPage: true }
  ],
  submission: [
    { label: 'Home', href: '/' },
    { label: 'Submission Guidelines', href: '/submission', isCurrentPage: true }
  ],
  editorial: [
    { label: 'Home', href: '/' },
    { label: 'Editorial Board', href: '/editorial', isCurrentPage: true }
  ],
  issues: [
    { label: 'Home', href: '/' },
    { label: 'Issues', href: '/issues', isCurrentPage: true }
  ]
};