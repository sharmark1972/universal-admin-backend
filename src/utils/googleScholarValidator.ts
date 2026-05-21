/**
 * Google Scholar Validation Utility
 * Comprehensive validation for Google Scholar compatibility and academic search optimization
 */

import { validateDOI, createDOIURL } from './doiUtils';

export interface GoogleScholarValidationResult {
  isValid: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
  details: {
    citationMetadata: CitationCheck;
    pdfAccessibility: PDFCheck;
    doiIntegration: DOICheck;
    structuredData: StructuredDataCheck;
    sitemapAccessibility: SitemapCheck;
    technicalSEO: TechnicalSEOCheck;
  };
  timestamp: string;
}

export interface CitationCheck {
  passed: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
  metadata: {
    hasTitle: boolean;
    hasAuthors: boolean;
    hasPublicationDate: boolean;
    hasJournal: boolean;
    hasISSN: boolean;
    hasVolume: boolean;
    hasIssue: boolean;
    hasPages: boolean;
    hasAbstract: boolean;
    hasKeywords: boolean;
  };
}

export interface PDFCheck {
  passed: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
  accessibility: {
    isPubliclyAccessible: boolean;
    hasPDFURL: boolean;
    pdfAccessible: boolean;
    pdfSize: number;
    pdfFormat: string;
    downloadSpeed: number;
  };
}

export interface DOICheck {
  passed: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
  integration: {
    hasDOI: boolean;
    doiValid: boolean;
    doiRegistered: boolean;
    crossrefCompatible: boolean;
    doiResolves: boolean;
  };
}

export interface StructuredDataCheck {
  passed: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
  data: {
    hasScholarlyArticle: boolean;
    hasOrganizationSchema: boolean;
    hasPersonSchema: boolean;
    hasBreadcrumbSchema: boolean;
    jsonValid: boolean;
    requiredFieldsPresent: boolean;
  };
}

export interface SitemapCheck {
  passed: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
  accessibility: {
    sitemapAccessible: boolean;
    includesPapers: boolean;
    lastmodValid: boolean;
    priorityValid: boolean;
    changefreqValid: boolean;
  };
}

export interface TechnicalSEOCheck {
  passed: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
  technical: {
    hasCanonicalURL: boolean;
    hasMetaRobots: boolean;
    hasOpenGraph: boolean;
    hasDublinCore: boolean;
    hasMetaDescription: boolean;
    hasLanguage: boolean;
    httpsEnabled: boolean;
  };
}

export interface PaperMetadata {
  id: string;
  title: string;
  abstract: string;
  authors: Array<{
    name: string;
    affiliation?: string;
    email?: string;
    orcid?: string;
  }>;
  publishedAt: string;
  doi?: string;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  keywords?: string[];
  pdfUrl?: string;
  issn?: string;
}

