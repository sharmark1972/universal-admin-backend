/**
 * Crossref API integration for DOI registration and metadata management
 * Provides functions to register DOIs and submit metadata to Crossref
 */

import { formatCrossrefMetadata } from '@/utils/doiUtils';

export interface CrossrefCredentials {
  username: string;
  password: string;
  depositorName: string;
  depositorEmail: string;
  registrantName: string;
  registrantEmail: string;
}

export interface CrossrefRegistrationResult {
  success: boolean;
  doi?: string;
  message?: string;
  error?: string;
  submissionId?: string;
}

export interface CrossrefDepositData {
  doi: string;
  url: string;
  metadata: any;
}

/**
 * Default Crossref credentials (should be moved to environment variables)
 */
const DEFAULT_CREDENTIALS: CrossrefCredentials = {
  username: process.env.CROSSREF_USERNAME || '',
  password: process.env.CROSSREF_PASSWORD || '',
  depositorName: process.env.CROSSREF_DEPOSITOR_NAME || 'IJARCM',
  depositorEmail: process.env.CROSSREF_DEPOSITOR_EMAIL || 'editor@ijarcm.com',
  registrantName: process.env.CROSSREF_REGISTRANT_NAME || 'International Journal of Research in Computer Applications and Management',
  registrantEmail: process.env.CROSSREF_REGISTRANT_EMAIL || 'editor@ijrcam.com'
};

/**
 * Validates Crossref credentials
 */
export function validateCrossrefCredentials(credentials: CrossrefCredentials): boolean {
  return !!(credentials.username && credentials.password && 
           credentials.depositorName && credentials.depositorEmail &&
           credentials.registrantName && credentials.registrantEmail);
}

/**
 * Creates XML metadata for Crossref submission
 */
