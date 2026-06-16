'use client';

import Head from 'next/head';
import { usePageSEO } from '@/hooks/useSEO';
import { usePathname } from 'next/navigation';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonicalUrl?: string;
  robots?: string;
  pageName?: string; // Override automatic page detection
}

export default function SEOHead({
  title,
  description,
  keywords,
  ogTitle,
  ogDescription,
  ogImage,
  twitterTitle,
  twitterDescription,
  twitterImage,
  canonicalUrl,
  robots,
  pageName
}: SEOHeadProps) {
  const pathname = usePathname();
  const currentPage = pageName || pathname;
  const { seoConfig } = usePageSEO(currentPage);

  // Use props first, then fallback to database config, then defaults
  const finalTitle = title || seoConfig?.title || 'IJARCM - International Journal of Research in Computer Applications and Management';
  const finalDescription = description || seoConfig?.description || 'Leading international journal for research in computer applications and management. Publish your research with peer review process.';
  const finalKeywords = keywords || seoConfig?.keywords || 'research, computer applications, management, journal, academic, peer review';
  const finalOgTitle = ogTitle || seoConfig?.ogTitle || finalTitle;
  const finalOgDescription = ogDescription || seoConfig?.ogDescription || finalDescription;
  const finalOgImage = ogImage || seoConfig?.ogImage || '/images/og-default.jpg';
  const finalTwitterTitle = twitterTitle || seoConfig?.twitterTitle || finalTitle;
  const finalTwitterDescription = twitterDescription || seoConfig?.twitterDescription || finalDescription;
  const finalTwitterImage = twitterImage || seoConfig?.twitterImage || finalOgImage;
  const finalCanonicalUrl = canonicalUrl || seoConfig?.canonicalUrl || `https://ijrcam.com${pathname}`;
  const finalRobots = robots || seoConfig?.robots || 'index, follow';

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      <meta name="robots" content={finalRobots} />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta charSet="utf-8" />
      
      {/* Canonical URL */}
      <link rel="canonical" href={finalCanonicalUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={finalOgTitle} />
      <meta property="og:description" content={finalOgDescription} />
      <meta property="og:image" content={finalOgImage} />
      <meta property="og:url" content={finalCanonicalUrl} />
      <meta property="og:site_name" content="IJARCM" />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={finalTwitterTitle} />
      <meta name="twitter:description" content={finalTwitterDescription} />
      <meta name="twitter:image" content={finalTwitterImage} />
      
      {/* Additional Meta Tags */}
      <meta name="author" content="IJARCM Editorial Team" />
      <meta name="publisher" content="IJARCM" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "IJARCM",
            "description": finalDescription,
            "url": "https://ijrcam.com",
            "logo": "https://ijrcam.com/images/ijarcm-logo.svg",
            "sameAs": [
              "https://twitter.com/ijrcam",
              "https://linkedin.com/company/ijrcam"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "Editorial Office",
              "email": "editor@ijrcam.com"
            }
          })
        }}
      />
    </Head>
  );
}

// Helper component for article pages
interface ArticleSEOProps extends SEOHeadProps {
  articleTitle?: string;
  articleDescription?: string;
  authors?: string[];
  publishedDate?: string;
  modifiedDate?: string;
  articleUrl?: string;
}

export function ArticleSEOHead({
  articleTitle,
  articleDescription,
  authors,
  publishedDate,
  modifiedDate,
  articleUrl,
  ...seoProps
}: ArticleSEOProps) {
  const pathname = usePathname();
  const finalArticleUrl = articleUrl || `https://ijrcam.com${pathname}`;

  return (
    <>
      <SEOHead {...seoProps} />
      <Head>
        {/* Article-specific structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "ScholarlyArticle",
              "headline": articleTitle,
              "description": articleDescription,
              "author": authors?.map(author => ({
                "@type": "Person",
                "name": author
              })),
              "publisher": {
                "@type": "Organization",
                "name": "IJARCM",
                "logo": "https://ijarcm.com/images/ijarcm-logo.svg"
              },
              "datePublished": publishedDate,
              "dateModified": modifiedDate || publishedDate,
              "url": finalArticleUrl,
              "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": finalArticleUrl
              }
            })
          }}
        />
      </Head>
    </>
  );
}