'use client';

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { CheckCircle, XCircle, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface SEOCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  recommendation?: string;
}

interface SEOValidatorProps {
  showInProduction?: boolean;
}

export default function SEOValidator({ showInProduction = false }: SEOValidatorProps) {
  const [checks, setChecks] = useState<SEOCheck[]>([]);
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  
  // Don't show in production unless explicitly enabled
  const shouldShow = process.env.NODE_ENV === 'development' || showInProduction;
  
  useEffect(() => {
    if (!shouldShow) return;
    
    const validateSEO = () => {
      const newChecks: SEOCheck[] = [];
      
      // Check page title
      const title = document.title;
      if (!title) {
        newChecks.push({
          name: 'Page Title',
          status: 'fail',
          message: 'No page title found',
          recommendation: 'Add a descriptive page title (50-60 characters)'
        });
      } else if (title.length < 30) {
        newChecks.push({
          name: 'Page Title',
          status: 'warning',
          message: `Title too short (${title.length} characters)`,
          recommendation: 'Titles should be 50-60 characters for optimal SEO'
        });
      } else if (title.length > 60) {
        newChecks.push({
          name: 'Page Title',
          status: 'warning',
          message: `Title too long (${title.length} characters)`,
          recommendation: 'Titles should be 50-60 characters for optimal SEO'
        });
      } else {
        newChecks.push({
          name: 'Page Title',
          status: 'pass',
          message: `Good title length (${title.length} characters)`
        });
      }
      
      // Check meta description
      const metaDescription = document.querySelector('meta[name="description"]');
      if (!metaDescription) {
        newChecks.push({
          name: 'Meta Description',
          status: 'fail',
          message: 'No meta description found',
          recommendation: 'Add a meta description (150-160 characters)'
        });
      } else {
        const content = metaDescription.getAttribute('content') || '';
        if (content.length < 120) {
          newChecks.push({
            name: 'Meta Description',
            status: 'warning',
            message: `Description too short (${content.length} characters)`,
            recommendation: 'Meta descriptions should be 150-160 characters'
          });
        } else if (content.length > 160) {
          newChecks.push({
            name: 'Meta Description',
            status: 'warning',
            message: `Description too long (${content.length} characters)`,
            recommendation: 'Meta descriptions should be 150-160 characters'
          });
        } else {
          newChecks.push({
            name: 'Meta Description',
            status: 'pass',
            message: `Good description length (${content.length} characters)`
          });
        }
      }
      
      // Check canonical URL
      const canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        newChecks.push({
          name: 'Canonical URL',
          status: 'fail',
          message: 'No canonical URL found',
          recommendation: 'Add a canonical URL to prevent duplicate content issues'
        });
      } else {
        newChecks.push({
          name: 'Canonical URL',
          status: 'pass',
          message: 'Canonical URL present'
        });
      }
      
      // Check Open Graph tags
      const ogTitle = document.querySelector('meta[property="og:title"]');
      const ogDescription = document.querySelector('meta[property="og:description"]');
      const ogImage = document.querySelector('meta[property="og:image"]');
      const ogUrl = document.querySelector('meta[property="og:url"]');
      
      if (!ogTitle || !ogDescription || !ogImage || !ogUrl) {
        newChecks.push({
          name: 'Open Graph Tags',
          status: 'warning',
          message: 'Some Open Graph tags missing',
          recommendation: 'Ensure og:title, og:description, og:image, and og:url are present'
        });
      } else {
        newChecks.push({
          name: 'Open Graph Tags',
          status: 'pass',
          message: 'All essential Open Graph tags present'
        });
      }
      
      // Check Twitter Card tags
      const twitterCard = document.querySelector('meta[name="twitter:card"]');
      const twitterTitle = document.querySelector('meta[name="twitter:title"]');
      const twitterDescription = document.querySelector('meta[name="twitter:description"]');
      
      if (!twitterCard || !twitterTitle || !twitterDescription) {
        newChecks.push({
          name: 'Twitter Cards',
          status: 'warning',
          message: 'Some Twitter Card tags missing',
          recommendation: 'Add twitter:card, twitter:title, and twitter:description'
        });
      } else {
        newChecks.push({
          name: 'Twitter Cards',
          status: 'pass',
          message: 'Twitter Card tags present'
        });
      }
      
      // Check structured data
      const structuredData = document.querySelector('script[type="application/ld+json"]');
      if (!structuredData) {
        newChecks.push({
          name: 'Structured Data',
          status: 'warning',
          message: 'No structured data found',
          recommendation: 'Add JSON-LD structured data for better search results'
        });
      } else {
        try {
          JSON.parse(structuredData.textContent || '');
          newChecks.push({
            name: 'Structured Data',
            status: 'pass',
            message: 'Valid structured data present'
          });
        } catch {
          newChecks.push({
            name: 'Structured Data',
            status: 'fail',
            message: 'Invalid structured data JSON',
            recommendation: 'Fix JSON-LD syntax errors'
          });
        }
      }
      
      // Check heading structure
      const h1Elements = document.querySelectorAll('h1');
      if (h1Elements.length === 0) {
        newChecks.push({
          name: 'H1 Heading',
          status: 'fail',
          message: 'No H1 heading found',
          recommendation: 'Add exactly one H1 heading per page'
        });
      } else if (h1Elements.length > 1) {
        newChecks.push({
          name: 'H1 Heading',
          status: 'warning',
          message: `Multiple H1 headings found (${h1Elements.length})`,
          recommendation: 'Use only one H1 heading per page'
        });
      } else {
        newChecks.push({
          name: 'H1 Heading',
          status: 'pass',
          message: 'Single H1 heading present'
        });
      }
      
      // Check robots meta
      const robots = document.querySelector('meta[name="robots"]');
      if (!robots) {
        newChecks.push({
          name: 'Robots Meta',
          status: 'warning',
          message: 'No robots meta tag found',
          recommendation: 'Add robots meta tag to control indexing'
        });
      } else {
        newChecks.push({
          name: 'Robots Meta',
          status: 'pass',
          message: 'Robots meta tag present'
        });
      }
      
      // Check image alt attributes
      const images = document.querySelectorAll('img');
      const imagesWithoutAlt = Array.from(images).filter(img => !img.getAttribute('alt'));
      if (imagesWithoutAlt.length > 0) {
        newChecks.push({
          name: 'Image Alt Text',
          status: 'warning',
          message: `${imagesWithoutAlt.length} images without alt text`,
          recommendation: 'Add descriptive alt text to all images'
        });
      } else if (images.length > 0) {
        newChecks.push({
          name: 'Image Alt Text',
          status: 'pass',
          message: 'All images have alt text'
        });
      }
      
      // Check internal links
      const internalLinks = document.querySelectorAll('a[href^="/"], a[href^="#"]');
      if (internalLinks.length < 3) {
        newChecks.push({
          name: 'Internal Linking',
          status: 'warning',
          message: 'Few internal links found',
          recommendation: 'Add more internal links to improve site navigation'
        });
      } else {
        newChecks.push({
          name: 'Internal Linking',
          status: 'pass',
          message: `Good internal linking (${internalLinks.length} links)`
        });
      }
      
      setChecks(newChecks);
      setIsLoading(false);
    };
    
    // Run validation after a short delay to ensure DOM is ready
    const timer = setTimeout(validateSEO, 1000);
    
    return () => clearTimeout(timer);
  }, [pathname, shouldShow]);
  
  if (!shouldShow) return null;
  
  const passCount = checks.filter(check => check.status === 'pass').length;
  const warningCount = checks.filter(check => check.status === 'warning').length;
  const failCount = checks.filter(check => check.status === 'fail').length;
  const totalScore = Math.round((passCount / checks.length) * 100) || 0;
  
  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle Button */}
      <button
        onClick={() => setIsVisible(!isVisible)}
        className={`mb-2 px-3 py-2 rounded-lg shadow-lg text-white font-medium transition-all duration-200 ${
          totalScore >= 80 ? 'bg-green-600 hover:bg-green-700' :
          totalScore >= 60 ? 'bg-yellow-600 hover:bg-yellow-700' :
          'bg-red-600 hover:bg-red-700'
        }`}
        title="SEO Validator"
      >
        {isVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        <span className="ml-2">SEO: {totalScore}%</span>
      </button>
      
      {/* Validation Panel */}
      {isVisible && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 w-80 max-h-96 overflow-y-auto">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100">
              SEO Validation Report
            </h3>
            <div className="flex items-center gap-4 mt-2 text-sm">
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="w-4 h-4" />
                {passCount} Pass
              </span>
              <span className="flex items-center gap-1 text-yellow-600">
                <AlertCircle className="w-4 h-4" />
                {warningCount} Warning
              </span>
              <span className="flex items-center gap-1 text-red-600">
                <XCircle className="w-4 h-4" />
                {failCount} Fail
              </span>
            </div>
          </div>
          
          <div className="p-4 space-y-3">
            {isLoading ? (
              <div className="text-center py-4 text-gray-500">
                Analyzing SEO...
              </div>
            ) : (
              checks.map((check, index) => (
                <div key={index} className="border-l-4 pl-3 py-2 border-l-gray-200 dark:border-l-gray-600">
                  <div className="flex items-start gap-2">
                    {check.status === 'pass' && <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />}
                    {check.status === 'warning' && <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />}
                    {check.status === 'fail' && <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100">
                        {check.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        {check.message}
                      </p>
                      {check.recommendation && (
                        <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 italic">
                          {check.recommendation}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Hook for programmatic SEO validation
export function useSEOValidation() {
  const [score, setScore] = useState(0);
  const [issues, setIssues] = useState<SEOCheck[]>([]);
  
  const validateSEO = () => {
    // Implementation similar to the component above
    // Returns validation results for programmatic use
  };
  
  return { score, issues, validateSEO };
}