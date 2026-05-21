interface SEOValidationResult {
  isValid: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
  details: {
    title: SEOCheck;
    description: SEOCheck;
    keywords: SEOCheck;
    headings: SEOCheck;
    images: SEOCheck;
    links: SEOCheck;
    performance: SEOCheck;
    structured: SEOCheck;
    social: SEOCheck;
    technical: SEOCheck;
  };
}

interface SEOCheck {
  passed: boolean;
  score: number;
  issues: string[];
  recommendations: string[];
}

class SEOValidator {
  private document: Document;
  private url: string;

  constructor(doc: Document = document, currentUrl: string = window.location.href) {
    this.document = doc;
    this.url = currentUrl;
  }

  public validatePage(): SEOValidationResult {
    const checks = {
      title: this.validateTitle(),
      description: this.validateDescription(),
      keywords: this.validateKeywords(),
      headings: this.validateHeadings(),
      images: this.validateImages(),
      links: this.validateLinks(),
      performance: this.validatePerformance(),
      structured: this.validateStructuredData(),
      social: this.validateSocialTags(),
      technical: this.validateTechnicalSEO()
    };

    const totalScore = Object.values(checks).reduce((sum, check) => sum + check.score, 0) / Object.keys(checks).length;
    const allIssues = Object.values(checks).flatMap(check => check.issues);
    const allRecommendations = Object.values(checks).flatMap(check => check.recommendations);

    return {
      isValid: totalScore >= 80,
      score: Math.round(totalScore),
      issues: allIssues,
      recommendations: allRecommendations,
      details: checks
    };
  }

