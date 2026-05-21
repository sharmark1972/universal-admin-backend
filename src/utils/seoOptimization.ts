/**
 * Comprehensive SEO Optimization Utilities
 * Integrates all SEO components and provides centralized optimization
 */

import { Metadata } from 'next';
import { generateCanonicalUrl } from './canonicalUrl';
import { generateSitemapLinks } from './internalLinking';
import { validateHeadingHierarchy } from './headingStructure';

export interface SEOPageData {
  title: string;
  description: string;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  image?: {
    url: string;
    alt: string;
    width?: number;
    height?: number;
  };
  type?: 'website' | 'article' | 'profile' | 'book';
  locale?: string;
  alternateLocales?: string[];
}

export interface AcademicPageData extends SEOPageData {
  authors?: Array<{
    name: string;
    affiliation?: string;
    orcid?: string;
  }>;
  doi?: string;
  issn?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  journal?: string;
  conference?: string;
  abstract?: string;
  citations?: number;
  references?: string[];
}

/**
 * Generate comprehensive metadata for a page
 */
export function generatePageMetadata(
  data: SEOPageData,
  pathname: string,
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'https://ijrcam.com'
): Metadata {
  const canonicalUrl = generateCanonicalUrl(pathname, baseUrl);
  const fullImageUrl = data.image?.url ? 
    (data.image.url.startsWith('http') ? data.image.url : `${baseUrl}${data.image.url}`) : 
    `${baseUrl}/images/ijrcam-og-image.jpg`;

  return {
    title: data.title,
    description: data.description,
    keywords: data.keywords?.join(', '),
    authors: data.author ? [{ name: data.author }] : undefined,
    creator: data.author,
    publisher: 'IJARCM - INTERNATIONAL JOURNAL OF ACADEMIC RESEARCH IN COMMERCE AND MANAGEMENT',
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      type: data.type || 'article',
      locale: data.locale || 'en_US',
      url: canonicalUrl,
      siteName: 'IJARCM',
      title: data.title,
      description: data.description,
      publishedTime: data.publishedTime,
      modifiedTime: data.modifiedTime,
      section: data.section,
      tags: data.tags,
      images: [
        {
          url: fullImageUrl,
          width: data.image?.width || 1200,
          height: data.image?.height || 630,
          alt: data.image?.alt || data.title
        }
      ]
    },
    twitter: {
      card: 'summary_large_image',
      site: '@ijrcam',
      creator: data.author ? `@${data.author.replace(/\s+/g, '').toLowerCase()}` : '@ijrcam',
      title: data.title,
      description: data.description,
      images: [fullImageUrl]
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    }
  };
}

/**
 * Generate academic paper metadata
 */
export function generateAcademicMetadata(
  data: AcademicPageData,
  pathname: string,
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'https://ijrcam.com'
): Metadata {
  const baseMetadata = generatePageMetadata(data, pathname, baseUrl);
  
  // Add academic-specific metadata
  const academicKeywords = [
    ...(data.keywords || []),
    'research paper',
    'academic publication',
    'peer reviewed',
    data.journal || 'IJARCM'
  ];
  
  return {
    ...baseMetadata,
    keywords: academicKeywords.join(', '),
    other: {
      'citation_title': data.title,
      'citation_author': data.authors?.map(a => a.name).join('; ') || data.author || '',
      'citation_publication_date': data.publishedTime?.split('T')[0] || '',
      'citation_journal_title': data.journal || 'IJARCM - INTERNATIONAL JOURNAL OF ACADEMIC RESEARCH IN COMMERCE AND MANAGEMENT',
      'citation_issn_print': data.issn || '2455-0116',
      'citation_issn_electronic': '2395-6410',
      'citation_volume': data.volume || '',
      'citation_issue': data.issue || '',
      'citation_firstpage': data.pages?.split('-')[0] || '',
      'citation_lastpage': data.pages?.split('-')[1] || '',
      'citation_doi': data.doi || '',
      'citation_abstract_html_url': `${baseUrl}${pathname}`,
      'citation_pdf_url': `${baseUrl}${pathname}/pdf`,
      'DC.title': data.title,
      'DC.creator': data.authors?.map(a => a.name).join('; ') || data.author || '',
      'DC.subject': data.keywords?.join('; ') || '',
      'DC.description': data.abstract || data.description,
      'DC.publisher': 'IJARCM - INTERNATIONAL JOURNAL OF ACADEMIC RESEARCH IN COMMERCE AND MANAGEMENT',
      'DC.date': data.publishedTime?.split('T')[0] || '',
      'DC.type': 'Text.Serial.Journal',
      'DC.format': 'text/html',
      'DC.identifier': data.doi || `${baseUrl}${pathname}`,
      'DC.language': data.locale?.split('_')[0] || 'en'
    }
  };
}

