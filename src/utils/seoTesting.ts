import { JSDOM } from 'jsdom';

export interface SEOAuditResult {
  score: number;
  passed: number;
  failed: number;
  warnings: number;
  details: {
    metaTags: { score: number; issues: string[] };
    openGraph: { score: number; issues: string[] };
    twitterCards: { score: number; issues: string[] };
    structuredData: { score: number; issues: string[] };
    headingStructure: { score: number; issues: string[] };
    internalLinking: { score: number; issues: string[] };
    performance: { score: number; issues: string[] };
    accessibility: { score: number; issues: string[] };
  };
}

export interface SEOTestConfig {
  baseUrl: string;
  pages: string[];
  checkExternalLinks: boolean;
  checkImages: boolean;
  checkPerformance: boolean;
}

export interface PageSEOData {
  url: string;
  title: string;
  description: string;
  keywords: string[];
  headings: { level: number; text: string }[];
  images: { src: string; alt: string; hasAlt: boolean }[];
  links: { href: string; text: string; isInternal: boolean }[];
  metaTags: Record<string, string>;
  openGraph: Record<string, string>;
  twitterCards: Record<string, string>;
  structuredData: any[];
  issues: string[];
  score: number;
}

/**
 * Analyzes a single page for SEO compliance
 */
export async function analyzePage(url: string, html: string): Promise<PageSEOData> {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  
  const issues: string[] = [];
  let score = 100;

  // Extract basic meta information
  const title = document.querySelector('title')?.textContent || '';
  const description = document.querySelector('meta[name="description"]')?.getAttribute('content') || '';
  const keywordsContent = document.querySelector('meta[name="keywords"]')?.getAttribute('content') || '';
  const keywords = keywordsContent.split(',').map(k => k.trim()).filter(k => k);

  // Validate title
  if (!title) {
    issues.push('Missing page title');
    score -= 10;
  } else if (title.length < 30 || title.length > 60) {
    issues.push('Title length should be between 30-60 characters');
    score -= 5;
  }

  // Validate description
  if (!description) {
    issues.push('Missing meta description');
    score -= 10;
  } else if (description.length < 120 || description.length > 160) {
    issues.push('Meta description should be between 120-160 characters');
    score -= 5;
  }

  // Extract headings
  const headings: { level: number; text: string }[] = [];
  for (let i = 1; i <= 6; i++) {
    const headingElements = document.querySelectorAll(`h${i}`);
    headingElements.forEach(heading => {
      headings.push({
        level: i,
        text: heading.textContent || ''
      });
    });
  }

  // Validate heading structure
  const h1Count = headings.filter(h => h.level === 1).length;
  if (h1Count === 0) {
    issues.push('Missing H1 tag');
    score -= 10;
  } else if (h1Count > 1) {
    issues.push('Multiple H1 tags found');
    score -= 5;
  }

  // Extract images
  const images: { src: string; alt: string; hasAlt: boolean }[] = [];
  const imgElements = document.querySelectorAll('img');
  imgElements.forEach(img => {
    const src = img.getAttribute('src') || '';
    const alt = img.getAttribute('alt') || '';
    const hasAlt = img.hasAttribute('alt');
    
    images.push({ src, alt, hasAlt });
    
    if (!hasAlt) {
      issues.push(`Image missing alt text: ${src}`);
      score -= 2;
    }
  });

  // Extract links
  const links: { href: string; text: string; isInternal: boolean }[] = [];
  const linkElements = document.querySelectorAll('a[href]');
  linkElements.forEach(link => {
    const href = link.getAttribute('href') || '';
    const text = link.textContent || '';
    const isInternal = href.startsWith('/') || href.includes(new URL(url).hostname);
    
    links.push({ href, text, isInternal });
  });

  // Extract meta tags
  const metaTags: Record<string, string> = {};
  const metaElements = document.querySelectorAll('meta');
  metaElements.forEach(meta => {
    const name = meta.getAttribute('name') || meta.getAttribute('property') || '';
    const content = meta.getAttribute('content') || '';
    if (name && content) {
      metaTags[name] = content;
    }
  });

  // Extract Open Graph data
  const openGraph: Record<string, string> = {};
  Object.keys(metaTags).forEach(key => {
    if (key.startsWith('og:')) {
      openGraph[key] = metaTags[key];
    }
  });

  // Validate Open Graph
  const requiredOG = ['og:title', 'og:description', 'og:image', 'og:url'];
  requiredOG.forEach(prop => {
    if (!openGraph[prop]) {
      issues.push(`Missing Open Graph property: ${prop}`);
      score -= 3;
    }
  });

  // Extract Twitter Cards data
  const twitterCards: Record<string, string> = {};
  Object.keys(metaTags).forEach(key => {
    if (key.startsWith('twitter:')) {
      twitterCards[key] = metaTags[key];
    }
  });

  // Validate Twitter Cards
  if (!twitterCards['twitter:card']) {
    issues.push('Missing Twitter Card type');
    score -= 3;
  }

  // Extract structured data
  const structuredData: any[] = [];
  const jsonLdElements = document.querySelectorAll('script[type="application/ld+json"]');
  jsonLdElements.forEach(script => {
    try {
      const data = JSON.parse(script.textContent || '');
      structuredData.push(data);
    } catch (error) {
      issues.push('Invalid JSON-LD structured data');
      score -= 5;
    }
  });

  // Validate structured data
  if (structuredData.length === 0) {
    issues.push('No structured data found');
    score -= 5;
  }

  return {
    url,
    title,
    description,
    keywords,
    headings,
    images,
    links,
    metaTags,
    openGraph,
    twitterCards,
    structuredData,
    issues,
    score: Math.max(0, score)
  };
}

