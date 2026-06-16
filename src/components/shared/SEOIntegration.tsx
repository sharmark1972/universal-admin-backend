'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import DynamicSEO from './DynamicSEO';
import SEOMetaTags from './SEOMetaTags';
import SchemaMarkup from './SchemaMarkup';
import StructuredData from './StructuredData';
import BreadcrumbsComponent from './Breadcrumbs';

interface SEOIntegrationProps {
  // Page-specific SEO data
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  
  // Structured data props
  schemaType?: 'WebPage' | 'Article' | 'Person' | 'Organization' | 'Event' | 'Book' | 'ScholarlyArticle';
  schemaData?: any;
  
  // Article-specific props (for papers)
  article?: {
    publishedTime?: string;
    modifiedTime?: string;
    author?: string;
    section?: string;
    tags?: string[];
  };
  
  // Academic content props
  academic?: {
    authors?: Array<{
      name: string;
      affiliation?: string;
      email?: string;
    }>;
    journal?: string;
    volume?: string;
    issue?: string;
    pages?: string;
    doi?: string;
    keywords?: string[];
    abstract?: string;
    citations?: number;
  };
  
  // Breadcrumb props
  breadcrumbs?: Array<{
    label: string;
    href: string;
  }>;
  
  // Additional meta tags
  additionalMeta?: Record<string, string>;
}

