'use client';

import React from 'react';
import Head from 'next/head';
import { usePathname } from 'next/navigation';
import DynamicSEO from '../DynamicSEO';
import SEOMetaTags from '../SEOMetaTags';
import SchemaMarkup from '../SchemaMarkup';
import StructuredData from '../StructuredData';
import BreadcrumbsComponent from '../ui/Breadcrumbs';

interface SEOLayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  structuredData?: any;
  breadcrumbs?: Array<{ label: string; href: string }>;
  noIndex?: boolean;
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    authors?: string[];
    section?: string;
    tags?: string[];
  };
}

const SEOLayout: React.FC<SEOLayoutProps> = ({
  children,
  title,
  description,
  keywords,
  ogImage,
  canonicalUrl,
  structuredData,
  breadcrumbs,
  noIndex = false,
  article
}) => {
  const pathname = usePathname();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ijarcm.com';
  
  // Generate default values based on pathname
  const defaultTitle = getDefaultTitle(pathname);
  const defaultDescription = getDefaultDescription(pathname);
  const defaultKeywords = getDefaultKeywords(pathname);
  const defaultBreadcrumbs = generateBreadcrumbs(pathname);
  
  const finalTitle = title || defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalKeywords = keywords || defaultKeywords;
  const finalCanonicalUrl = canonicalUrl || `${baseUrl}${pathname}`;
  const finalBreadcrumbs = breadcrumbs || defaultBreadcrumbs;
  
  // Generate structured data based on page type
  const pageStructuredData = structuredData || generateDefaultStructuredData(pathname, {
    title: finalTitle,
    description: finalDescription,
    url: finalCanonicalUrl,
    article
  });

  return (
    <>
      <Head>
        <title>{finalTitle}</title>
        <meta name="description" content={finalDescription} />
        {finalKeywords && <meta name="keywords" content={finalKeywords} />}
        <link rel="canonical" href={finalCanonicalUrl} />
        {noIndex && <meta name="robots" content="noindex, nofollow" />}
        
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="//fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Academic-specific meta tags */}
        <meta name="citation_journal_title" content="International Journal of Research in Computer Applications and Management" />
        <meta name="citation_journal_abbrev" content="IJARCM" />
        <meta name="citation_issn_print" content="2455-0116" />
        <meta name="citation_issn_electronic" content="2395-6410" />
        <meta name="citation_publisher" content="IJARCM" />
        
        {/* Dublin Core metadata for academic content */}
        <meta name="DC.title" content={finalTitle} />
        <meta name="DC.description" content={finalDescription} />
        <meta name="DC.publisher" content="IJARCM" />
        <meta name="DC.type" content="Text" />
        <meta name="DC.format" content="text/html" />
        <meta name="DC.language" content="en" />
        
        {/* Academic search engine tags */}
        <meta name="google-scholar" content="index" />
        <meta name="semantic-scholar" content="index" />
      </Head>
      
      <DynamicSEO
        title={finalTitle}
        description={finalDescription}
        keywords={finalKeywords.split(', ')}
        ogImage={ogImage}
        canonicalUrl={finalCanonicalUrl}
      />
      
      <SEOMetaTags
        title={finalTitle}
        description={finalDescription}
        keywords={finalKeywords}
        image={ogImage}
        canonicalUrl={finalCanonicalUrl}
      />
      
      {pageStructuredData && (
        <StructuredData />
      )}
      
      {finalBreadcrumbs.length > 0 && (
        <BreadcrumbsComponent items={finalBreadcrumbs} />
      )}
      
      {children}
    </>
  );
};

// Helper functions
function getDefaultTitle(pathname: string): string {
  const titles: Record<string, string> = {
    '/': 'IJARCM - International Journal of Research in Computer Applications and Management',
    '/about': 'About IJARCM - Leading Academic Journal',
    '/papers': 'Research Papers - IJARCM',
    '/authors': 'Authors - IJARCM',
    '/submit': 'Submit Your Research - IJARCM',
    '/contact': 'Contact Us - IJARCM',
    '/guidelines': 'Submission Guidelines - IJARCM',
    '/editorial-board': 'Editorial Board - IJARCM',
    '/issues': 'Issues - IJARCM',
    '/announcements': 'Announcements - IJARCM'
  };
  
  return titles[pathname] || 'IJARCM - International Journal of Research';
}

function getDefaultDescription(pathname: string): string {
  const descriptions: Record<string, string> = {
    '/': 'IJARCM is a leading international journal publishing high-quality research in computer applications and management. Submit your research today.',
    '/about': 'Learn about IJARCM, our mission, vision, and commitment to advancing research in computer applications and management.',
    '/papers': 'Browse our collection of peer-reviewed research papers in computer science, management, and related fields.',
    '/authors': 'Discover renowned researchers and authors who have contributed to IJARCM.',
    '/submit': 'Submit your research paper to IJARCM. Fast peer review process and global visibility.',
    '/contact': 'Get in touch with IJARCM editorial team. We are here to help with your research publication needs.',
    '/guidelines': 'Comprehensive submission guidelines for authors. Ensure your paper meets our publication standards.',
    '/editorial-board': 'Meet our distinguished editorial board members and their areas of expertise.',
    '/issues': 'Browse all published journal issues of IJARCM. Access research papers, articles, and scholarly publications.',
    '/announcements': 'Stay updated with the latest news, announcements, and updates from IJARCM.'
  };
  
  return descriptions[pathname] || 'IJARCM - International Journal of Research in Computer Applications and Management';
}

function getDefaultKeywords(pathname: string): string {
  const keywords: Record<string, string> = {
    '/': 'academic journal, computer science, management, research papers, peer review, IJARCM',
    '/papers': 'research papers, computer science, management, academic publications, peer reviewed',
    '/authors': 'researchers, authors, computer science, management, academic experts',
    '/submit': 'submit paper, research submission, academic publishing, peer review',
    '/about': 'academic journal, research publication, computer applications, management research'
  };
  
  return keywords[pathname] || 'academic journal, research, computer science, management';
}

function generateBreadcrumbs(pathname: string): Array<{ label: string; href: string }> {
  const segments = pathname.split('/').filter(Boolean);
  const breadcrumbs = [{ label: 'Home', href: '/' }];
  
  let currentPath = '';
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
    breadcrumbs.push({ label, href: currentPath });
  });
  
  return breadcrumbs;
}

function generateDefaultStructuredData(pathname: string, data: any) {
  const baseStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: data.title,
    description: data.description,
    url: data.url,
    publisher: {
      '@type': 'Organization',
      name: 'IJARCM',
      url: 'https://ijarcm.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://ijarcm.com/ijarcm-logo.svg'
      }
    }
  };
  
  // Add specific structured data based on page type
  if (pathname === '/') {
    return {
      ...baseStructuredData,
      '@type': 'WebSite',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://ijarcm.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string'
      }
    };
  }
  
  if (pathname.startsWith('/papers/')) {
    return {
      ...baseStructuredData,
      '@type': 'ScholarlyArticle',
      publisher: {
        '@type': 'Organization',
        name: 'IJARCM'
      }
    };
  }
  
  return baseStructuredData;
}

export default SEOLayout;