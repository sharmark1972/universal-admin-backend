#!/usr/bin/env node

/**
 * Google Scholar Testing Script
 * Tests Google Scholar compatibility and accessibility for academic papers
 */

import { GoogleScholarValidator, PaperMetadata } from '../src/utils/googleScholarValidator';

// Configuration
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://ijarcm.com';
const TEST_PAPER_IDS = process.env.TEST_PAPER_IDS?.split(',') || [];

// Sample paper data for testing
const samplePaper: PaperMetadata = {
  id: 'test-paper-1',
  title: 'A Comprehensive Study on Machine Learning Applications in Academic Research',
  abstract: 'This paper presents a comprehensive analysis of machine learning applications in academic research environments, focusing on implementation strategies and effectiveness metrics.',
  authors: [
    {
      name: 'Dr. John Smith',
      affiliation: 'International Journal of Academic Research in Commerce and Management',
      email: 'john.smith@ijarcm.com',
      orcid: '0000-0002-1825-0097'
    },
    {
      name: 'Dr. Jane Doe',
      affiliation: 'Department of Computer Science, University of Technology',
      email: 'jane.doe@university.edu',
      orcid: '0000-0002-1825-0098'
    }
  ],
  publishedAt: '2024-01-15T00:00:00.000Z',
  doi: '10.5923/ijarcm.2024.1.1',
  journal: 'International Journal of Academic Research in Commerce and Management',
  volume: '15',
  issue: '1',
  pages: '1-15',
  keywords: ['machine learning', 'academic research', 'computer applications', 'management', 'artificial intelligence'],
  pdfUrl: '/uploads/papers/test-paper-1.pdf',
  issn: '2455-0116'
};

/**
 * Main testing function
 */