export function createCrossrefXML(depositData: CrossrefDepositData, credentials: CrossrefCredentials): string {
  const timestamp = new Date().toISOString();
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<doi_batch version="4.4.3" xmlns="http://www.crossref.org/schema/4.4.3" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.crossref.org/schema/4.4.3 http://www.crossref.org/schemas/crossref4.4.3.xsd">
  <head>
    <doi_batch_id>${depositData.doi}_${timestamp}</doi_batch_id>
    <timestamp>${timestamp}</timestamp>
    <depositor>
      <depositor_name>${escapeXML(credentials.depositorName)}</depositor_name>
      <depositor_email>${escapeXML(credentials.depositorEmail)}</depositor_email>
    </depositor>
    <registrant>
      <registrant_name>${escapeXML(credentials.registrantName)}</registrant_name>
      <registrant_email>${escapeXML(credentials.registrantEmail)}</registrant_email>
    </registrant>
  </head>
  <body>
    <journal>
      <journal_metadata language="en">
        <full_title>International Journal of Research in Computer Applications and Management</full_title>
        <abbrev_title>IJARCM</abbrev_title>
        <issn media_type="print">2455-0116</issn>
        <issn media_type="electronic">2395-6410</issn>
      </journal_metadata>
      <journal_issue>
        <publication_date media_type="online">
          ${depositData.metadata.published?.['date-parts'] ? 
            `<year>${depositData.metadata.published['date-parts'][0][0]}</year>
            <month>${depositData.metadata.published['date-parts'][0][1]}</month>
            <day>${depositData.metadata.published['date-parts'][0][2]}</day>` : 
            `<year>${new Date().getFullYear()}</year>
            <month>${new Date().getMonth() + 1}</month>
            <day>${new Date().getDate()}</day>`
          }
        </publication_date>
        <journal_volume>${depositData.metadata.volume || '1'}</journal_volume>
        <journal_issue>${depositData.metadata.issue || '1'}</journal_issue>
      </journal_issue>
      <journal_article publication_type="full_text">
        <titles>
          <title>${escapeXML(depositData.metadata.title)}</title>
        </titles>
        <contributors>
          ${depositData.metadata.authors?.map((author: any) => `
          <person_name sequence="true" contributor_role="author">
            <given_name>${escapeXML(author.given)}</given_name>
            <surname>${escapeXML(author.family)}</surname>
            ${author.affiliation ? author.affiliation.map((aff: any) => `
            <affiliation>
              <institution_name>${escapeXML(aff.name)}</institution_name>
            </affiliation>`).join('') : ''}
          </person_name>`).join('')}
        </contributors>
        <publication_date media_type="online">
          ${depositData.metadata.published?.['date-parts'] ? 
            `<year>${depositData.metadata.published['date-parts'][0][0]}</year>
            <month>${depositData.metadata.published['date-parts'][0][1]}</month>
            <day>${depositData.metadata.published['date-parts'][0][2]}</day>` : 
            `<year>${new Date().getFullYear()}</year>
            <month>${new Date().getMonth() + 1}</month>
            <day>${new Date().getDate()}</day>`
          }
        </publication_date>
        <pages>
          <first_page>${depositData.metadata.page?.split('-')[0] || '1'}</first_page>
          ${depositData.metadata.page?.split('-')[1] ? 
            `<last_page>${depositData.metadata.page.split('-')[1]}</last_page>` : ''}
        </pages>
        <doi_data>
          <doi>${depositData.doi}</doi>
          <resource>${escapeXML(depositData.url)}</resource>
        </doi_data>
        ${depositData.metadata.abstract ? `
        <abstract>
          ${escapeXML(depositData.metadata.abstract)}
        </abstract>` : ''}
        ${depositData.metadata.keywords?.length ? `
        <citation_list>
          ${depositData.metadata.keywords.map((keyword: string) => `
          <citation key="${keyword}">
            <unstructured_citation>${escapeXML(keyword)}</unstructured_citation>
          </citation>`).join('')}
        </citation_list>` : ''}
      </journal_article>
    </journal>
  </body>
</doi_batch>`;
}

/**
 * Escapes XML special characters
 */
function escapeXML(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/**
 * Submits DOI registration to Crossref
 */
export async function registerDOIWithCrossref(
  paper: any,
  credentials: CrossrefCredentials = DEFAULT_CREDENTIALS
): Promise<CrossrefRegistrationResult> {
  try {
    // Validate credentials
    if (!validateCrossrefCredentials(credentials)) {
      return {
        success: false,
        error: 'Invalid Crossref credentials. Please check your configuration.'
      };
    }

    // Format metadata
    const metadata = formatCrossrefMetadata(paper);
    if (!metadata.doi) {
      return {
        success: false,
        error: 'DOI is required for Crossref registration'
      };
    }

    // Create deposit data
    const depositData: CrossrefDepositData = {
      doi: metadata.doi,
      url: metadata.url,
      metadata
    };

    // Generate XML
    const xmlData = createCrossrefXML(depositData, credentials);

    // Submit to Crossref
    const response = await fetch('https://doi.crossref.org/servlet/deposit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/xml;charset=UTF-8',
        'Authorization': `Basic ${Buffer.from(`${credentials.username}:${credentials.password}`).toString('base64')}`
      },
      body: xmlData
    });

    const responseText = await response.text();

    if (!response.ok) {
      console.error('Crossref submission failed:', response.status, responseText);
      return {
        success: false,
        error: `Crossref submission failed: ${response.status} ${response.statusText}`,
        message: responseText
      };
    }

    // Parse response
    const submissionId = extractSubmissionId(responseText);
    
    return {
      success: true,
      doi: metadata.doi,
      message: 'DOI submitted to Crossref successfully',
      submissionId
    };

  } catch (error) {
    console.error('Error registering DOI with Crossref:', error);
    return {
      success: false,
      error: 'Failed to register DOI with Crossref'
    };
  }
}

/**
 * Extracts submission ID from Crossref response
 */
function extractSubmissionId(responseText: string): string | undefined {
  const match = responseText.match(/<submission_id>([^<]+)<\/submission_id>/);
  return match ? match[1] : undefined;
}

/**
 * Checks DOI registration status with Crossref
 */
export async function checkDOIStatus(doi: string): Promise<{
  registered: boolean;
  metadata?: any;
  error?: string;
}> {
  try {
    const response = await fetch(`https://api.crossref.org/works/${encodeURIComponent(doi)}`);
    
    if (!response.ok) {
      return {
        registered: false,
        error: `DOI not found: ${response.status}`
      };
    }

    const data = await response.json();
    
    return {
      registered: true,
      metadata: data.message || data
    };

  } catch (error) {
    console.error('Error checking DOI status:', error);
    return {
      registered: false,
      error: 'Failed to check DOI status'
    };
  }
}

/**
 * Resolves DOI to get target URL
 */
export async function resolveDOI(doi: string): Promise<{
  url?: string;
  error?: string;
}> {
  try {
    const response = await fetch(`https://doi.org/${encodeURIComponent(doi)}`, {
      method: 'HEAD',
      redirect: 'manual'
    });

    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('location');
      return { url: location || undefined };
    }

    return {
      error: `DOI resolution failed: ${response.status}`
    };

  } catch (error) {
    console.error('Error resolving DOI:', error);
    return {
      error: 'Failed to resolve DOI'
    };
  }
}

/**
 * Validates DOI format for Crossref submission
 */
export function validateDOIForCrossref(doi: string): {
  isValid: boolean;
  error?: string;
} {
  if (!doi) {
    return {
      isValid: false,
      error: 'DOI is required'
    };
  }

  // Check if DOI starts with registered prefix
  const prefix = doi.split('/')[0];
  if (!prefix.startsWith('10.')) {
    return {
      isValid: false,
      error: 'DOI must start with registered prefix (10.xxxx)'
    };
  }

  // Check suffix length
  const suffix = doi.split('/')[1];
  if (!suffix || suffix.length < 1) {
    return {
      isValid: false,
      error: 'DOI suffix is required'
    };
  }

  return {
    isValid: true
  };
}

/**
 * Generates test DOI for development
 */
export function generateTestDOI(paperId: string): string {
  return `10.12345/test-${paperId}-${Date.now()}`;
}