/**
 * Generate structured data for academic papers
 */
export function generateAcademicStructuredData(data: AcademicPageData, pathname: string, baseUrl: string) {
  const canonicalUrl = `${baseUrl}${pathname}`;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'ScholarlyArticle',
    headline: data.title,
    description: data.abstract || data.description,
    author: data.authors?.map(author => ({
      '@type': 'Person',
      name: author.name,
      affiliation: author.affiliation ? {
        '@type': 'Organization',
        name: author.affiliation
      } : undefined,
      identifier: author.orcid ? {
        '@type': 'PropertyValue',
        propertyID: 'ORCID',
        value: author.orcid
      } : undefined
    })) || (data.author ? [{
      '@type': 'Person',
      name: data.author
    }] : []),
    datePublished: data.publishedTime,
    dateModified: data.modifiedTime,
    publisher: {
      '@type': 'Organization',
      name: 'IJARCM - INTERNATIONAL JOURNAL OF ACADEMIC RESEARCH IN COMMERCE AND MANAGEMENT',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/images/ijarcm-logo.svg`
      }
    },
    isPartOf: {
      '@type': 'Periodical',
      name: data.journal || 'IJARCM - INTERNATIONAL JOURNAL OF ACADEMIC RESEARCH IN COMMERCE AND MANAGEMENT',
      issn: data.issn || '2455-0116',
      issnElectronic: '2395-6410'
    },
    volumeNumber: data.volume,
    issueNumber: data.issue,
    pageStart: data.pages?.split('-')[0],
    pageEnd: data.pages?.split('-')[1],
    identifier: data.doi ? {
      '@type': 'PropertyValue',
      propertyID: 'DOI',
      value: data.doi
    } : canonicalUrl,
    url: canonicalUrl,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl
    },
    image: data.image ? {
      '@type': 'ImageObject',
      url: data.image.url.startsWith('http') ? data.image.url : `${baseUrl}${data.image.url}`,
      width: data.image.width || 1200,
      height: data.image.height || 630
    } : undefined,
    keywords: data.keywords?.join(', '),
    about: data.tags?.map(tag => ({
      '@type': 'Thing',
      name: tag
    })),
    citation: data.references?.map(ref => ({
      '@type': 'CreativeWork',
      name: ref
    })),
    citedBy: data.citations ? {
      '@type': 'ScholarlyArticle',
      name: `${data.citations} citations`
    } : undefined
  };
}

/**
 * Generate structured data for organization/journal
 */
export function generateOrganizationStructuredData(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'IJARCM - INTERNATIONAL JOURNAL OF ACADEMIC RESEARCH IN COMMERCE AND MANAGEMENT',
    alternateName: 'IJARCM',
    url: baseUrl,
    logo: {
      '@type': 'ImageObject',
      url: `${baseUrl}/images/ijarcm-logo.svg`,
      width: 200,
      height: 60
    },
    description: 'IJARCM is a premier international journal publishing high-quality research in academic research, commerce, and management.',
    foundingDate: '2012',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+91-9999999999',
      contactType: 'Editorial Office',
      email: 'editor@ijrcam.com'
    },
    sameAs: [
      'https://twitter.com/ijrcam',
      'https://linkedin.com/company/ijrcam',
      'https://facebook.com/ijrcam'
    ],
    publishingPrinciples: `${baseUrl}/editorial-policy`,
    ethicsPolicy: `${baseUrl}/ethics-policy`
  };
}

/**
 * Generate website structured data
 */
export function generateWebsiteStructuredData(baseUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'IJARCM - INTERNATIONAL JOURNAL OF ACADEMIC RESEARCH IN COMMERCE AND MANAGEMENT',
    alternateName: 'IJARCM',
    url: baseUrl,
    description: 'IJARCM is a premier international journal publishing high-quality research in academic research, commerce, and management.',
    publisher: {
      '@type': 'Organization',
      name: 'IJARCM - INTERNATIONAL JOURNAL OF ACADEMIC RESEARCH IN COMMERCE AND MANAGEMENT'
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${baseUrl}/search?q={search_term_string}`
      },
      'query-input': 'required name=search_term_string'
    },
    mainEntity: {
      '@type': 'Periodical',
      name: 'International Journal of Research in Computer Applications and Management',
      issn: '2455-0116',
      issnElectronic: '2395-6410',
      url: baseUrl
    }
  };
}

