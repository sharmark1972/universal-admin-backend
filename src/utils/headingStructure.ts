// Heading structure validation and accessibility utilities

export interface HeadingStructure {
  level: 1 | 2 | 3 | 4 | 5 | 6;
  text: string;
  id?: string;
  className?: string;
}

// Validate heading hierarchy for SEO and accessibility
export const validateHeadingHierarchy = (headings: HeadingStructure[]): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} => {
  const errors: string[] = [];
  const warnings: string[] = [];
  let hasH1 = false;
  let previousLevel = 0;

  headings.forEach((heading, index) => {
    const { level, text } = heading;

    // Check for H1
    if (level === 1) {
      if (hasH1) {
        errors.push(`Multiple H1 tags found. Only one H1 should exist per page.`);
      }
      hasH1 = true;
    }

    // Check for empty headings
    if (!text || text.trim().length === 0) {
      errors.push(`Heading at position ${index + 1} is empty.`);
    }

    // Check for proper hierarchy
    if (index === 0 && level !== 1) {
      warnings.push(`First heading should be H1, found H${level}.`);
    }

    if (previousLevel > 0 && level > previousLevel + 1) {
      warnings.push(`Heading level jumps from H${previousLevel} to H${level}. Consider using H${previousLevel + 1} instead.`);
    }

    // Check heading length for SEO
    if (text && text.length > 60) {
      warnings.push(`Heading "${text.substring(0, 30)}..." is longer than 60 characters. Consider shortening for better SEO.`);
    }

    if (text && text.length < 10 && level <= 2) {
      warnings.push(`Heading "${text}" might be too short for SEO purposes.`);
    }

    previousLevel = level;
  });

  if (!hasH1) {
    errors.push('No H1 tag found. Every page should have exactly one H1 tag.');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

// Generate heading ID from text
export const generateHeadingId = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
};

// Create table of contents from headings
export const generateTableOfContents = (headings: HeadingStructure[]): {
  id: string;
  text: string;
  level: number;
  children?: any[];
}[] => {
  const toc: any[] = [];
  const stack: any[] = [];

  headings.forEach(heading => {
    const item = {
      id: heading.id || generateHeadingId(heading.text),
      text: heading.text,
      level: heading.level,
      children: []
    };

    // Find the correct parent level
    while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
      stack.pop();
    }

    if (stack.length === 0) {
      toc.push(item);
    } else {
      stack[stack.length - 1].children.push(item);
    }

    stack.push(item);
  });

  return toc;
};

// SEO-optimized heading component props
export const getOptimizedHeadingProps = (level: 1 | 2 | 3 | 4 | 5 | 6, text: string, options?: {
  generateId?: boolean;
  className?: string;
  includeAnchor?: boolean;
}) => {
  const id = options?.generateId !== false ? generateHeadingId(text) : undefined;
  
  return {
    id,
    className: options?.className,
    'aria-level': level,
    role: 'heading',
    ...(options?.includeAnchor && id && {
      'data-anchor': id
    })
  };
};

// Extract headings from HTML content
export const extractHeadingsFromHTML = (html: string): HeadingStructure[] => {
  if (typeof window === 'undefined') return [];
  
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const headingElements = doc.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  return Array.from(headingElements).map(element => ({
    level: parseInt(element.tagName.charAt(1)) as 1 | 2 | 3 | 4 | 5 | 6,
    text: element.textContent || '',
    id: element.id,
    className: element.className
  }));
};

// Accessibility helpers
export const addHeadingNavigation = () => {
  if (typeof window === 'undefined') return;
  
  const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
  
  headings.forEach((heading, index) => {
    if (!heading.id) {
      heading.id = generateHeadingId(heading.textContent || `heading-${index}`);
    }
    
    // Add tabindex for keyboard navigation
    heading.setAttribute('tabindex', '-1');
    
    // Add skip link functionality
    heading.addEventListener('focus', () => {
      heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
};

// SEO heading analysis
export const analyzeHeadingsForSEO = (headings: HeadingStructure[]) => {
  const analysis = {
    score: 100,
    issues: [] as string[],
    recommendations: [] as string[]
  };
  
  const validation = validateHeadingHierarchy(headings);
  
  if (!validation.isValid) {
    analysis.score -= validation.errors.length * 20;
    analysis.issues.push(...validation.errors);
  }
  
  if (validation.warnings.length > 0) {
    analysis.score -= validation.warnings.length * 5;
    analysis.recommendations.push(...validation.warnings);
  }
  
  // Check for keyword optimization
  const h1 = headings.find(h => h.level === 1);
  if (h1 && h1.text.length < 30) {
    analysis.recommendations.push('Consider making your H1 more descriptive and keyword-rich.');
  }
  
  // Check heading distribution
  if (headings.length < 3) {
    analysis.recommendations.push('Consider adding more headings to improve content structure and SEO.');
  }
  
  if (headings.length > 15) {
    analysis.recommendations.push('Too many headings might dilute SEO value. Consider consolidating content.');
  }
  
  return analysis;
};