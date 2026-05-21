/**
 * DOI (Digital Object Identifier) utilities for academic journal platform
 * Provides validation, formatting, and generation functions for DOI management
 */

export interface DOIValidationResult {
  isValid: boolean;
  error?: string;
  normalizedDOI?: string;
}

export interface DOIGenerationOptions {
  prefix?: string;
  journalCode?: string;
  year?: number;
  volume?: string;
  issue?: string;
  articleNumber?: string;
}

/**
 * Validates DOI format according to Crossref standards
 * DOI format: 10.xxxx/xxxxx
 */
export function validateDOI(doi: string): DOIValidationResult {
  if (!doi || typeof doi !== 'string') {
    return {
      isValid: false,
      error: 'DOI is required and must be a string'
    };
  }

  // Remove whitespace and normalize
  const normalizedDOI = doi.trim().replace(/\s+/g, '');

  // Check if DOI starts with https://doi.org/ or doi.org/
  if (normalizedDOI.startsWith('https://doi.org/')) {
    const actualDOI = normalizedDOI.replace('https://doi.org/', '');
    return validateDOI(actualDOI);
  }

  if (normalizedDOI.startsWith('doi.org/')) {
    const actualDOI = normalizedDOI.replace('doi.org/', '');
    return validateDOI(actualDOI);
  }

  // Basic DOI format validation
  const doiRegex = /^10\.\d{4,9}\/.+$/;
  if (!doiRegex.test(normalizedDOI)) {
    return {
      isValid: false,
      error: 'Invalid DOI format. DOI should be in format: 10.xxxx/xxxxx'
    };
  }

  // Check for minimum length after directory indicator
  const parts = normalizedDOI.split('/');
  if (parts.length !== 2 || parts[1].length < 1) {
    return {
      isValid: false,
      error: 'Invalid DOI format. DOI must contain a suffix after the prefix'
    };
  }

  // Check for invalid characters
  const invalidChars = /[<>"\s]/;
  if (invalidChars.test(normalizedDOI)) {
    return {
      isValid: false,
      error: 'DOI contains invalid characters'
    };
  }

  return {
    isValid: true,
    normalizedDOI
  };
}

/**
 * Formats DOI to standard format
 */
export function formatDOI(doi: string): string {
  if (!doi) return '';

  // Remove any existing URL prefix
  let formattedDOI = doi.trim();
  
  if (formattedDOI.startsWith('https://doi.org/')) {
    formattedDOI = formattedDOI.replace('https://doi.org/', '');
  } else if (formattedDOI.startsWith('doi.org/')) {
    formattedDOI = formattedDOI.replace('doi.org/', '');
  }

  return formattedDOI;
}

/**
 * Creates a DOI URL for resolution
 */
export function createDOIURL(doi: string): string {
  const formattedDOI = formatDOI(doi);
  return formattedDOI ? `https://doi.org/${formattedDOI}` : '';
}

/**
 * Generates a DOI prefix for the journal
 * Default prefix for IJARCM
 */
export function generateDOIPrefix(): string {
  // This would typically be obtained from Crossref registration
  // For now, using a placeholder prefix
  return '10.5923';
}

/**
 * Generates a DOI for a paper based on publication metadata
 */
export function generateDOI(options: DOIGenerationOptions): string {
  const {
    prefix = generateDOIPrefix(),
    journalCode = 'ijrcam',
    year = new Date().getFullYear(),
    volume = '1',
    issue = '1',
    articleNumber = '1'
  } = options;

  // Format: 10.xxxx/journalcode.year.volume.issue.articleNumber
  const suffix = `${journalCode}.${year}.${volume}.${issue}.${articleNumber}`;
  return `${prefix}/${suffix}`;
}

/**
 * Extracts DOI prefix from a DOI
 */
export function extractDOIPrefix(doi: string): string | null {
  const formattedDOI = formatDOI(doi);
  const parts = formattedDOI.split('/');
  return parts.length >= 2 ? parts[0] : null;
}

/**
 * Extracts DOI suffix from a DOI
 */
export function extractDOISuffix(doi: string): string | null {
  const formattedDOI = formatDOI(doi);
  const parts = formattedDOI.split('/');
  return parts.length >= 2 ? parts[1] : null;
}

/**
 * Checks if DOI is registered with Crossref
 * Note: This would require actual Crossref API integration
 */
export async function checkDOIRegistration(doi: string): Promise<boolean> {
  try {
    const formattedDOI = formatDOI(doi);
    const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(formattedDOI)}`);
    return response.ok;
  } catch (error) {
    console.error('Error checking DOI registration:', error);
    return false;
  }
}

/**
 * Validates DOI for published papers (required field)
 */
export function validateRequiredDOI(doi: string, status: string): DOIValidationResult {
  // For published papers, DOI is required
  if (status === 'PUBLISHED') {
    if (!doi || doi.trim() === '') {
      return {
        isValid: false,
        error: 'DOI is required for published papers'
      };
    }
  }

  // If DOI is provided, validate its format
  if (doi && doi.trim() !== '') {
    return validateDOI(doi);
  }

  // For non-published papers, DOI is optional
  return {
    isValid: true
  };
}

/**
 * Formats DOI metadata for Crossref submission
 */
export function formatCrossrefMetadata(paper: {
  doi?: string;
  id: string;
  title: string;
  abstract: string;
  publishedAt?: string;
  volumeNumber?: string;
  issueNumber?: string;
  firstPage?: string;
  lastPage?: string;
  keywords?: string;
  paperAuthors?: Array<{
    user: {
      firstName: string;
      lastName: string;
      institution?: string;
    };
  }>;
}) {
  const authors = paper.paperAuthors?.map((author) => ({
    given: author.user.firstName,
    family: author.user.lastName,
    affiliation: author.user.institution ? [{ name: author.user.institution }] : []
  })) || [];

  return {
    doi: paper.doi,
    url: `${process.env.NEXT_PUBLIC_BASE_URL}/papers/${paper.id}`,
    type: 'journal-article',
    title: paper.title,
    abstract: paper.abstract,
    authors,
    published: {
      'date-parts': [[
        paper.publishedAt ? new Date(paper.publishedAt).getFullYear() : new Date().getFullYear(),
        paper.publishedAt ? new Date(paper.publishedAt).getMonth() + 1 : new Date().getMonth() + 1,
        paper.publishedAt ? new Date(paper.publishedAt).getDate() : new Date().getDate()
      ]]
    },
    'container-title': ['International Journal of Research in Computer Applications and Management'],
    ISSN: ['2455-0116'],
    volume: paper.volumeNumber || '1',
    issue: paper.issueNumber || '1',
    page: paper.firstPage ? `${paper.firstPage}-${paper.lastPage || paper.firstPage}` : undefined,
    keywords: paper.keywords ? paper.keywords.split(',').map((k: string) => k.trim()) : []
  };
}

/**
 * Generates a unique DOI suffix for a paper
 */
export function generateUniqueSuffix(paperId: string, sequenceNumber: number): string {
  // Use timestamp and paper ID to ensure uniqueness
  const timestamp = Date.now().toString(36);
  const paperHash = paperId.substring(0, 8);
  return `${timestamp}-${paperHash}-${sequenceNumber}`;
}