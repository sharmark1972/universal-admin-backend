#!/usr/bin/env node

/**
 * Metadata Validation Script
 * Validates SEO and academic metadata for papers and generates comprehensive reports
 */

import { GoogleScholarValidator, PaperMetadata } from '../src/utils/googleScholarValidator';
import { validateDOI, createDOIURL } from '../src/utils/doiUtils';

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://ijarcm.com';
const OUTPUT_DIR = process.env.OUTPUT_DIR || './validation-reports';
const VERBOSE = process.env.VERBOSE === 'true';

// Sample validation rules
const VALIDATION_RULES = {
  // Title validation
  title: {
    minLength: 10,
    maxLength: 200,
    requiredWords: ['research', 'study', 'analysis', 'implementation'],
    avoidWords: ['preliminary', 'draft', 'temporary']
  },
  
  // Abstract validation
  abstract: {
    minLength: 50,
    maxLength: 2000,
    requiredSections: ['introduction', 'methodology', 'results', 'conclusion']
  },
  
  // Keywords validation
  keywords: {
    minCount: 3,
    maxCount: 10,
    minLength: 3,
    maxLength: 30
  },
  
  // Author validation
  authors: {
    minCount: 1,
    maxCount: 10,
    requireAffiliation: true,
    requireEmail: false,
    requireORCID: false
  },
  
  // DOI validation
  doi: {
    required: true,
    format: /^10\.\d{4,9}\/.+$/,
    checkResolution: true
  }
};

/**
 * Metadata validation result interface
 */
interface MetadataValidationResult {
  paper: PaperMetadata;
  isValid: boolean;
  score: number;
  issues: string[];
  warnings: string[];
  recommendations: string[];
  categoryScores: {
    title: number;
    abstract: number;
    keywords: number;
    authors: number;
    doi: number;
    technical: number;
  };
}

/**
 * Main validation function
 */
async function validateMetadata(paper: PaperMetadata): Promise<MetadataValidationResult> {
  const issues: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  const categoryScores = {
    title: 100,
    abstract: 100,
    keywords: 100,
    authors: 100,
    doi: 100,
    technical: 100
  };

  // Validate title
  const titleValidation = validateTitle(paper.title);
  categoryScores.title = titleValidation.score;
  issues.push(...titleValidation.issues);
  warnings.push(...titleValidation.warnings);
  recommendations.push(...titleValidation.recommendations);

  // Validate abstract
  const abstractValidation = validateAbstract(paper.abstract);
  categoryScores.abstract = abstractValidation.score;
  issues.push(...abstractValidation.issues);
  warnings.push(...abstractValidation.warnings);
  recommendations.push(...abstractValidation.recommendations);

  // Validate keywords
  const keywordsValidation = validateKeywords(paper.keywords || []);
  categoryScores.keywords = keywordsValidation.score;
  issues.push(...keywordsValidation.issues);
  warnings.push(...keywordsValidation.warnings);
  recommendations.push(...keywordsValidation.recommendations);

  // Validate authors
  const authorsValidation = validateAuthors(paper.authors || []);
  categoryScores.authors = authorsValidation.score;
  issues.push(...authorsValidation.issues);
  warnings.push(...authorsValidation.warnings);
  recommendations.push(...authorsValidation.recommendations);

  // Validate DOI
  const doiValidation = validateDOI(paper.doi || '');
  categoryScores.doi = doiValidation.score;
  issues.push(...doiValidation.issues);
  warnings.push(...doiValidation.warnings);
  recommendations.push(...doiValidation.recommendations);

  // Validate technical metadata
  const technicalValidation = validateTechnicalMetadata(paper);
  categoryScores.technical = technicalValidation.score;
  issues.push(...technicalValidation.issues);
  warnings.push(...technicalValidation.warnings);
  recommendations.push(...technicalValidation.recommendations);

  // Calculate overall score
  const totalScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / Object.keys(categoryScores).length;
  const isValid = totalScore >= 80;

  return {
    paper,
    isValid,
    score: Math.round(totalScore),
    issues,
    warnings,
    recommendations,
    categoryScores
  };
}