/**
 * Runs a comprehensive SEO audit on multiple pages
 */
export async function runSEOAudit(config: SEOTestConfig): Promise<SEOAuditResult> {
  const results: PageSEOData[] = [];
  let totalScore = 0;
  let totalPassed = 0;
  let totalFailed = 0;
  let totalWarnings = 0;

  for (const page of config.pages) {
    try {
      const url = `${config.baseUrl}${page}`;
      const response = await fetch(url);
      const html = await response.text();
      
      const pageData = await analyzePage(url, html);
      results.push(pageData);
      
      totalScore += pageData.score;
      totalPassed += pageData.score >= 80 ? 1 : 0;
      totalFailed += pageData.score < 60 ? 1 : 0;
      totalWarnings += pageData.score >= 60 && pageData.score < 80 ? 1 : 0;
    } catch (error) {
      console.error(`Failed to analyze page ${page}:`, error);
      totalFailed++;
    }
  }

  const averageScore = results.length > 0 ? totalScore / results.length : 0;

  // Aggregate issues by category
  const metaTagIssues: string[] = [];
  const openGraphIssues: string[] = [];
  const twitterCardIssues: string[] = [];
  const structuredDataIssues: string[] = [];
  const headingIssues: string[] = [];
  const linkingIssues: string[] = [];
  const performanceIssues: string[] = [];
  const accessibilityIssues: string[] = [];

  results.forEach(result => {
    result.issues.forEach(issue => {
      if (issue.includes('title') || issue.includes('description') || issue.includes('keywords')) {
        metaTagIssues.push(issue);
      } else if (issue.includes('Open Graph')) {
        openGraphIssues.push(issue);
      } else if (issue.includes('Twitter')) {
        twitterCardIssues.push(issue);
      } else if (issue.includes('structured data') || issue.includes('JSON-LD')) {
        structuredDataIssues.push(issue);
      } else if (issue.includes('H1') || issue.includes('heading')) {
        headingIssues.push(issue);
      } else if (issue.includes('link')) {
        linkingIssues.push(issue);
      } else if (issue.includes('performance') || issue.includes('loading')) {
        performanceIssues.push(issue);
      } else if (issue.includes('alt text') || issue.includes('accessibility')) {
        accessibilityIssues.push(issue);
      }
    });
  });

  return {
    score: Math.round(averageScore),
    passed: totalPassed,
    failed: totalFailed,
    warnings: totalWarnings,
    details: {
      metaTags: {
        score: Math.max(0, 100 - metaTagIssues.length * 5),
        issues: [...new Set(metaTagIssues)]
      },
      openGraph: {
        score: Math.max(0, 100 - openGraphIssues.length * 5),
        issues: [...new Set(openGraphIssues)]
      },
      twitterCards: {
        score: Math.max(0, 100 - twitterCardIssues.length * 5),
        issues: [...new Set(twitterCardIssues)]
      },
      structuredData: {
        score: Math.max(0, 100 - structuredDataIssues.length * 5),
        issues: [...new Set(structuredDataIssues)]
      },
      headingStructure: {
        score: Math.max(0, 100 - headingIssues.length * 5),
        issues: [...new Set(headingIssues)]
      },
      internalLinking: {
        score: Math.max(0, 100 - linkingIssues.length * 5),
        issues: [...new Set(linkingIssues)]
      },
      performance: {
        score: Math.max(0, 100 - performanceIssues.length * 5),
        issues: [...new Set(performanceIssues)]
      },
      accessibility: {
        score: Math.max(0, 100 - accessibilityIssues.length * 5),
        issues: [...new Set(accessibilityIssues)]
      }
    }
  };
}