const SEOIntegration: React.FC<SEOIntegrationProps> = ({
  title,
  description,
  keywords = [],
  image,
  canonicalUrl,
  noIndex = false,
  noFollow = false,
  schemaType = 'WebPage',
  schemaData,
  article,
  academic,
  breadcrumbs,
  additionalMeta = {}
}) => {
  const pathname = usePathname();
  
  // Generate page-specific defaults based on pathname
  const getPageDefaults = () => {
    const baseTitle = 'IJARCM - International Journal of Research in Computer Applications and Management';
    const baseDescription = 'Premier international journal publishing cutting-edge research in computer applications and management. Peer-reviewed articles, academic excellence, and scholarly innovation.';
    
    switch (pathname) {
      case '/':
        return {
          title: baseTitle,
          description: baseDescription,
          keywords: ['research journal', 'computer applications', 'management', 'academic publishing', 'peer review', 'scholarly articles'],
          schemaType: 'WebPage' as const
        };
      
      case '/papers':
        return {
          title: `Research Papers - ${baseTitle}`,
          description: 'Browse our collection of peer-reviewed research papers in computer applications and management. Latest publications, academic insights, and scholarly contributions.',
          keywords: ['research papers', 'academic articles', 'publications', 'computer science', 'management research'],
          schemaType: 'WebPage' as const
        };
      
      case '/authors':
        return {
          title: `Authors - ${baseTitle}`,
          description: 'Meet our distinguished authors and researchers. Leading academics and industry experts contributing to computer applications and management research.',
          keywords: ['authors', 'researchers', 'academics', 'faculty', 'experts'],
          schemaType: 'WebPage' as const
        };
      
      case '/about':
        return {
          title: `About - ${baseTitle}`,
          description: 'Learn about IJARCM, our mission, editorial board, and commitment to advancing research in computer applications and management.',
          keywords: ['about', 'mission', 'editorial board', 'journal information'],
          schemaType: 'WebPage' as const
        };
      
      case '/contact':
        return {
          title: `Contact - ${baseTitle}`,
          description: 'Get in touch with IJARCM editorial team. Submit manuscripts, ask questions, or connect with our academic community.',
          keywords: ['contact', 'editorial team', 'manuscript submission', 'academic support'],
          schemaType: 'WebPage' as const
        };
      
      case '/submit':
        return {
          title: `Submit Manuscript - ${baseTitle}`,
          description: 'Submit your research manuscript to IJARCM. Guidelines, submission process, and requirements for academic publication.',
          keywords: ['manuscript submission', 'publication guidelines', 'academic writing', 'peer review process'],
          schemaType: 'WebPage' as const
        };
      
      default:
        if (pathname.startsWith('/papers/')) {
          return {
            title: `Research Paper - ${baseTitle}`,
            description: 'Read this peer-reviewed research paper published in IJARCM. Academic insights and scholarly contributions to computer applications and management.',
            keywords: ['research paper', 'academic article', 'peer reviewed', 'scholarly publication'],
            schemaType: 'ScholarlyArticle' as const
          };
        }
        
        if (pathname.startsWith('/authors/')) {
          return {
            title: `Author Profile - ${baseTitle}`,
            description: 'Author profile and publications in IJARCM. Academic background, research interests, and scholarly contributions.',
            keywords: ['author profile', 'researcher', 'academic', 'publications'],
            schemaType: 'Person' as const
          };
        }
        
        return {
          title: baseTitle,
          description: baseDescription,
          keywords: ['research journal', 'computer applications', 'management'],
          schemaType: 'WebPage' as const
        };
    }
  };
  
  const defaults = getPageDefaults();
  
  // Merge props with defaults
  const finalTitle = title || defaults.title;
  const finalDescription = description || defaults.description;
  const finalKeywords = keywords.length > 0 ? keywords : defaults.keywords;
  const finalSchemaType = schemaType || defaults.schemaType;
  
  // Generate canonical URL
  const finalCanonicalUrl = canonicalUrl || `https://ijarcm.com${pathname}`;
  
  // Generate breadcrumbs if not provided
  const finalBreadcrumbs = breadcrumbs || generateBreadcrumbs(pathname);
  
  // Generate structured data based on content type
  const generateStructuredData = () => {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': finalSchemaType,
      name: finalTitle,
      description: finalDescription,
      url: finalCanonicalUrl,
      ...(image && { image: image })
    };
    
    if (finalSchemaType === 'ScholarlyArticle' && academic) {
      return {
        ...baseData,
        '@type': 'ScholarlyArticle',
        headline: finalTitle,
        abstract: academic.abstract,
        author: academic.authors?.map(author => ({
          '@type': 'Person',
          name: author.name,
          affiliation: author.affiliation ? {
            '@type': 'Organization',
            name: author.affiliation
          } : undefined,
          email: author.email
        })),
        publisher: {
          '@type': 'Organization',
          name: 'IJARCM - International Journal of Research in Computer Applications and Management',
          url: 'https://ijarcm.com'
        },
        isPartOf: {
          '@type': 'Periodical',
          name: academic.journal || 'IJARCM',
          issn: '2455-0116',
          issnElectronic: '2395-6410'
        },
        ...(academic.doi && { doi: academic.doi }),
        ...(academic.keywords && { keywords: academic.keywords.join(', ') }),
        ...(article?.publishedTime && { datePublished: article.publishedTime }),
        ...(article?.modifiedTime && { dateModified: article.modifiedTime })
      };
    }
    
    if (finalSchemaType === 'Person' && academic?.authors?.[0]) {
      const author = academic.authors[0];
      return {
        ...baseData,
        '@type': 'Person',
        name: author.name,
        affiliation: author.affiliation ? {
          '@type': 'Organization',
          name: author.affiliation
        } : undefined,
        email: author.email,
        worksFor: {
          '@type': 'Organization',
          name: 'IJARCM'
        }
      };
    }
    
    return schemaData || baseData;
  };
  
  return (
    <>
      {/* Dynamic SEO Component */}
      <DynamicSEO
        title={finalTitle}
        description={finalDescription}
        keywords={finalKeywords}
        ogImage={image}
        canonicalUrl={finalCanonicalUrl}
        noindex={noIndex}
        nofollow={noFollow}
      />
      
      {/* SEO Meta Tags */}
      <SEOMetaTags
        title={finalTitle}
        description={finalDescription}
        keywords={Array.isArray(finalKeywords) ? finalKeywords.join(', ') : finalKeywords}
        image={image}
        canonicalUrl={finalCanonicalUrl}
        type={finalSchemaType === 'ScholarlyArticle' ? 'article' : 'website'}
        siteName="IJARCM"
        locale="en_US"
        twitterHandle="@ijarcm"
      />
      
      {/* Schema Markup */}
      <SchemaMarkup
        type={finalSchemaType === 'ScholarlyArticle' ? 'article' : finalSchemaType === 'WebPage' ? 'website' : finalSchemaType === 'Person' ? 'person' : 'website'}
        data={generateStructuredData()}
      />
      
      {/* Structured Data */}
      <StructuredData />
      
      {/* Breadcrumbs */}
      {finalBreadcrumbs.length > 1 && (
        <BreadcrumbsComponent items={finalBreadcrumbs} />
      )}
      
      {/* Academic-specific meta tags */}
      {academic && (
        <>
          {academic.doi && (
            <meta name="citation_doi" content={academic.doi} />
          )}
          {academic.authors?.map((author, index) => (
            <meta key={index} name="citation_author" content={author.name} />
          ))}
          {academic.journal && (
            <meta name="citation_journal_title" content={academic.journal} />
          )}
          {academic.volume && (
            <meta name="citation_volume" content={academic.volume} />
          )}
          {academic.issue && (
            <meta name="citation_issue" content={academic.issue} />
          )}
          {academic.pages && (
            <meta name="citation_firstpage" content={academic.pages.split('-')[0]} />
          )}
          {article?.publishedTime && (
            <meta name="citation_publication_date" content={article.publishedTime} />
          )}
          <meta name="citation_publisher" content="IJARCM" />
        </>
      )}
      
      {/* Additional meta tags */}
      {Object.entries(additionalMeta).map(([name, content]) => (
        <meta key={name} name={name} content={content} />
      ))}
    </>
  );
};

/**
 * Generates breadcrumbs based on pathname
 */
function generateBreadcrumbs(pathname: string): Array<{ label: string; href: string }> {
  const breadcrumbs = [{ label: 'Home', href: '/' }];
  
  const segments = pathname.split('/').filter(Boolean);
  let currentPath = '';
  
  segments.forEach((segment, index) => {
    currentPath += `/${segment}`;
    
    // Convert segment to readable label
    let label = segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
    
    // Special cases for known routes
    switch (segment) {
      case 'papers':
        label = 'Research Papers';
        break;
      case 'authors':
        label = 'Authors';
        break;
      case 'about':
        label = 'About';
        break;
      case 'contact':
        label = 'Contact';
        break;
      case 'submit':
        label = 'Submit Manuscript';
        break;
      case 'admin':
        label = 'Administration';
        break;
    }
    
    breadcrumbs.push({
      label,
      href: currentPath
    });
  });
  
  return breadcrumbs;
}

export default SEOIntegration;