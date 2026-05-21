'use client';

import Head from 'next/head';
import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string[];
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'book' | 'profile';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  noindex?: boolean;
  nofollow?: boolean;
  structuredData?: object;
}

const DynamicSEO: React.FC<SEOProps> = ({
  title,
  description,
  keywords = [],
  author,
  publishedTime,
  modifiedTime,
  canonicalUrl,
  ogImage,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  noindex = false,
  nofollow = false,
  structuredData
}) => {
  const baseTitle = 'IJARCM - International Journal of Research in Computer Applications and Management';
  const baseDescription = 'Leading international journal publishing high-quality research in computer applications and management. Peer-reviewed articles, open access, and academic excellence.';
  const baseUrl = 'https://ijrcam.com';
  const defaultImage = `${baseUrl}/images/og-image.jpg`;

  const fullTitle = title ? `${title} | ${baseTitle}` : baseTitle;
  const fullDescription = description || baseDescription;
  const fullCanonicalUrl = canonicalUrl || (typeof window !== 'undefined' ? window.location.href : baseUrl);
  const fullOgImage = ogImage || defaultImage;

  // Generate robots meta content
  const robotsContent = [
    noindex ? 'noindex' : 'index',
    nofollow ? 'nofollow' : 'follow'
  ].join(', ');

  useEffect(() => {
    // Update document title
    document.title = fullTitle;

    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', fullDescription);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'description';
      meta.content = fullDescription;
      document.head.appendChild(meta);
    }

    // Update meta keywords
    if (keywords.length > 0) {
      const metaKeywords = document.querySelector('meta[name="keywords"]');
      const keywordsContent = keywords.join(', ');
      if (metaKeywords) {
        metaKeywords.setAttribute('content', keywordsContent);
      } else {
        const meta = document.createElement('meta');
        meta.name = 'keywords';
        meta.content = keywordsContent;
        document.head.appendChild(meta);
      }
    }

    // Update canonical URL
    const canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', fullCanonicalUrl);
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = fullCanonicalUrl;
      document.head.appendChild(link);
    }

    // Update robots meta
    const robotsMeta = document.querySelector('meta[name="robots"]');
    if (robotsMeta) {
      robotsMeta.setAttribute('content', robotsContent);
    } else {
      const meta = document.createElement('meta');
      meta.name = 'robots';
      meta.content = robotsContent;
      document.head.appendChild(meta);
    }

    // Update Open Graph tags
    const updateOrCreateMeta = (property: string, content: string) => {
      const existingMeta = document.querySelector(`meta[property="${property}"]`);
      if (existingMeta) {
        existingMeta.setAttribute('content', content);
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('property', property);
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    updateOrCreateMeta('og:title', fullTitle);
    updateOrCreateMeta('og:description', fullDescription);
    updateOrCreateMeta('og:url', fullCanonicalUrl);
    updateOrCreateMeta('og:image', fullOgImage);
    updateOrCreateMeta('og:type', ogType);
    updateOrCreateMeta('og:site_name', baseTitle);

    if (publishedTime) {
      updateOrCreateMeta('article:published_time', publishedTime);
    }

    if (modifiedTime) {
      updateOrCreateMeta('article:modified_time', modifiedTime);
    }

    if (author) {
      updateOrCreateMeta('article:author', author);
    }

    // Update Twitter Card tags
    const updateOrCreateTwitterMeta = (name: string, content: string) => {
      const existingMeta = document.querySelector(`meta[name="${name}"]`);
      if (existingMeta) {
        existingMeta.setAttribute('content', content);
      } else {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    updateOrCreateTwitterMeta('twitter:card', twitterCard);
    updateOrCreateTwitterMeta('twitter:title', fullTitle);
    updateOrCreateTwitterMeta('twitter:description', fullDescription);
    updateOrCreateTwitterMeta('twitter:image', fullOgImage);
    updateOrCreateTwitterMeta('twitter:site', '@ijrcam');

    // Add structured data if provided
    if (structuredData) {
      const existingScript = document.querySelector('script[type="application/ld+json"]');
      if (existingScript) {
        existingScript.textContent = JSON.stringify(structuredData);
      } else {
        const script = document.createElement('script');
        script.type = 'application/ld+json';
        script.textContent = JSON.stringify(structuredData);
        document.head.appendChild(script);
      }
    }

    // Cleanup function
    return () => {
      // Note: We don't remove meta tags on cleanup as they should persist
      // until the next page navigation or component update
    };
  }, [
    fullTitle,
    fullDescription,
    keywords,
    author,
    publishedTime,
    modifiedTime,
    fullCanonicalUrl,
    fullOgImage,
    ogType,
    twitterCard,
    robotsContent,
    structuredData
  ]);

  return null; // This component doesn't render anything visible
};

export default DynamicSEO;

// Helper function to generate SEO props for common page types
export const generateSEOProps = {
  paper: (paper: {
    title: string;
    abstract?: string;
    authors?: Array<{ name: string }>;
    publishedAt: string;
    keywords?: string[];
    category?: string;
    id: string;
  }) => ({
    title: paper.title,
    description: paper.abstract ? (paper.abstract.substring(0, 160) + '...') : 'Research paper published in IJARCM.',
    keywords: paper.keywords || [],
    author: paper.authors && paper.authors.length > 0 ? paper.authors.map(a => a?.name || 'Unknown Author').join(', ') : 'IJARCM Authors',
    publishedTime: paper.publishedAt,
    canonicalUrl: `https://ijrcam.com/papers/${paper.id}`,
    ogType: 'article' as const,
    ogImage: `https://ijrcam.com/api/og/paper/${paper.id}`,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'ScholarlyArticle',
      headline: paper.title,
      abstract: paper.abstract || 'Research paper published in IJARCM.',
      author: paper.authors && paper.authors.length > 0 ? paper.authors.map(author => ({
        '@type': 'Person',
        name: author?.name || 'Unknown Author'
      })) : [{
        '@type': 'Person',
        name: 'IJARCM Authors'
      }],
      datePublished: paper.publishedAt,
      publisher: {
        '@type': 'Organization',
        name: 'IJARCM'
      }
    }
  }),

  author: (author: {
    name: string;
    bio?: string;
    affiliation?: string;
    email?: string;
    id: string;
  }) => ({
    title: `${author.name} - Author Profile`,
    description: author.bio || `Research profile and publications by ${author.name} at IJARCM.`,
    author: author.name,
    canonicalUrl: `https://ijrcam.com/authors/${author.id}`,
    ogType: 'profile' as const,
    structuredData: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: author.name,
      description: author.bio,
      affiliation: author.affiliation,
      email: author.email
    }
  }),

  category: (category: {
    name: string;
    description?: string;
    slug: string;
  }) => ({
    title: `${category.name} Research Papers`,
    description: category.description || `Browse research papers in ${category.name} published in IJARCM.`,
    keywords: [category.name, 'research papers', 'academic journal'],
    canonicalUrl: `https://ijrcam.com/papers/category/${category.slug}`,
    ogType: 'website' as const
  })
};

// Hook for easy SEO management
export const useSEO = (seoProps: SEOProps) => {
  useEffect(() => {
    // This hook can be used to trigger SEO updates
    // The actual SEO updates are handled by the DynamicSEO component
  }, [seoProps]);

  return seoProps;
};