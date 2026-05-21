'use client';

import Head from 'next/head';
import { usePathname } from 'next/navigation';

interface SEOMetaTagsProps {
  title?: string;
  description?: string;
  keywords?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  articleSection?: string;
  articleTags?: string[];
  image?: string;
  imageAlt?: string;
  canonicalUrl?: string;
  noIndex?: boolean;
  type?: 'website' | 'article' | 'profile' | 'book';
  locale?: string;
  siteName?: string;
  twitterHandle?: string;
  jsonLd?: object;
  // Google Scholar specific props
  pdfUrl?: string;
  authorInstitutions?: string[];
  references?: string[];
  doi?: string;
  volume?: string;
  issue?: string;
  firstPage?: string;
  lastPage?: string;
  issn?: string;
  journalTitle?: string;
  journalAbbrev?: string;
  publisher?: string;
}

const SEOMetaTags: React.FC<SEOMetaTagsProps> = ({
  title,
  description,
  keywords,
  author,
  publishedTime,
  modifiedTime,
  articleSection,
  articleTags,
  image,
  imageAlt,
  canonicalUrl,
  noIndex = false,
  type = 'website',
  locale = 'en_US',
  siteName = 'IJARCM - International Journal of Research in Computer Applications and Management',
  twitterHandle = '@ijarcm',
  jsonLd,
  // Google Scholar specific props
  pdfUrl,
  authorInstitutions,
  references,
  doi,
  volume,
  issue,
  firstPage,
  lastPage,
  issn = '2455-0116',
  journalTitle = 'International Journal of Research in Computer Applications and Management',
  journalAbbrev = 'IJARCM',
  publisher = 'IJARCM'
}) => {
  const pathname = usePathname();
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://ijrcam.com';
  const currentUrl = canonicalUrl || `${baseUrl}${pathname}`;
  
  // Default values
  const defaultTitle = 'IJARCM - International Journal of Research in Computer Applications and Management';
  const defaultDescription = 'IJARCM is a premier international journal publishing high-quality research in computer applications, management, technology, and innovation. Submit your research today.';
  const defaultImage = `${baseUrl}/images/ijarcm-og-image.jpg`;
  const defaultKeywords = 'research journal, computer applications, management, technology, innovation, academic publishing, peer review, research papers';
  
  const finalTitle = title ? `${title} | ${siteName}` : defaultTitle;
  const finalDescription = description || defaultDescription;
  const finalImage = image || defaultImage;
  const finalKeywords = keywords || defaultKeywords;
  
  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{finalTitle}</title>
      <meta name="description" content={finalDescription} />
      <meta name="keywords" content={finalKeywords} />
      {author && <meta name="author" content={author} />}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      
      {/* Robots */}
      <meta name="robots" content={noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'} />
      <meta name="googlebot" content={noIndex ? 'noindex, nofollow' : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={currentUrl} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={finalTitle} />
      <meta property="og:description" content={finalDescription} />
      <meta property="og:image" content={finalImage} />
      {imageAlt && <meta property="og:image:alt" content={imageAlt} />}
      <meta property="og:url" content={currentUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />
      
      {/* Article specific Open Graph tags */}
      {type === 'article' && (
        <>
          {author && <meta property="article:author" content={author} />}
          {publishedTime && <meta property="article:published_time" content={publishedTime} />}
          {modifiedTime && <meta property="article:modified_time" content={modifiedTime} />}
          {articleSection && <meta property="article:section" content={articleSection} />}
          {articleTags && articleTags.map((tag, index) => (
            <meta key={index} property="article:tag" content={tag} />
          ))}
        </>
      )}
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content={twitterHandle} />
      <meta name="twitter:creator" content={twitterHandle} />
      <meta name="twitter:title" content={finalTitle} />
      <meta name="twitter:description" content={finalDescription} />
      <meta name="twitter:image" content={finalImage} />
      {imageAlt && <meta name="twitter:image:alt" content={imageAlt} />}
      
      {/* Academic/Research specific meta tags */}
      <meta name="citation_journal_title" content={journalTitle} />
      <meta name="citation_journal_abbrev" content={journalAbbrev} />
      <meta name="citation_issn_print" content={issn} />
      <meta name="citation_issn_electronic" content="2395-6410" />
      <meta name="citation_publisher" content={publisher} />
      
      {/* Google Scholar specific meta tags */}
      {author && <meta name="citation_author" content={author} />}
      {authorInstitutions && authorInstitutions.map((institution, index) => (
        <meta key={`institution-${index}`} name="citation_author_institution" content={institution} />
      ))}
      {publishedTime && <meta name="citation_date" content={publishedTime} />}
      {title && <meta name="citation_title" content={title} />}
      {doi && <meta name="citation_doi" content={doi} />}
      {doi && <meta name="dc.identifier" content={doi} />}
      {doi && <meta name="prism.doi" content={doi} />}
      {volume && <meta name="citation_volume" content={volume} />}
      {issue && <meta name="citation_issue" content={issue} />}
      {firstPage && <meta name="citation_firstpage" content={firstPage} />}
      {lastPage && <meta name="citation_lastpage" content={lastPage} />}
      {pdfUrl && <meta name="citation_pdf_url" content={pdfUrl} />}
      {references && references.map((reference, index) => (
        <meta key={`reference-${index}`} name="citation_reference" content={reference} />
      ))}
      {keywords && <meta name="citation_keywords" content={keywords} />}
      
      {/* Dublin Core Meta Tags for Academic Content */}
      <meta name="DC.title" content={finalTitle} />
      <meta name="DC.description" content={finalDescription} />
      <meta name="DC.publisher" content={siteName} />
      <meta name="DC.type" content="Text" />
      <meta name="DC.format" content="text/html" />
      <meta name="DC.language" content="en" />
      {author && <meta name="DC.creator" content={author} />}
      
      {/* Favicon and App Icons */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="icon" type="image/svg+xml" href="/ijarcm-logo.svg" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Theme Color */}
      <meta name="theme-color" content="#1e40af" />
      <meta name="msapplication-TileColor" content="#1e40af" />
      
      {/* Preconnect to external domains for performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      
      {/* RSS Feeds */}
      <link rel="alternate" type="application/rss+xml" title="IJARCM Latest Papers" href="/api/rss/papers.xml" />
      <link rel="alternate" type="application/rss+xml" title="IJARCM Announcements" href="/api/rss/announcements.xml" />
      
      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      
      {/* Verification tags (add your actual verification codes) */}
      {/* <meta name="google-site-verification" content="your-google-verification-code" /> */}
      {/* <meta name="msvalidate.01" content="your-bing-verification-code" /> */}
      {/* <meta name="yandex-verification" content="your-yandex-verification-code" /> */}
    </Head>
  );
};

export default SEOMetaTags;