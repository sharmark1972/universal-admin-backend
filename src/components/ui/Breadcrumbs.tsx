'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  showHome?: boolean;
  separator?: React.ReactNode;
  maxItems?: number;
}

/**
 * Generate breadcrumb items from pathname
 */
function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs: BreadcrumbItem[] = [];
  
  // Add home
  breadcrumbs.push({
    label: 'Home',
    href: '/'
  });
  
  // Generate breadcrumbs for each segment
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Convert segment to readable label
    let label = segment
      .replace(/-/g, ' ')
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Handle special cases
    switch (segment) {
      case 'admin':
        label = 'Administration';
        break;
      case 'papers':
        label = 'Research Papers';
        break;
      case 'authors':
        label = 'Authors';
        break;
      case 'conferences':
        label = 'Conferences';
        break;
      case 'announcements':
        label = 'Announcements';
        break;
      case 'archives':
        label = 'Archives';
        break;
      case 'submit':
        label = 'Submit Paper';
        break;
      case 'review':
        label = 'Review Process';
        break;
      case 'editorial-board':
        label = 'Editorial Board';
        break;
      case 'about':
        label = 'About Us';
        break;
      case 'contact':
        label = 'Contact';
        break;
      case 'privacy':
        label = 'Privacy Policy';
        break;
      case 'terms':
        label = 'Terms of Service';
        break;
    }
    
    breadcrumbs.push({
      label,
      href: currentPath,
      isCurrentPage: index === segments.length - 1
    });
  });
  
  return breadcrumbs;
}

/**
 * Truncate breadcrumbs if too many items
 */
function truncateBreadcrumbs(items: BreadcrumbItem[], maxItems: number): BreadcrumbItem[] {
  if (items.length <= maxItems) {
    return items;
  }
  
  const first = items[0];
  const last = items[items.length - 1];
  const remaining = maxItems - 2; // Account for first and last
  
  if (remaining <= 0) {
    return [first, last];
  }
  
  const middle = items.slice(-remaining - 1, -1);
  
  return [
    first,
    { label: '...', href: '#', isCurrentPage: false },
    ...middle,
    last
  ];
}

export default function Breadcrumbs({
  items,
  className,
  showHome = true,
  separator = <ChevronRight className="h-4 w-4" />,
  maxItems = 5
}: BreadcrumbsProps) {
  const pathname = usePathname();
  
  // Use provided items or generate from pathname
  const breadcrumbItems = items || generateBreadcrumbsFromPath(pathname);
  
  // Filter out home if not wanted
  const filteredItems = showHome ? breadcrumbItems : breadcrumbItems.slice(1);
  
  // Truncate if too many items
  const finalItems = truncateBreadcrumbs(filteredItems, maxItems);
  
  if (finalItems.length <= 1) {
    return null;
  }
  
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn('flex items-center space-x-1 text-sm text-muted-foreground', className)}
    >
      <ol className="flex items-center space-x-1">
        {finalItems.map((item, index) => {
          const isLast = index === finalItems.length - 1;
          const isEllipsis = item.label === '...';
          
          return (
            <li key={`${item.href}-${index}`} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-muted-foreground/50" aria-hidden="true">
                  {separator}
                </span>
              )}
              
              {isEllipsis ? (
                <span className="px-2 py-1 text-muted-foreground/70">
                  {item.label}
                </span>
              ) : isLast || item.isCurrentPage ? (
                <span
                  className="font-medium text-foreground"
                  aria-current="page"
                >
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-foreground transition-colors duration-200 hover:underline"
                >
                  {index === 0 && showHome ? (
                    <span className="flex items-center gap-1">
                      <Home className="h-4 w-4" />
                      <span className="sr-only">{item.label}</span>
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

/**
 * Structured data for breadcrumbs (SEO)
 */
export function BreadcrumbStructuredData({ items }: { items: BreadcrumbItem[] }) {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: {
        '@type': 'WebPage',
        '@id': `${process.env.NEXT_PUBLIC_BASE_URL || 'https://ijrcam.com'}${item.href}`
      }
    }))
  };
  
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

/**
 * Hook to get current breadcrumb items
 */
export function useBreadcrumbs(customItems?: BreadcrumbItem[]): BreadcrumbItem[] {
  const pathname = usePathname();
  
  return React.useMemo(() => {
    return customItems || generateBreadcrumbsFromPath(pathname);
  }, [pathname, customItems]);
}

/**
 * Breadcrumb container with structured data
 */
export function BreadcrumbContainer({
  items,
  includeStructuredData = true,
  ...props
}: BreadcrumbsProps & { includeStructuredData?: boolean }) {
  const breadcrumbItems = useBreadcrumbs(items);
  
  return (
    <>
      <Breadcrumbs items={breadcrumbItems} {...props} />
      {includeStructuredData && (
        <BreadcrumbStructuredData items={breadcrumbItems} />
      )}
    </>
  );
}

/**
 * Simple breadcrumb for specific pages
 */
export function SimpleBreadcrumb({
  currentPage,
  parentPage,
  className
}: {
  currentPage: string;
  parentPage?: { label: string; href: string };
  className?: string;
}) {
  const items: BreadcrumbItem[] = [
    { label: 'Home', href: '/' }
  ];
  
  if (parentPage) {
    items.push(parentPage);
  }
  
  items.push({
    label: currentPage,
    href: '#',
    isCurrentPage: true
  });
  
  return <Breadcrumbs items={items} className={className} />;
}