/**
 * Title validation
 */
function validateTitle(title: string) {
  const issues: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Length validation
  if (title.length < VALIDATION_RULES.title.minLength) {
    issues.push(`Title too short (${title.length} < ${VALIDATION_RULES.title.minLength} characters)`);
    score -= 20;
  } else if (title.length > VALIDATION_RULES.title.maxLength) {
    issues.push(`Title too long (${title.length} > ${VALIDATION_RULES.title.maxLength} characters)`);
    score -= 15;
  }

  // Required words validation
  const titleLower = title.toLowerCase();
  const hasRequiredWords = VALIDATION_RULES.title.requiredWords.some(word => 
    titleLower.includes(word.toLowerCase())
  );
  
  if (!hasRequiredWords) {
    warnings.push('Title should include research-related keywords');
    score -= 10;
  }

  // Words to avoid
  const hasAvoidWords = VALIDATION_RULES.title.avoidWords.some(word => 
    titleLower.includes(word.toLowerCase())
  );
  
  if (hasAvoidWords) {
    issues.push('Title contains words indicating draft/preliminary status');
    score -= 25;
  }

  // Title format validation
  if (!/^[A-Z]/.test(title.charAt(0))) {
    warnings.push('Title should start with capital letter');
    score -= 5;
  }

  return {
    issues,
    warnings,
    recommendations,
    score
  };
}

/**
 * Abstract validation
 */
function validateAbstract(abstract: string) {
  const issues: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Length validation
  if (abstract.length < VALIDATION_RULES.abstract.minLength) {
    issues.push(`Abstract too short (${abstract.length} < ${VALIDATION_RULES.abstract.minLength} characters)`);
    score -= 20;
  } else if (abstract.length > VALIDATION_RULES.abstract.maxLength) {
    issues.push(`Abstract too long (${abstract.length} > ${VALIDATION_RULES.abstract.maxLength} characters)`);
    score -= 15;
  }

  // Required sections validation
  const abstractLower = abstract.toLowerCase();
  const hasRequiredSections = VALIDATION_RULES.abstract.requiredSections.some(section => 
    abstractLower.includes(section.toLowerCase())
  );
  
  if (!hasRequiredSections) {
    warnings.push('Abstract should include standard research sections (introduction, methodology, results, conclusion)');
    score -= 10;
  }

  // Structure validation
  const sentences = abstract.split('.').filter(s => s.trim().length > 0);
  if (sentences.length < 3) {
    warnings.push('Abstract should have at least 3 sentences for better readability');
    score -= 5;
  }

  // Technical content validation
  if (!/\b(method|methodology|approach|technique|algorithm)\b/i.test(abstract)) {
    warnings.push('Abstract should mention research methodology or approach');
    score -= 10;
  }

  return {
    issues,
    warnings,
    recommendations,
    score
  };
}

/**
 * Keywords validation
 */
function validateKeywords(keywords: string[]) {
  const issues: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Count validation
  if (keywords.length < VALIDATION_RULES.keywords.minCount) {
    issues.push(`Too few keywords (${keywords.length} < ${VALIDATION_RULES.keywords.minCount})`);
    score -= 20;
  } else if (keywords.length > VALIDATION_RULES.keywords.maxCount) {
    issues.push(`Too many keywords (${keywords.length} > ${VALIDATION_RULES.keywords.maxCount})`);
    score -= 15;
  }

  // Individual keyword validation
  keywords.forEach((keyword, index) => {
    if (keyword.length < VALIDATION_RULES.keywords.minLength) {
      warnings.push(`Keyword ${index + 1} too short (${keyword.length} < ${VALIDATION_RULES.keywords.minLength})`);
      score -= 5;
    } else if (keyword.length > VALIDATION_RULES.keywords.maxLength) {
      warnings.push(`Keyword ${index + 1} too long (${keyword.length} > ${VALIDATION_RULES.keywords.maxLength})`);
      score -= 5;
    }

    // Check for academic relevance
    if (!/\b(research|study|analysis|method|approach|system|framework|algorithm|implementation|evaluation|performance|optimization)\b/i.test(keyword)) {
      warnings.push(`Keyword ${index + 1} may not be academically relevant: ${keyword}`);
      score -= 3;
    }
  });

  // Duplicate check
  const lowerKeywords = keywords.map(k => k.toLowerCase());
  const duplicates = lowerKeywords.filter((keyword, index) => lowerKeywords.indexOf(keyword) !== index);
  
  if (duplicates.length > 0) {
    issues.push(`Duplicate keywords found: ${duplicates.join(', ')}`);
    score -= 10;
  }

  return {
    issues,
    warnings,
    recommendations,
    score
  };
}