  private validateTitle(): SEOCheck {
    const titleElement = this.document.querySelector('title');
    const title = titleElement?.textContent || '';
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    if (!title) {
      issues.push('Missing page title');
      score -= 50;
    } else {
      if (title.length < 30) {
        issues.push('Title too short (< 30 characters)');
        recommendations.push('Expand title to 30-60 characters for better SEO');
        score -= 20;
      }
      if (title.length > 60) {
        issues.push('Title too long (> 60 characters)');
        recommendations.push('Shorten title to under 60 characters to prevent truncation');
        score -= 15;
      }
      if (!title.includes('IJARCM')) {
        recommendations.push('Consider including "IJARCM" in title for brand recognition');
        score -= 5;
      }
    }

    // Check for duplicate titles
    const titleElements = this.document.querySelectorAll('title');
    if (titleElements.length > 1) {
      issues.push('Multiple title tags found');
      score -= 30;
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }

  private validateDescription(): SEOCheck {
    const metaDesc = this.document.querySelector('meta[name="description"]');
    const description = metaDesc?.getAttribute('content') || '';
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    if (!description) {
      issues.push('Missing meta description');
      score -= 50;
    } else {
      if (description.length < 120) {
        issues.push('Meta description too short (< 120 characters)');
        recommendations.push('Expand description to 120-160 characters');
        score -= 20;
      }
      if (description.length > 160) {
        issues.push('Meta description too long (> 160 characters)');
        recommendations.push('Shorten description to under 160 characters');
        score -= 15;
      }
      if (!description.toLowerCase().includes('research') && !description.toLowerCase().includes('academic')) {
        recommendations.push('Include relevant academic keywords in description');
        score -= 5;
      }
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }

  private validateKeywords(): SEOCheck {
    const metaKeywords = this.document.querySelector('meta[name="keywords"]');
    const keywords = metaKeywords?.getAttribute('content') || '';
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 80; // Keywords are less important now

    if (!keywords) {
      recommendations.push('Consider adding meta keywords for academic indexing');
      score -= 10;
    } else {
      const keywordArray = keywords.split(',').map(k => k.trim());
      if (keywordArray.length > 10) {
        issues.push('Too many keywords (> 10)');
        recommendations.push('Limit to 5-10 most relevant keywords');
        score -= 15;
      }
      if (keywordArray.length < 3) {
        recommendations.push('Add more relevant keywords (3-10 recommended)');
        score -= 10;
      }
    }

    return {
      passed: score >= 60,
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }

  private validateHeadings(): SEOCheck {
    const h1Elements = this.document.querySelectorAll('h1');
    const h2Elements = this.document.querySelectorAll('h2');
    const h3Elements = this.document.querySelectorAll('h3');
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    if (h1Elements.length === 0) {
      issues.push('Missing H1 tag');
      score -= 40;
    } else if (h1Elements.length > 1) {
      issues.push('Multiple H1 tags found');
      recommendations.push('Use only one H1 tag per page');
      score -= 20;
    }

    if (h2Elements.length === 0) {
      recommendations.push('Consider adding H2 tags for better content structure');
      score -= 10;
    }

    // Check heading hierarchy
    const headings = this.document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    let hierarchyIssues = 0;

    headings.forEach(heading => {
      const currentLevel = parseInt(heading.tagName.charAt(1));
      if (currentLevel > previousLevel + 1) {
        hierarchyIssues++;
      }
      previousLevel = currentLevel;
    });

    if (hierarchyIssues > 0) {
      issues.push('Heading hierarchy issues detected');
      recommendations.push('Maintain proper heading hierarchy (H1 → H2 → H3)');
      score -= hierarchyIssues * 5;
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }

  private validateImages(): SEOCheck {
    const images = this.document.querySelectorAll('img');
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;
    let missingAlt = 0;
    let missingTitle = 0;

    images.forEach(img => {
      if (!img.getAttribute('alt')) {
        missingAlt++;
      }
      if (!img.getAttribute('title') && !img.getAttribute('alt')) {
        missingTitle++;
      }
      if (!img.getAttribute('loading') && !img.classList.contains('eager')) {
        recommendations.push('Add loading="lazy" to images below the fold');
      }
    });

    if (missingAlt > 0) {
      issues.push(`${missingAlt} images missing alt text`);
      score -= missingAlt * 10;
    }

    if (images.length > 0) {
      const altTextQuality = Array.from(images).filter(img => {
        const alt = img.getAttribute('alt');
        return alt && alt.length > 5 && !alt.toLowerCase().includes('image');
      }).length;
      
      const qualityRatio = altTextQuality / images.length;
      if (qualityRatio < 0.8) {
        recommendations.push('Improve alt text quality - be more descriptive');
        score -= 10;
      }
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }

  private validateLinks(): SEOCheck {
    const links = this.document.querySelectorAll('a[href]');
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;
    let externalWithoutRel = 0;
    let emptyLinks = 0;

    links.forEach(link => {
      const href = link.getAttribute('href');
      const text = link.textContent?.trim();
      
      if (!text || text.length === 0) {
        emptyLinks++;
      }
      
      if (href && (href.startsWith('http') && !href.includes(window.location.hostname))) {
        if (!link.getAttribute('rel')?.includes('noopener')) {
          externalWithoutRel++;
        }
      }
      
      if (text && (text.toLowerCase() === 'click here' || text.toLowerCase() === 'read more')) {
        recommendations.push('Use descriptive link text instead of generic phrases');
        score -= 2;
      }
    });

    if (emptyLinks > 0) {
      issues.push(`${emptyLinks} links with empty text`);
      score -= emptyLinks * 5;
    }

    if (externalWithoutRel > 0) {
      issues.push(`${externalWithoutRel} external links missing rel="noopener"`);
      score -= externalWithoutRel * 3;
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }

  private validatePerformance(): SEOCheck {
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    // Check for performance-related elements
    const scripts = this.document.querySelectorAll('script');
    const stylesheets = this.document.querySelectorAll('link[rel="stylesheet"]');
    
    if (scripts.length > 10) {
      recommendations.push('Consider reducing number of JavaScript files');
      score -= 10;
    }
    
    if (stylesheets.length > 5) {
      recommendations.push('Consider combining CSS files to reduce requests');
      score -= 10;
    }

    // Check for preload/prefetch
    const preloadLinks = this.document.querySelectorAll('link[rel="preload"]');
    if (preloadLinks.length === 0) {
      recommendations.push('Add preload links for critical resources');
      score -= 5;
    }

    // Check for font-display
    const fontFaces = this.document.querySelectorAll('style');
    let hasFontDisplay = false;
    fontFaces.forEach(style => {
      if (style.textContent?.includes('font-display')) {
        hasFontDisplay = true;
      }
    });
    
    if (!hasFontDisplay) {
      recommendations.push('Add font-display: swap to @font-face declarations');
      score -= 5;
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }

  private validateStructuredData(): SEOCheck {
    const jsonLdScripts = this.document.querySelectorAll('script[type="application/ld+json"]');
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    if (jsonLdScripts.length === 0) {
      issues.push('No structured data found');
      recommendations.push('Add JSON-LD structured data for better search visibility');
      score -= 30;
    } else {
      // Validate JSON-LD syntax
      jsonLdScripts.forEach((script, index) => {
        try {
          const data = JSON.parse(script.textContent || '');
          if (!data['@context'] || !data['@type']) {
            issues.push(`Invalid structured data format in script ${index + 1}`);
            score -= 15;
          }
        } catch (e) {
          issues.push(`Invalid JSON in structured data script ${index + 1}`);
          score -= 20;
        }
      });
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }

  private validateSocialTags(): SEOCheck {
    const ogTitle = this.document.querySelector('meta[property="og:title"]');
    const ogDescription = this.document.querySelector('meta[property="og:description"]');
    const ogImage = this.document.querySelector('meta[property="og:image"]');
    const twitterCard = this.document.querySelector('meta[name="twitter:card"]');
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    if (!ogTitle) {
      issues.push('Missing Open Graph title');
      score -= 20;
    }
    
    if (!ogDescription) {
      issues.push('Missing Open Graph description');
      score -= 20;
    }
    
    if (!ogImage) {
      issues.push('Missing Open Graph image');
      score -= 15;
    }
    
    if (!twitterCard) {
      recommendations.push('Add Twitter Card meta tags');
      score -= 10;
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }

  private validateTechnicalSEO(): SEOCheck {
    const canonical = this.document.querySelector('link[rel="canonical"]');
    const robots = this.document.querySelector('meta[name="robots"]');
    const viewport = this.document.querySelector('meta[name="viewport"]');
    const lang = this.document.documentElement.getAttribute('lang');
    
    const issues: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    if (!canonical) {
      issues.push('Missing canonical URL');
      score -= 20;
    }
    
    if (!viewport) {
      issues.push('Missing viewport meta tag');
      score -= 15;
    }
    
    if (!lang) {
      issues.push('Missing language attribute on html element');
      score -= 10;
    }
    
    if (!robots) {
      recommendations.push('Consider adding robots meta tag for explicit indexing control');
      score -= 5;
    }

    // Check for HTTPS
    if (this.url.startsWith('http:')) {
      issues.push('Page not served over HTTPS');
      score -= 25;
    }

    return {
      passed: score >= 70,
      score: Math.max(0, score),
      issues,
      recommendations
    };
  }

  // Static method for quick validation
  public static quickValidate(): SEOValidationResult {
    const validator = new SEOValidator();
    return validator.validatePage();
  }

  // Method to generate SEO report
  public generateReport(): string {
    const result = this.validatePage();
    
    let report = `SEO Validation Report\n`;
    report += `===================\n\n`;
    report += `Overall Score: ${result.score}/100\n`;
    report += `Status: ${result.isValid ? 'PASS' : 'NEEDS IMPROVEMENT'}\n\n`;
    
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
      report += `- ${category.charAt(0).toUpperCase() + category.slice(1)}: ${check.score}/100\n`;
    });
    
    return report;
  }
}

export default SEOValidator;
export type { SEOValidationResult, SEOCheck };