/**
 * Optimize page for search engines
 */
export function optimizePageSEO(pathname: string) {
  if (typeof window === 'undefined') return;
  
  // Validate heading structure
  const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(el => ({
    level: parseInt(el.tagName.charAt(1)) as 1 | 2 | 3 | 4 | 5 | 6,
    text: el.textContent || '',
    id: el.id,
    className: el.className
  }));
  const headingValidation = validateHeadingHierarchy(headings);
  if (!headingValidation.isValid) {
    console.warn('SEO Warning: Invalid heading structure detected', headingValidation.errors);
  }
  
  // Generate internal links
  const internalLinks = generateSitemapLinks();
  
  // Add structured data if not present
  const existingStructuredData = document.querySelectorAll('script[type="application/ld+json"]');
  if (existingStructuredData.length === 0) {
    console.warn('SEO Warning: No structured data found on page');
  }
  
  // Check for canonical URL
  const canonicalLink = document.querySelector('link[rel="canonical"]');
  if (!canonicalLink) {
    console.warn('SEO Warning: No canonical URL found');
  }
  
  // Check for meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (!metaDescription) {
    console.warn('SEO Warning: No meta description found');
  }
  
  return {
    headingValidation,
    internalLinks,
    hasStructuredData: existingStructuredData.length > 0,
    hasCanonicalUrl: !!canonicalLink,
    hasMetaDescription: !!metaDescription
  };
}

/**
 * Generate sitemap entry for a page
 */
export function generateSitemapEntry(
  pathname: string,
  lastModified: Date = new Date(),
  changeFreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never' = 'monthly',
  priority: number = 0.5,
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'https://ijrcam.com'
) {
  return {
    url: `${baseUrl}${pathname}`,
    lastModified: lastModified.toISOString(),
    changeFrequency: changeFreq,
    priority: Math.min(1.0, Math.max(0.0, priority))
  };
}

/**
 * Generate RSS feed item
 */
export function generateRSSItem(
  data: SEOPageData,
  pathname: string,
  baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'https://ijrcam.com'
) {
  return {
    title: data.title,
    description: data.description,
    link: `${baseUrl}${pathname}`,
    guid: `${baseUrl}${pathname}`,
    pubDate: data.publishedTime ? new Date(data.publishedTime).toUTCString() : new Date().toUTCString(),
    author: data.author || 'IJARCM Editorial Board',
    category: data.tags || data.keywords || [],
    enclosure: data.image ? {
      url: data.image.url.startsWith('http') ? data.image.url : `${baseUrl}${data.image.url}`,
      type: 'image/jpeg'
    } : undefined
  };
}

/**
 * SEO optimization checklist
 */
export const SEO_CHECKLIST = {
  technical: [
    'Title tag (30-60 characters)',
    'Meta description (120-160 characters)',
    'Canonical URL',
    'Structured data (JSON-LD)',
    'XML sitemap inclusion',
    'Robots.txt compliance',
    'SSL certificate',
    'Mobile-friendly design',
    'Page speed optimization'
  ],
  content: [
    'Single H1 tag per page',
    'Proper heading hierarchy (H1 > H2 > H3)',
    'Descriptive alt text for images',
    'Internal linking strategy',
    'Keyword optimization',
    'Content quality and uniqueness',
    'Proper URL structure',
    'Breadcrumb navigation'
  ],
  social: [
    'Open Graph tags',
    'Twitter Card tags',
    'Social media sharing buttons',
    'Author attribution',
    'Publication date markup'
  ],
  academic: [
    'Citation metadata',
    'Dublin Core metadata',
    'DOI integration',
    'ORCID author identification',
    'Academic search engine optimization',
    'Reference linking',
    'Abstract optimization'
  ]
};