/**
 * Authors validation
 */
function validateAuthors(authors: Array<{ name: string; affiliation?: string; email?: string; orcid?: string }>) {
  const issues: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Count validation
  if (authors.length < VALIDATION_RULES.authors.minCount) {
    issues.push(`Too few authors (${authors.length} < ${VALIDATION_RULES.authors.minCount})`);
    score -= 20;
  } else if (authors.length > VALIDATION_RULES.authors.maxCount) {
    issues.push(`Too many authors (${authors.length} > ${VALIDATION_RULES.authors.maxCount})`);
    score -= 15;
  }

  // Individual author validation
  authors.forEach((author, index) => {
    // Name validation
    if (!author.name || author.name.trim().length < 2) {
      issues.push(`Author ${index + 1} has invalid name`);
      score -= 10;
    }

    // Affiliation validation
    if (VALIDATION_RULES.authors.requireAffiliation && (!author.affiliation || author.affiliation.trim().length < 2)) {
      warnings.push(`Author ${index + 1} missing affiliation`);
      score -= 5;
    }

    // Email validation
    if (VALIDATION_RULES.authors.requireEmail && author.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(author.email)) {
        warnings.push(`Author ${index + 1} has invalid email format`);
        score -= 3;
      }
    }

    // ORCID validation
    if (VALIDATION_RULES.authors.requireORCID && author.orcid) {
      const orcidRegex = /^\d{4}-\d{4}-\d{4}-\d{3}[\dX]$/;
      if (!orcidRegex.test(author.orcid)) {
        warnings.push(`Author ${index + 1} has invalid ORCID format`);
        score -= 3;
      }
    }
  });

  return {
    issues,
    warnings,
    recommendations,
    score
  };
}

/**
 * Technical metadata validation
 */
function validateTechnicalMetadata(paper: PaperMetadata) {
  const issues: string[] = [];
  const warnings: string[] = [];
  const recommendations: string[] = [];
  let score = 100;

  // Publication date validation
  if (!paper.publishedAt) {
    issues.push('Missing publication date');
    score -= 20;
  } else {
    const pubDate = new Date(paper.publishedAt);
    const now = new Date();
    const daysSincePublication = (now.getTime() - pubDate.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysSincePublication > 365) {
      warnings.push('Publication date is more than 1 year old');
      score -= 5;
    }
    
    if (daysSincePublication < 0) {
      issues.push('Publication date is in the future');
      score -= 25;
    }
  }

  // Journal validation
  if (!paper.journal) {
    warnings.push('Missing journal information');
    score -= 10;
  }

  // Volume/Issue validation
  if (!paper.volume && !paper.issue) {
    warnings.push('Missing volume and issue information');
    score -= 5;
  }

  // Pages validation
  if (paper.pages) {
    const pageRange = /^\d+-\d+$/.test(paper.pages);
    if (!pageRange) {
      warnings.push('Page format should be "start-end" (e.g., "1-15")');
      score -= 5;
    }
  }

  return {
    issues,
    warnings,
    recommendations,
    score
  };
}

/**
 * Generate validation report
 */