export class GoogleScholarValidator {
  private baseUrl: string;
  private userAgent: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || 'https://ijrcam.com') {
    this.baseUrl = baseUrl;
    this.userAgent = 'Mozilla/5.0 (compatible; GoogleScholarValidator/1.0; +https://ijrcam.com)';
  }

  /**
   * Validates a paper page for Google Scholar compatibility
   */
  async validatePaper(paper: PaperMetadata): Promise<GoogleScholarValidationResult> {
    const checks = {
      citationMetadata: await this.validateCitationMetadata(paper),
      pdfAccessibility: await this.validatePDFAccessibility(paper),
      doiIntegration: await this.validateDOIIntegration(paper),
      structuredData: await this.validateStructuredData(paper),
      sitemapAccessibility: await this.validateSitemapAccessibility(),
      technicalSEO: await this.validateTechnicalSEO(paper)
    };

    const totalScore = Object.values(checks).reduce((sum, check) => sum + check.score, 0) / Object.keys(checks).length;
    const allIssues = Object.values(checks).flatMap(check => check.issues);
    const allRecommendations = Object.values(checks).flatMap(check => check.recommendations);

    return {
      isValid: totalScore >= 80,
      score: Math.round(totalScore),
      issues: allIssues,
      recommendations: allRecommendations,
      details: checks,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Validates citation metadata
   */
  private async validateCitationMetadata(paper: PaperMetadata): Promise<CitationCheck> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    const metadata = {
      hasTitle: !!paper.title,
      hasAuthors: !!(paper.authors && paper.authors.length > 0),
      hasPublicationDate: !!paper.publishedAt,
      hasJournal: !!paper.journal,
      hasISSN: !!paper.issn,
      hasVolume: !!paper.volume,
      hasIssue: !!paper.issue,
      hasPages: !!paper.pages,
      hasAbstract: !!paper.abstract,
      hasKeywords: !!(paper.keywords && paper.keywords.length > 0)
    };

    // Check required fields
    if (!metadata.hasTitle) {
      issues.push('Missing paper title');
      score -= 20;
    } else if (paper.title.length < 10) {
      issues.push('Title too short (< 10 characters)');
      recommendations.push('Use descriptive titles (10+ characters)');
      score -= 10;
    }

    if (!metadata.hasAuthors) {
      issues.push('Missing author information');
      score -= 15;
    } else if (paper.authors.length === 0) {
      issues.push('No authors specified');
      score -= 10;
    }

    if (!metadata.hasPublicationDate) {
      issues.push('Missing publication date');
      score -= 15;
    }

    if (!metadata.hasJournal) {
      issues.push('Missing journal name');
      score -= 10;
    }

    if (!metadata.hasISSN) {
      recommendations.push('Add ISSN for better indexing');
      score -= 5;
    }

    if (!metadata.hasAbstract) {
      recommendations.push('Add abstract for better visibility');
      score -= 5;
    } else if (paper.abstract.length < 50) {
      recommendations.push('Abstract too short (< 50 characters)');
      score -= 5;
    }

    if (!metadata.hasKeywords) {
      recommendations.push('Add keywords for better discoverability');
      score -= 5;
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      recommendations,
      metadata
    };
  }

  /**
   * Validates PDF accessibility for search engines
   */
  private async validatePDFAccessibility(paper: PaperMetadata): Promise<PDFCheck> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    const accessibility = {
      isPubliclyAccessible: false,
      hasPDFURL: !!paper.pdfUrl,
      pdfAccessible: false,
      pdfSize: 0,
      pdfFormat: 'unknown',
      downloadSpeed: 0
    };

    if (!accessibility.hasPDFURL) {
      issues.push('No PDF URL provided');
      recommendations.push('Add PDF URL for full-text access');
      score -= 30;
    } else {
      try {
        // Check PDF accessibility
        const pdfUrl = paper.pdfUrl?.startsWith('http') ? paper.pdfUrl : `${this.baseUrl}${paper.pdfUrl}`;
        const startTime = Date.now();
        
        const response = await fetch(pdfUrl, {
          method: 'HEAD',
          headers: { 'User-Agent': this.userAgent }
        });
        
        const endTime = Date.now();
        accessibility.downloadSpeed = endTime - startTime;

        if (response.ok) {
          accessibility.isPubliclyAccessible = true;
          accessibility.pdfAccessible = true;
          accessibility.pdfSize = parseInt(response.headers.get('content-length') || '0');
          accessibility.pdfFormat = response.headers.get('content-type') || 'unknown';

          // Check PDF size (should be reasonable)
          if (accessibility.pdfSize > 50 * 1024 * 1024) { // 50MB
            issues.push('PDF file too large (> 50MB)');
            recommendations.push('Compress PDF to improve accessibility');
            score -= 10;
          }

          // Check download speed
          if (accessibility.downloadSpeed > 10000) { // 10 seconds
            recommendations.push('Optimize PDF for faster downloads');
            score -= 5;
          }
        } else {
          issues.push(`PDF not accessible (HTTP ${response.status})`);
          recommendations.push('Ensure PDF is publicly accessible');
          score -= 25;
        }
      } catch (error) {
        issues.push('Failed to access PDF');
        recommendations.push('Check PDF URL and server configuration');
        score -= 20;
      }
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      recommendations,
      accessibility
    };
  }

  /**
   * Validates DOI integration and Crossref compatibility
   */
  private async validateDOIIntegration(paper: PaperMetadata): Promise<DOICheck> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    const integration = {
      hasDOI: !!paper.doi,
      doiValid: false,
      doiRegistered: false,
      crossrefCompatible: false,
      doiResolves: false
    };

    if (!integration.hasDOI) {
      recommendations.push('Add DOI for academic citation tracking');
      score -= 20;
    } else {
      // Validate DOI format
      const doiValidation = validateDOI(paper.doi!);
      integration.doiValid = doiValidation.isValid;

      if (!integration.doiValid) {
        issues.push(`Invalid DOI format: ${doiValidation.error}`);
        recommendations.push('Use correct DOI format (10.xxxx/xxxxx)');
        score -= 15;
      } else {
        // Check DOI registration
        try {
          const crossrefResponse = await fetch(`https://api.crossref.org/works/${encodeURIComponent(paper.doi!)}`);
          integration.doiRegistered = crossrefResponse.ok;
          integration.crossrefCompatible = true;

          if (!integration.doiRegistered) {
            recommendations.push('Register DOI with Crossref for better visibility');
            score -= 10;
          }
        } catch (error) {
          recommendations.push('Unable to verify DOI registration');
          score -= 5;
        }

        // Check DOI resolution
        try {
          const doiUrl = createDOIURL(paper.doi!);
          const response = await fetch(doiUrl, { method: 'HEAD' });
          integration.doiResolves = response.status >= 200 && response.status < 400;

          if (!integration.doiResolves) {
            issues.push('DOI does not resolve properly');
            recommendations.push('Ensure DOI resolves to the correct paper page');
            score -= 10;
          }
        } catch (error) {
          recommendations.push('Unable to verify DOI resolution');
          score -= 5;
        }
      }
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      recommendations,
      integration
    };
  }

  /**
   * Validates structured data and schema markup
   */
  private async validateStructuredData(paper: PaperMetadata): Promise<StructuredDataCheck> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    const data = {
      hasScholarlyArticle: false,
      hasOrganizationSchema: false,
      hasPersonSchema: false,
      hasBreadcrumbSchema: false,
      jsonValid: false,
      requiredFieldsPresent: false
    };

    try {
      // Check if paper page has structured data
      const pageUrl = `${this.baseUrl}/papers/${paper.id}`;
      const response = await fetch(pageUrl);
      const html = await response.text();

      // Extract JSON-LD scripts
      const jsonLdMatches = html.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs) || [];
      
      if (jsonLdMatches.length === 0) {
        issues.push('No structured data found on page');
        recommendations.push('Add JSON-LD structured data for better indexing');
        score -= 30;
      } else {
        data.jsonValid = true;

        // Parse and validate structured data
        for (const match of jsonLdMatches) {
          try {
            const jsonContent = match.match(/>(.*?)<\/script>/)?.[1] || '{}';
            const structuredData = JSON.parse(jsonContent);

            // Check for ScholarlyArticle schema
            if (structuredData['@type'] === 'ScholarlyArticle' || 
                (Array.isArray(structuredData['@type']) && structuredData['@type'].includes('ScholarlyArticle'))) {
              data.hasScholarlyArticle = true;

              // Check required fields
              const requiredFields = ['headline', 'author', 'publisher', 'datePublished'];
              const missingFields = requiredFields.filter(field => !structuredData[field]);
              
              if (missingFields.length === 0) {
                data.requiredFieldsPresent = true;
              } else {
                issues.push(`Missing required fields in ScholarlyArticle: ${missingFields.join(', ')}`);
                recommendations.push('Add all required fields to ScholarlyArticle schema');
                score -= missingFields.length * 5;
              }
            }

            // Check for Organization schema
            if (structuredData['@type'] === 'Organization') {
              data.hasOrganizationSchema = true;
            }

            // Check for Person schema
            if (structuredData['@type'] === 'Person') {
              data.hasPersonSchema = true;
            }

            // Check for BreadcrumbList schema
            if (structuredData['@type'] === 'BreadcrumbList') {
              data.hasBreadcrumbSchema = true;
            }
          } catch (parseError) {
            issues.push('Invalid JSON in structured data');
            recommendations.push('Fix JSON syntax in structured data');
            score -= 10;
          }
        }

        if (!data.hasScholarlyArticle) {
          issues.push('No ScholarlyArticle schema found');
          recommendations.push('Add ScholarlyArticle schema for academic content');
          score -= 20;
        }

        if (!data.hasOrganizationSchema) {
          recommendations.push('Add Organization schema for publisher information');
          score -= 5;
        }
      }
    } catch (error) {
      issues.push('Failed to validate structured data');
      recommendations.push('Ensure structured data is properly formatted');
      score -= 15;
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      recommendations,
      data
    };
  }

  /**
   * Validates sitemap accessibility and completeness
   */
  private async validateSitemapAccessibility(): Promise<SitemapCheck> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    const accessibility = {
      sitemapAccessible: false,
      includesPapers: false,
      lastmodValid: false,
      priorityValid: false,
      changefreqValid: false
    };

    try {
      // Check main sitemap
      const sitemapUrl = `${this.baseUrl}/sitemap.xml`;
      const response = await fetch(sitemapUrl);
      
      if (response.ok) {
        accessibility.sitemapAccessible = true;
        const sitemapContent = await response.text();

        // Check if papers are included
        if (sitemapContent.includes('/papers/')) {
          accessibility.includesPapers = true;
        } else {
          recommendations.push('Ensure all papers are included in sitemap');
          score -= 15;
        }

        // Validate sitemap structure
        if (sitemapContent.includes('<lastmod>')) {
          accessibility.lastmodValid = true;
        } else {
          recommendations.push('Add lastmod dates to sitemap entries');
          score -= 5;
        }

        if (sitemapContent.includes('<priority>')) {
          accessibility.priorityValid = true;
        } else {
          recommendations.push('Add priority values to sitemap entries');
          score -= 5;
        }

        if (sitemapContent.includes('<changefreq>')) {
          accessibility.changefreqValid = true;
        } else {
          recommendations.push('Add changefreq values to sitemap entries');
          score -= 5;
        }
      } else {
        issues.push(`Sitemap not accessible (HTTP ${response.status})`);
        recommendations.push('Ensure sitemap.xml is accessible');
        score -= 25;
      }
    } catch (error) {
      issues.push('Failed to access sitemap');
      recommendations.push('Check sitemap URL and server configuration');
      score -= 20;
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      recommendations,
      accessibility
    };
  }

  /**
   * Validates technical SEO aspects
   */
  private async validateTechnicalSEO(paper: PaperMetadata): Promise<TechnicalSEOCheck> {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    const technical = {
      hasCanonicalURL: false,
      hasMetaRobots: false,
      hasOpenGraph: false,
      hasDublinCore: false,
      hasMetaDescription: false,
      hasLanguage: false,
      httpsEnabled: this.baseUrl.startsWith('https://')
    };

    try {
      const pageUrl = `${this.baseUrl}/papers/${paper.id}`;
      const response = await fetch(pageUrl);
      const html = await response.text();

      // Check canonical URL
      if (html.includes('rel="canonical"')) {
        technical.hasCanonicalURL = true;
      } else {
        issues.push('Missing canonical URL');
        recommendations.push('Add canonical URL to prevent duplicate content');
        score -= 15;
      }

      // Check meta robots
      if (html.includes('name="robots"')) {
        technical.hasMetaRobots = true;
      } else {
        recommendations.push('Add meta robots tag for indexing control');
        score -= 10;
      }

      // Check Open Graph tags
      if (html.includes('property="og:')) {
        technical.hasOpenGraph = true;
      } else {
        recommendations.push('Add Open Graph tags for social sharing');
        score -= 10;
      }

      // Check Dublin Core metadata
      if (html.includes('name="DC."')) {
        technical.hasDublinCore = true;
      } else {
        recommendations.push('Add Dublin Core metadata for academic indexing');
        score -= 10;
      }

      // Check meta description
      if (html.includes('name="description"')) {
        technical.hasMetaDescription = true;
      } else {
        issues.push('Missing meta description');
        recommendations.push('Add meta description for search results');
        score -= 15;
      }

      // Check language attribute
      if (html.includes('lang=')) {
        technical.hasLanguage = true;
      } else {
        issues.push('Missing language attribute');
        recommendations.push('Add language attribute to HTML element');
        score -= 10;
      }

      // Check HTTPS
      if (!technical.httpsEnabled) {
        issues.push('Site not using HTTPS');
        recommendations.push('Enable HTTPS for security and SEO');
        score -= 20;
      }
    } catch (error) {
      issues.push('Failed to validate technical SEO');
      recommendations.push('Ensure paper pages are accessible');
      score -= 15;
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      recommendations,
      technical
    };
  }

  /**
   * Validates multiple papers
   */
  async validateMultiplePapers(papers: PaperMetadata[]): Promise<GoogleScholarValidationResult[]> {
    const results = await Promise.all(
      papers.map(paper => this.validatePaper(paper))
    );
    return results;
  }

  /**
   * Generates a comprehensive report
   */
  generateReport(result: GoogleScholarValidationResult): string {
    let report = `Google Scholar Validation Report\n`;
    report += `===================================\n\n`;
    report += `Overall Score: ${result.score}/100\n`;
    report += `Status: ${result.isValid ? 'PASS' : 'NEEDS IMPROVEMENT'}\n`;
    report += `Validated: ${new Date(result.timestamp).toLocaleString()}\n\n`;
    
    if (result.issues.length > 0) {
      report += `Issues Found (${result.issues.length}):\n`;
      result.issues.forEach((issue, index) => {
        report += `${index + 1}. ${issue}\n`;
      });
      report += `\n`;
    }
    
    if (result.recommendations.length > 0) {
      report += `Recommendations (${result.recommendations.length}):\n`;
      result.recommendations.forEach((rec, index) => {
        report += `${index + 1}. ${rec}\n`;
      });
      report += `\n`;
    }
    
    report += `Detailed Scores:\n`;
    Object.entries(result.details).forEach(([category, check]) => {
      report += `- ${category.charAt(0).toUpperCase() + category.slice(1)}: ${check.score}/100 (${check.passed ? 'PASS' : 'FAIL'})\n`;
    });
    
    return report;
  }

  /**
   * Simulates Google Scholar bot access
   */
  async simulateGoogleScholarBot(paperId: string): Promise<{
    accessible: boolean;
    metadataExtracted: boolean;
    pdfAccessible: boolean;
    issues: string[];
  }> {
    const issues: string[] = [];
    let accessible = false;
    let metadataExtracted = false;
    let pdfAccessible = false;

    try {
      const pageUrl = `${this.baseUrl}/papers/${paperId}`;
      const response = await fetch(pageUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)' }
      });

      if (response.ok) {
        accessible = true;
        const html = await response.text();

        // Check if metadata can be extracted
        const hasTitle = html.includes('<title>');
        const hasAuthors = html.includes('citation_author');
        const hasDate = html.includes('citation_publication_date');
        const hasDOI = html.includes('citation_doi');

        metadataExtracted = hasTitle && hasAuthors && hasDate;

        if (!metadataExtracted) {
          issues.push('Essential citation metadata not found');
        }

        // Check PDF accessibility
        const pdfUrlMatch = html.match(/citation_pdf_url[^>]*content="([^"]+)"/);
        if (pdfUrlMatch) {
          const pdfUrl = pdfUrlMatch[1].startsWith('http') ? pdfUrlMatch[1] : `${this.baseUrl}${pdfUrlMatch[1]}`;
          const pdfResponse = await fetch(pdfUrl, { method: 'HEAD' });
          pdfAccessible = pdfResponse.ok;
        }

        if (!pdfAccessible) {
          issues.push('PDF not accessible for Google Scholar');
        }
      } else {
        issues.push(`Page not accessible (HTTP ${response.status})`);
      }
    } catch (error) {
      issues.push('Failed to simulate Google Scholar bot access');
    }

    return {
      accessible,
      metadataExtracted,
      pdfAccessible,
      issues
    };
  }
}

export default GoogleScholarValidator;