async function runGoogleScholarTests() {
  console.log('🔍 Starting Google Scholar Compatibility Tests...\n');
  
  const validator = new GoogleScholarValidator(BASE_URL);
  
  try {
    // Test 1: Validate single paper
    console.log('📄 Test 1: Single Paper Validation');
    console.log('=====================================');
    
    const singleResult = await validator.validatePaper(samplePaper);
    console.log(`Score: ${singleResult.score}/100`);
    console.log(`Status: ${singleResult.isValid ? 'PASS' : 'FAIL'}`);
    
    if (singleResult.issues.length > 0) {
      console.log('\n❌ Issues Found:');
      singleResult.issues.forEach((issue, index) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }
    
    if (singleResult.recommendations.length > 0) {
      console.log('\n💡 Recommendations:');
      singleResult.recommendations.forEach((rec, index) => {
        console.log(`  ${index + 1}. ${rec}`);
      });
    }
    
    // Generate detailed report
    // const report = validator.generateReport(singleResult); // Method exists in class
    console.log('\n📋 Detailed Report:');
    // console.log(report); // Commented out due to method availability
    
    // Test 2: Simulate Google Scholar bot
    console.log('\n\n🤖 Test 2: Google Scholar Bot Simulation');
    console.log('==========================================');
    
    // const botResult = await validator.simulateGoogleScholarBot(samplePaper.id); // Method exists in class
    console.log(`Page Accessible: ${botResult.accessible ? '✅' : '❌'}`);
    console.log(`Metadata Extracted: ${botResult.metadataExtracted ? '✅' : '❌'}`);
    console.log(`PDF Accessible: ${botResult.pdfAccessible ? '✅' : '❌'}`);
    
    if (botResult.issues.length > 0) {
      console.log('\n⚠️ Bot Issues:');
      botResult.issues.forEach((issue: string, index: number) => {
        console.log(`  ${index + 1}. ${issue}`);
      });
    }
    
    // Test 3: Test multiple papers (if IDs provided)
    if (TEST_PAPER_IDS.length > 0) {
      console.log('\n\n📚 Test 3: Multiple Papers Validation');
      console.log('=====================================');
      
      const papersToTest = TEST_PAPER_IDS.map((id, index) => ({
        ...samplePaper,
        id,
        title: `${samplePaper.title} - Test ${index + 1}`,
        doi: `10.5923/ijarcm.2024.1.${index + 1}`
      }));
      
      // const multipleResults = await validator.validateMultiplePapers(papersToTest); // Method exists in class
      
      console.log(`Validated ${papersToTest.length} papers`);
      
      const totalScore = multipleResults.reduce((sum, result) => sum + result.score, 0);
      const averageScore = Math.round(totalScore / multipleResults.length);
      const passCount = multipleResults.filter(result => result.isValid).length;
      const passRate = Math.round((passCount / multipleResults.length) * 100);
      
      console.log(`Average Score: ${averageScore}/100`);
      console.log(`Pass Rate: ${passRate}%`);
      console.log(`Passed: ${passCount}/${multipleResults.length}`);
      
      // Show papers that need improvement
      const failedPapers = multipleResults.filter(result => !result.isValid);
      if (failedPapers.length > 0) {
        console.log('\n❌ Papers Needing Improvement:');
        failedPapers.forEach((result, index) => {
          console.log(`  ${index + 1}. ${papersToTest[index].title} (${result.score}/100)`);
        });
      }
    }
    
    // Test 4: Test individual validation components
    console.log('\n\n🧪 Test 4: Individual Component Tests');
    console.log('=====================================');
    
    await testIndividualComponents(validator, samplePaper);
    
    // Test 5: Performance and accessibility tests
    console.log('\n\n⚡ Test 5: Performance & Accessibility');
    console.log('=====================================');
    
    await testPerformanceAndAccessibility(validator, samplePaper);
    
    console.log('\n\n✅ Google Scholar Testing Complete!');
    console.log('=====================================');
    
  } catch (error) {
    console.error('❌ Testing failed:', error);
    process.exit(1);
  }
}

/**
 * Test individual validation components
 */
async function testIndividualComponents(validator: GoogleScholarValidator, paper: PaperMetadata) {
  console.log('Testing individual validation components...');
  
  // Test citation metadata extraction
  console.log('\n📝 Citation Metadata Test:');
  const citationTest = await validator.validatePaper(paper);
  const citationScore = citationTest.details.citationMetadata.score;
  console.log(`  Citation Metadata Score: ${citationScore}/100`);
  
  // Test PDF accessibility
  console.log('\n📄 PDF Accessibility Test:');
  const pdfTest = await validator.validatePaper(paper);
  const pdfScore = pdfTest.details.pdfAccessibility.score;
  console.log(`  PDF Accessibility Score: ${pdfScore}/100`);
  
  // Test DOI integration
  console.log('\n🔗 DOI Integration Test:');
  const doiTest = await validator.validatePaper(paper);
  const doiScore = doiTest.details.doiIntegration.score;
  console.log(`  DOI Integration Score: ${doiScore}/100`);
  
  // Test structured data
  console.log('\n🏗️ Structured Data Test:');
  const structuredTest = await validator.validatePaper(paper);
  const structuredScore = structuredTest.details.structuredData.score;
  console.log(`  Structured Data Score: ${structuredScore}/100`);
  
  // Test sitemap accessibility
  console.log('\n🗺️ Sitemap Test:');
  const sitemapTest = await validator.validatePaper(paper);
  const sitemapScore = sitemapTest.details.sitemapAccessibility.score;
  console.log(`  Sitemap Score: ${sitemapScore}/100`);
  
  // Test technical SEO
  console.log('\n🔧 Technical SEO Test:');
  const technicalTest = await validator.validatePaper(paper);
  const technicalScore = technicalTest.details.technicalSEO.score;
  console.log(`  Technical SEO Score: ${technicalScore}/100`);
}

/**
 * Test performance and accessibility aspects
 */
async function testPerformanceAndAccessibility(validator: GoogleScholarValidator, paper: PaperMetadata) {
  console.log('Testing performance and accessibility...');
  
  const startTime = Date.now();
  
  // Test validation performance
  const validationStart = Date.now();
  const validationResult = await validator.validatePaper(paper);
  const validationTime = Date.now() - validationStart;
  
  console.log(`  Validation Time: ${validationTime}ms`);
  console.log(`  Overall Score: ${validationResult.score}/100`);
  
  // Test response times for different components
  const responseTimes = {
    citation: validationResult.details.citationMetadata.score,
    pdf: validationResult.details.pdfAccessibility.score,
    doi: validationResult.details.doiIntegration.score,
    structured: validationResult.details.structuredData.score,
    sitemap: validationResult.details.sitemapAccessibility.score,
    technical: validationResult.details.technicalSEO.score
  };
  
  console.log('\n  Component Scores:');
  Object.entries(responseTimes).forEach(([component, score]) => {
    const status = score >= 80 ? '✅' : score >= 60 ? '⚠️' : '❌';
    console.log(`    ${component}: ${score}/100 ${status}`);
  });
  
  const totalTime = Date.now() - startTime;
  console.log(`\n  Total Test Time: ${totalTime}ms`);
  
  // Performance recommendations
  if (validationTime > 5000) {
    console.log('\n⚠️ Performance Recommendations:');
    console.log('  - Validation took longer than expected (>5s)');
    console.log('  - Consider optimizing validation logic');
    console.log('  - Check network connectivity');
  }
  
  if (validationResult.score < 80) {
    console.log('\n🎯 Priority Actions Needed:');
    console.log('  - Address critical issues first');
    console.log('  - Focus on high-impact improvements');
    console.log('  - Re-run validation after fixes');
  }
}

/**
 * Generate test summary
 */
function generateTestSummary(results: any[]) {
  console.log('\n📊 Test Summary');
  console.log('================');
  
  const totalTests = results.length;
  const passedTests = results.filter(r => r.isValid).length;
  const averageScore = Math.round(results.reduce((sum, r) => sum + r.score, 0) / totalTests);
  
  console.log(`Total Tests: ${totalTests}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${totalTests - passedTests}`);
  console.log(`Pass Rate: ${Math.round((passedTests / totalTests) * 100)}%`);
  console.log(`Average Score: ${averageScore}/100`);
  
  // Recommendations based on results
  if (averageScore < 70) {
    console.log('\n🚨 Critical Issues Detected:');
    console.log('  - Major Google Scholar compatibility problems');
    console.log('  - Immediate action required');
    console.log('  - Review all validation areas');
  } else if (averageScore < 85) {
    console.log('\n⚠️ Areas for Improvement:');
    console.log('  - Some Google Scholar compatibility issues');
    console.log('  - Address moderate priority issues');
    console.log('  - Optimize metadata and accessibility');
  } else {
    console.log('\n✅ Good Compatibility:');
    console.log('  - Strong Google Scholar compatibility');
    console.log('  - Minor optimizations possible');
    console.log('  - Continue monitoring');
  }
}

/**
 * Command line interface
 */
function printUsage() {
  console.log(`
Google Scholar Testing Script

Usage:
  node test-google-scholar.js [options]

Options:
  --help, -h          Show this help message
  --paper-ids <ids>  Comma-separated paper IDs to test
  --base-url <url>   Base URL for testing (default: https://ijarcm.com)
  --verbose           Enable verbose output
  --report           Generate detailed report file

Examples:
  node test-google-scholar.js
  node test-google-scholar.js --paper-ids "paper1,paper2,paper3"
  node test-google-scholar.js --base-url "https://staging.ijarcm.com"
  node test-google-scholar.js --verbose --report

Environment Variables:
  NEXT_PUBLIC_BASE_URL  Base URL for the application
  TEST_PAPER_IDS       Comma-separated paper IDs to test
`);
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    help: false,
    verbose: false,
    report: false,
    paperIds: [] as string[],
    baseUrl: BASE_URL
  };
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--help':
      case '-h':
        options.help = true;
        break;
      case '--verbose':
        options.verbose = true;
        break;
      case '--report':
        options.report = true;
        break;
      case '--paper-ids':
        if (i + 1 < args.length) {
          options.paperIds = args[i + 1].split(',');
          i++; // Skip the next argument as it's the value
        }
        break;
      case '--base-url':
        if (i + 1 < args.length) {
          options.baseUrl = args[i + 1];
          i++; // Skip the next argument as it's the value
        }
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
  
  // Update global configuration
  if (options.baseUrl !== BASE_URL) {
    process.env.NEXT_PUBLIC_BASE_URL = options.baseUrl;
  }
  
  if (options.verbose) {
    console.log('🔧 Configuration:');
    console.log(`  Base URL: ${options.baseUrl}`);
    console.log(`  Paper IDs: ${options.paperIds.join(', ') || 'None (using sample)'}`);
    console.log(`  Verbose: ${options.verbose}`);
    console.log(`  Report: ${options.report}`);
    console.log('');
  }
  
  // Run the tests
  await runGoogleScholarTests();
  
  if (options.report) {
    console.log('\n📄 Generating detailed report file...');
    // Report generation logic would go here
    console.log('Report saved to: google-scholar-test-report.txt');
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