function generateValidationReport(results: MetadataValidationResult[]): string {
  let report = '# Metadata Validation Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n`;
  report += `Total Papers Validated: ${results.length}\n\n`;

  // Summary statistics
  const validPapers = results.filter(r => r.isValid);
  const averageScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / results.length);
  
  report += '## Summary\n\n';
  report += `- Total Papers: ${results.length}\n`;
  report += `- Valid Papers: ${validPapers.length}\n`;
  report += `- Invalid Papers: ${results.length - validPapers.length}\n`;
  report += `- Average Score: ${averageScore}/100\n`;
  report += `- Pass Rate: ${Math.round((validPapers.length / results.length) * 100)}%\n\n`;

  // Category averages
  const categoryAverages = {
    title: Math.round(results.reduce((sum, r) => sum + r.categoryScores.title, 0) / results.length),
    abstract: Math.round(results.reduce((sum, r) => sum + r.categoryScores.abstract, 0) / results.length),
    keywords: Math.round(results.reduce((sum, r) => sum + r.categoryScores.keywords, 0) / results.length),
    authors: Math.round(results.reduce((sum, r) => sum + r.categoryScores.authors, 0) / results.length),
    doi: Math.round(results.reduce((sum, r) => sum + r.categoryScores.doi, 0) / results.length),
    technical: Math.round(results.reduce((sum, r) => sum + r.categoryScores.technical, 0) / results.length)
  };

  report += '## Category Averages\n\n';
  Object.entries(categoryAverages).forEach(([category, average]) => {
    report += `- ${category.charAt(0).toUpperCase() + category.slice(1)}: ${average}/100\n`;
  });

  // Detailed results
  report += '\n## Detailed Results\n\n';
  
  results.forEach((result, index) => {
    report += `### Paper ${index + 1}: ${result.paper.title}\n\n`;
    report += `- **Overall Score:** ${result.score}/100 (${result.isValid ? 'VALID' : 'INVALID'})\n`;
    
    if (result.issues.length > 0) {
      report += '- **Issues:**\n';
      result.issues.forEach(issue => {
        report += `  - ${issue}\n`;
      });
    }
    
    if (result.warnings.length > 0) {
      report += '- **Warnings:**\n';
      result.warnings.forEach(warning => {
        report += `  - ${warning}\n`;
      });
    }
    
    if (result.recommendations.length > 0) {
      report += '- **Recommendations:**\n';
      result.recommendations.forEach(rec => {
        report += `  - ${rec}\n`;
      });
    }
    
    report += '\n';
  });

  // Priority actions
  report += '## Priority Actions\n\n';
  
  const criticalIssues = results.flatMap(r => r.issues);
  const commonIssues = getCommonIssues(results);
  
  if (criticalIssues.length > 0) {
    report += '### Critical Issues to Address\n\n';
    commonIssues.forEach(([issue, count]) => {
      report += `- ${issue} (${count} papers)\n`;
    });
  }
  
  return report;
}

/**
 * Get common issues across all papers
 */
function getCommonIssues(results: MetadataValidationResult[]): Array<[string, number]> {
  const issueCounts = new Map<string, number>();
  
  results.forEach(result => {
    result.issues.forEach(issue => {
      const count = issueCounts.get(issue) || 0;
      issueCounts.set(issue, count + 1);
    });
  });
  
  return Array.from(issueCounts.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10); // Top 10 issues
}

/**
 * Save report to file
 */
function saveReportToFile(report: string, filename: string): void {
  const fs = require('fs');
  const path = require('path');
  
  const reportPath = path.join(OUTPUT_DIR, filename);
  
  try {
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }
    
    fs.writeFileSync(reportPath, report, 'utf8');
    console.log(`📄 Report saved to: ${reportPath}`);
  } catch (error) {
    console.error('❌ Failed to save report:', error);
  }
}

/**
 * Command line interface
 */