/**
 * Generates a comprehensive SEO report
 */
export function generateSEOReport(auditResult: SEOAuditResult): any {
  const timestamp = new Date().toISOString();
  
  return {
    timestamp,
    summary: {
      overallScore: auditResult.score,
      totalTests: auditResult.passed + auditResult.failed + auditResult.warnings,
      passed: auditResult.passed,
      failed: auditResult.failed,
      warnings: auditResult.warnings,
      grade: getGrade(auditResult.score)
    },
    categories: auditResult.details,
    recommendations: generateRecommendations(auditResult),
    nextSteps: [
      'Run Lighthouse audit for additional insights',
      'Set up Google Search Console monitoring',
      'Implement Core Web Vitals tracking',
      'Schedule regular SEO audits',
      'Monitor keyword rankings',
      'Analyze competitor SEO strategies'
    ]
  };
}

/**
 * Gets letter grade based on score
 */
function getGrade(score: number): string {
  if (score >= 95) return 'A+';
  if (score >= 90) return 'A';
  if (score >= 85) return 'B+';
  if (score >= 80) return 'B';
  if (score >= 75) return 'C+';
  if (score >= 70) return 'C';
  if (score >= 65) return 'D+';
  if (score >= 60) return 'D';
  return 'F';
}

/**
 * Generates actionable recommendations based on audit results
 */
function generateRecommendations(auditResult: SEOAuditResult): string[] {
  const recommendations: string[] = [];
  
  Object.entries(auditResult.details).forEach(([category, data]) => {
    if (data.score < 90 && data.issues.length > 0) {
      switch (category) {
        case 'metaTags':
          recommendations.push('Optimize meta titles and descriptions for better click-through rates');
          break;
        case 'openGraph':
          recommendations.push('Complete Open Graph implementation for better social media sharing');
          break;
        case 'twitterCards':
          recommendations.push('Implement Twitter Cards for enhanced social media presence');
          break;
        case 'structuredData':
          recommendations.push('Add more comprehensive structured data schemas');
          break;
        case 'headingStructure':
          recommendations.push('Improve heading hierarchy for better content structure');
          break;
        case 'internalLinking':
          recommendations.push('Enhance internal linking strategy for better page authority distribution');
          break;
        case 'performance':
          recommendations.push('Optimize page loading speed and Core Web Vitals');
          break;
        case 'accessibility':
          recommendations.push('Improve accessibility features for better user experience and SEO');
          break;
      }
    }
  });
  
  return recommendations;
}

/**
 * Validates sitemap.xml accessibility and structure
 */
export async function validateSitemap(baseUrl: string): Promise<{ valid: boolean; issues: string[] }> {
  const issues: string[] = [];
  
  try {
    const response = await fetch(`${baseUrl}/sitemap.xml`);
    
    if (!response.ok) {
      issues.push('Sitemap.xml not accessible');
      return { valid: false, issues };
    }
    
    const xml = await response.text();
    
    // Basic XML validation
    if (!xml.includes('<urlset') && !xml.includes('<sitemapindex')) {
      issues.push('Invalid sitemap XML structure');
    }
    
    // Check for required elements
    if (!xml.includes('<loc>')) {
      issues.push('Sitemap missing URL locations');
    }
    
    // Check for lastmod dates
    if (!xml.includes('<lastmod>')) {
      issues.push('Consider adding lastmod dates to sitemap entries');
    }
    
    return { valid: issues.length === 0, issues };
  } catch (error) {
    issues.push('Failed to fetch sitemap.xml');
    return { valid: false, issues };
  }
}

/**
 * Validates robots.txt accessibility and directives
 */
export async function validateRobotsTxt(baseUrl: string): Promise<{ valid: boolean; issues: string[] }> {
  const issues: string[] = [];
  
  try {
    const response = await fetch(`${baseUrl}/robots.txt`);
    
    if (!response.ok) {
      issues.push('Robots.txt not accessible');
      return { valid: false, issues };
    }
    
    const content = await response.text();
    
    // Check for basic directives
    if (!content.includes('User-agent:')) {
      issues.push('Robots.txt missing User-agent directive');
    }
    
    // Check for sitemap reference
    if (!content.includes('Sitemap:')) {
      issues.push('Consider adding Sitemap reference to robots.txt');
    }
    
    return { valid: issues.length === 0, issues };
  } catch (error) {
    issues.push('Failed to fetch robots.txt');
    return { valid: false, issues };
  }
}