function printUsage() {
  console.log(`
Metadata Validation Script

Usage:
  node validate-metadata.js [options]

Options:
  --help, -h          Show this help message
  --paper-id <id>     Specific paper ID to validate
  --all               Validate all papers
  --output-dir <dir>   Output directory for reports (default: ./validation-reports)
  --verbose           Enable verbose output

Examples:
  node validate-metadata.js --paper-id "paper-123"
  node validate-metadata.js --all
  node validate-metadata.js --output-dir "./reports" --verbose

Environment Variables:
  NEXT_PUBLIC_BASE_URL  Base URL for the application
  OUTPUT_DIR           Output directory for validation reports
  VERBOSE              Enable verbose logging
`);
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    help: false,
    paperId: null as string | null,
    all: false,
    outputDir: OUTPUT_DIR,
    verbose: VERBOSE
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--paper-id':
        if (i + 1 < args.length) {
          options.paperId = args[i + 1];
          i++;
        }
        break;
      case '--all':
        options.all = true;
        break;
      case '--output-dir':
        if (i + 1 < args.length) {
          options.outputDir = args[i + 1];
          i++;
        }
        break;
      case '--verbose':
        options.verbose = true;
        break;
    }
  }
  
  return options;
}

/**
 * Main execution
 */
async function main() {
  const options = parseArgs();
  
  if (options.help) {
    printUsage();
    process.exit(0);
  }
  
  // Update environment
  if (options.outputDir !== OUTPUT_DIR) {
    process.env.OUTPUT_DIR = options.outputDir;
  }
  
  if (options.verbose) {
    process.env.VERBOSE = 'true';
  }
  
  console.log('🔍 Starting Metadata Validation...\n');
  
  try {
    if (options.all) {
      console.log('📚 Validating all papers...');
      
      // This would typically fetch papers from database
      const samplePapers = [
        {
          id: 'sample-1',
          title: 'Machine Learning in Academic Research: A Comprehensive Analysis',
          abstract: 'This paper presents a comprehensive analysis of machine learning applications in academic research environments...',
          authors: [
            { name: 'Dr. John Smith', affiliation: 'IJARCM' },
            { name: 'Dr. Jane Doe', affiliation: 'University of Technology' }
          ],
          publishedAt: '2024-01-15T00:00:00.000Z',
          doi: '10.5923/ijarcm.2024.1.1',
          journal: 'International Journal of Academic Research in Commerce and Management',
          volume: '15',
          issue: '1',
          pages: '1-15',
          keywords: ['machine learning', 'academic research', 'computer applications'],
          pdfUrl: '/uploads/papers/sample-1.pdf',
          issn: '2455-0116'
        }
      ];
      
      const results = await Promise.all(
        samplePapers.map(paper => validateMetadata(paper))
      );
      
      const report = generateValidationReport(results);
      saveReportToFile(report, `metadata-validation-${Date.now()}.md`);
      
      console.log('✅ Validation complete!');
      
    } else if (options.paperId) {
      console.log(`📄 Validating paper: ${options.paperId}`);
      
      // This would typically fetch specific paper from database
      const samplePaper: PaperMetadata = {
        id: options.paperId,
        title: 'Sample Paper for Validation',
        abstract: 'This is a sample abstract for testing metadata validation...',
        authors: [{ name: 'Dr. Test Author', affiliation: 'Test University' }],
        publishedAt: '2024-01-15T00:00:00.000Z',
        doi: '10.5923/ijarcm.2024.1.1',
        journal: 'International Journal of Academic Research in Commerce and Management',
        volume: '15',
        issue: '1',
        pages: '1-15',
        keywords: ['test', 'validation', 'metadata'],
        pdfUrl: '/uploads/papers/test.pdf',
        issn: '2455-0116'
      };
      
      const result = await validateMetadata(samplePaper);
      
      console.log(`Score: ${result.score}/100`);
      console.log(`Status: ${result.isValid ? 'VALID' : 'INVALID'}`);
      
      if (result.issues.length > 0) {
        console.log('\n❌ Issues:');
        result.issues.forEach(issue => console.log(`  - ${issue}`));
      }
      
      if (result.warnings.length > 0) {
        console.log('\n⚠️ Warnings:');
        result.warnings.forEach(warning => console.log(`  - ${warning}`));
      }
      
      if (result.recommendations.length > 0) {
        console.log('\n💡 Recommendations:');
        result.recommendations.forEach(rec => console.log(`  - ${rec}`));
      }
      
    } else {
      console.log('❌ Please specify --paper-id or --all');
      printUsage();
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  }
}

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Promise Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script execution failed:', error);
    process.exit(1);
  });
}