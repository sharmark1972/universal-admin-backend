/**
 * Professional Academic PDF Generator - Scopus Quality Standard
 * 
 * This module generates high-quality academic papers matching international standards
 * such as Scopus, IEEE, and ACM formatting guidelines.
 * 
 * KEY FEATURES:
 * ✓ Full text justification with intelligent word spacing
 * ✓ Professional typography with Times New Roman font family
 * ✓ Consistent line heights and paragraph spacing
 * ✓ Professional headers with volume/issue information
 * ✓ Elegant footers with copyright and journal metadata
 * ✓ Section headings with accent underlines
 * ✓ Proper margins and page breaks
 * ✓ Compressed PDF output for smaller file sizes
 * ✓ Title page with journal branding
 * ✓ Abstract and keywords sections
 * ✓ DOI and publication metadata
 * ✓ Multi-page support with consistent formatting
 * 
 * FORMATTING STANDARDS:
 * - Page Size: A4 (210mm x 297mm)
 * - Margins: 20mm all sides
 * - Body Text: 10pt Times New Roman, justified
 * - Line Height: 4.5mm (professional spacing)
 * - Section Headings: 11pt Times Bold with accent underline
 * - Title: 16pt Times Bold, centered
 * - Abstract: 9.5pt Times, justified
 * 
 * USAGE:
 * const pdfBuffer = await generateScopusPDF({
 *   title: "Article Title",
 *   abstract: "Abstract text...",
 *   authors: [{ name: "Author Name", email: "email@example.com", isCorresponding: true }],
 *   keywords: ["keyword1", "keyword2"],
 *   category: "Computer Science",
 *   introduction: "Introduction text...",
 *   methodology: "Methodology text...",
 *   // ... other sections
 * });
 * 
 * @module generateScopusPDF
 * @version 2.0.0 - Professional Academic Standard
 */

import jsPDF from 'jspdf';

interface Author {
  name: string;
  email?: string;
  isCorresponding?: boolean;
}

interface Issue {
  volume?: string;
  issueNumber?: string;
  year?: number;
  publishDate?: string;
}

interface PaperData {
  title: string;
  abstract: string;
  authors: Author[];
  keywords: string[];
  category: string;
  paperType?: 'REVIEW' | 'IMPLEMENTATION';
  issue?: Issue;
  doi?: string;
  content?: string;
  introduction?: string;
  literatureReview?: string;
  methodology?: string;
  results?: string;
  discussion?: string;
  conclusion?: string;
  references?: string;
}

/**
 * Clean markdown formatting from text
 * Removes ** (bold), ### (headings), and other markdown syntax
 */
function cleanMarkdown(text: string): string {
  if (!text) return '';
  
  let cleaned = text;
  
  // Remove ### ** patterns (heading with bold)
  cleaned = cleaned.replace(/###\s*\*\*/g, '');
  
  // Remove ## ** patterns
  cleaned = cleaned.replace(/##\s*\*\*/g, '');
  
  // Remove # ** patterns
  cleaned = cleaned.replace(/#\s*\*\*/g, '');
  
  // Remove ### at start of lines (heading markers)
  cleaned = cleaned.replace(/^###\s+/gm, '');
  cleaned = cleaned.replace(/^##\s+/gm, '');
  cleaned = cleaned.replace(/^#\s+/gm, '');
  
  // Remove ** (bold markers) but keep the text - handle multiple on same line
  cleaned = cleaned.replace(/\*\*([^*]+?)\*\*/g, '$1');
  
  // Remove remaining single ** 
  cleaned = cleaned.replace(/\*\*/g, '');
  
  // Remove * (italic markers) but keep the text
  cleaned = cleaned.replace(/\*([^*]+?)\*/g, '$1');
  
  // Remove __ (bold markers) but keep the text
  cleaned = cleaned.replace(/__([^_]+?)__/g, '$1');
  
  // Remove _ (italic markers) but keep the text
  cleaned = cleaned.replace(/_([^_]+?)_/g, '$1');
  
  // Remove remaining underscores that are formatting
  cleaned = cleaned.replace(/_{2,}/g, '');
  
  // Clean up multiple spaces (but preserve single line breaks)
  cleaned = cleaned.replace(/ {2,}/g, ' ');
  
  // Trim each line but preserve paragraph breaks
  cleaned = cleaned.split('\n').map(line => line.trim()).filter(line => line.length > 0 || line === '').join('\n');
  
  return cleaned.trim();
}

/**
 * Render references with each reference on its own line
 * Handles proper spacing and formatting for bibliography
 */
function addReferences(
  pdf: jsPDF,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  pageHeight: number,
  pageWidth: number,
  issue: Issue | undefined,
  pageCountRef: { count: number }
): number {
  if (!text || text.trim() === '') return 0;

  const cleanedText = cleanMarkdown(text);
  let currentYPos = y;
  
  // Split by common reference patterns
  // Pattern 1: Number at start like "1. Author" or "[1] Author"
  // Pattern 2: Author at start like "Author, A. (Year)"
  // Pattern 3: New lines that look like start of references
  
  let references: string[] = [];
  
  // Try to split by numbered patterns first
  if (cleanedText.match(/^\d+\.\s|^\[\d+\]/m)) {
    // Has numbered references
    references = cleanedText.split(/(?=^\d+\.\s|^\[\d+\])/m)
      .map(ref => ref.trim())
      .filter(ref => ref.length > 0);
  } else if (cleanedText.includes('\n\n')) {
    // Split by double line breaks
    references = cleanedText.split(/\n\n+/)
      .map(ref => ref.replace(/\n/g, ' ').trim())
      .filter(ref => ref.length > 0);
  } else if (cleanedText.split('\n').length > 3) {
    // Split by single line breaks if we have multiple lines
    references = cleanedText.split(/\n/)
      .map(ref => ref.trim())
      .filter(ref => ref.length > 20); // Filter out very short lines
  } else {
    // Treat as single block
    references = [cleanedText];
  }
  
  // Render each reference
  for (const reference of references) {
    if (!reference.trim()) continue;
    
    const words = reference.replace(/\s+/g, ' ').trim().split(' ');
    let line = '';
    const lines: string[] = [];

    // Split reference into lines that fit width
    for (const word of words) {
      const testLine = line + (line ? ' ' : '') + word;
      const testWidth = pdf.getTextWidth(testLine);

      if (testWidth > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = testLine;
      }
    }
    if (line) {
      lines.push(line);
    }

    // Render lines for this reference
    for (let i = 0; i < lines.length; i++) {
      const lineText = lines[i].trim();

      // Check for page break
      if (currentYPos + lineHeight > pageHeight - 25) {
        pdf.addPage();
        currentYPos = 35;
        // Add header
        pdf.setFillColor(240, 240, 240);
        pdf.rect(0, 0, pageWidth, 15, 'F');
        pdf.setFontSize(8);
        pdf.setFont('times', 'normal');
        pdf.setTextColor(100, 100, 100);
        pdf.text('IJRCAM', 20, 8);
        if (issue?.volume && issue?.issueNumber) {
          const headerText = `Vol. ${issue.volume}, Issue ${issue.issueNumber}, ${issue.year || ''}`;
          pdf.text(headerText, pageWidth / 2, 8, { align: 'center' });
        }
        pageCountRef.count++;
        pdf.text(`Page ${pageCountRef.count}`, pageWidth - 20, 8, { align: 'right' });
        pdf.setDrawColor(200, 200, 200);
        pdf.setLineWidth(0.5);
        pdf.line(20, 12, pageWidth - 20, 12);
      }

      pdf.text(lineText, x, currentYPos);
      currentYPos += lineHeight;
    }
    
    // Add small spacing between references
    currentYPos += 2;
  }

  return currentYPos - y;
}

// Journal Configuration
const JOURNAL_NAME = 'International Journal of Research in Computer Application & Management';
const JOURNAL_SHORT_NAME = 'IJRCAM';
const ISSN_PRINT = '2455-0116';
const ISSN_ONLINE = '2395-6410';
const WEBSITE = 'www.ijrcam.com';

// Typography Constants (matching Scopus standards)
const FONTS = {
  TITLE: { size: 16, family: 'times', style: 'bold' },
  AUTHOR: { size: 11, family: 'times', style: 'italic' },
  SECTION_HEADING: { size: 11, family: 'times', style: 'bold' },
  BODY: { size: 10, family: 'times', style: 'normal' },
  ABSTRACT: { size: 9.5, family: 'times', style: 'normal' },
  KEYWORDS: { size: 9, family: 'times', style: 'italic' },
  HEADER: { size: 8, family: 'times', style: 'normal' },
  FOOTER: { size: 7.5, family: 'times', style: 'normal' },
  REFERENCES: { size: 9, family: 'times', style: 'normal' }
};

// Spacing Constants
const SPACING = {
  LINE_HEIGHT_BODY: 4.5,
  LINE_HEIGHT_ABSTRACT: 4,
  LINE_HEIGHT_TITLE: 7,
  PARAGRAPH_SPACING: 6,
  SECTION_SPACING: 10,
  MARGIN_TOP: 20,
  MARGIN_BOTTOM: 20,
  MARGIN_LEFT: 20,
  MARGIN_RIGHT: 20,
  COLUMN_GAP: 10
};

// Color Palette (using tuples for TypeScript compatibility)
const COLORS = {
  PRIMARY_TEXT: [0, 0, 0] as [number, number, number],
  SECONDARY_TEXT: [60, 60, 60] as [number, number, number],
  LIGHT_GRAY: [150, 150, 150] as [number, number, number],
  DIVIDER: [200, 200, 200] as [number, number, number],
  HEADER_BG: [240, 242, 245] as [number, number, number],
  ACCENT: [41, 98, 255] as [number, number, number]
};

export async function generateScopusPDF(data: PaperData): Promise<Buffer> {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
    compress: true
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const contentWidth = pageWidth - SPACING.MARGIN_LEFT - SPACING.MARGIN_RIGHT;

  // State management
  let currentY = SPACING.MARGIN_TOP;
  let pageCount = 1;

  // ========== HELPER FUNCTIONS ==========

  /**
   * Advanced justified text rendering with professional typography
   * Implements full justification with proper word spacing
   */
  const addJustifiedText = (
    text: string, 
    x: number, 
    y: number, 
    maxWidth: number, 
    lineHeight: number = SPACING.LINE_HEIGHT_BODY,
    justify: boolean = true
  ): number => {
    if (!text || text.trim() === '') return 0;

    // Clean markdown formatting before rendering
    const cleanedText = cleanMarkdown(text);
    const paragraphs = cleanedText.split('\n\n');
    let currentYPos = y;

    for (const paragraph of paragraphs) {
      if (!paragraph.trim()) continue;

      const words = paragraph.replace(/\s+/g, ' ').trim().split(' ');
      let line = '';
      const lines: string[] = [];

      // First pass: split text into lines
      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const testWidth = pdf.getTextWidth(testLine);

        if (testWidth > maxWidth && line) {
          lines.push(line);
          line = word;
        } else {
          line = testLine;
        }
      }
      if (line) {
        lines.push(line);
      }

      // Second pass: render with justification
      for (let i = 0; i < lines.length; i++) {
        const lineText = lines[i].trim();
        const isLastLine = i === lines.length - 1;

        // Check for page break
        if (currentYPos + lineHeight > pageHeight - SPACING.MARGIN_BOTTOM) {
          pdf.addPage();
          currentYPos = SPACING.MARGIN_TOP + 15;
          addHeader(pdf, pageWidth, data.issue, pageCount + 1);
          pageCount++;
        }

        if (!justify || isLastLine || lineText.split(' ').length < 3) {
          // Left-aligned (for last lines and short lines)
          pdf.text(lineText, x, currentYPos);
        } else {
          // Full justification
          const wordsInLine = lineText.split(' ');
          const lineWidthWithoutSpaces = wordsInLine.reduce((sum, word) => sum + pdf.getTextWidth(word), 0);
          const totalSpaceWidth = maxWidth - lineWidthWithoutSpaces;
          const spaceCount = wordsInLine.length - 1;
          
          if (spaceCount > 0 && totalSpaceWidth > 0) {
            const spaceWidth = totalSpaceWidth / spaceCount;
            let xPos = x;

            for (let j = 0; j < wordsInLine.length; j++) {
              pdf.text(wordsInLine[j], xPos, currentYPos);
              xPos += pdf.getTextWidth(wordsInLine[j]);
              if (j < wordsInLine.length - 1) {
                xPos += spaceWidth;
              }
            }
          } else {
            pdf.text(lineText, x, currentYPos);
          }
        }

        currentYPos += lineHeight;
      }

      // Add paragraph spacing
      currentYPos += SPACING.PARAGRAPH_SPACING;
    }

    return currentYPos - y;
  };

  /**
   * Check and handle page breaks
   */
  const checkPageBreak = (requiredSpace: number): void => {
    if (currentY + requiredSpace > pageHeight - SPACING.MARGIN_BOTTOM) {
      pdf.addPage();
      currentY = SPACING.MARGIN_TOP + 15;
      addHeader(pdf, pageWidth, data.issue, pageCount + 1);
      addFooter(pdf, pageWidth, pageHeight);
      pageCount++;
    }
  };

  /**
   * Set font with proper styling
   */
  const setFont = (fontConfig: { size: number; family: string; style: string }, color: [number, number, number] = COLORS.PRIMARY_TEXT): void => {
    pdf.setFontSize(fontConfig.size);
    pdf.setFont(fontConfig.family, fontConfig.style);
    pdf.setTextColor(color[0], color[1], color[2]);
  };

  /**
   * Professional header for all pages after title page
   */
  const addHeader = (doc: jsPDF, width: number, issue: Issue | undefined, page: number): void => {
    // Gray background bar
    doc.setFillColor(COLORS.HEADER_BG[0], COLORS.HEADER_BG[1], COLORS.HEADER_BG[2]);
    doc.rect(0, 0, width, 15, 'F');

    setFont(FONTS.HEADER, COLORS.SECONDARY_TEXT);

    // Left: Journal short name
    doc.text(JOURNAL_SHORT_NAME, SPACING.MARGIN_LEFT, 8);

    // Center: Volume and issue
    if (issue?.volume && issue?.issueNumber) {
      const headerText = `Vol. ${issue.volume}, Issue ${issue.issueNumber}, ${issue.year || ''}`;
      doc.text(headerText, width / 2, 8, { align: 'center' });
    }

    // Right: Page number
    doc.text(`Page ${page}`, width - SPACING.MARGIN_RIGHT, 8, { align: 'right' });

    // Divider line
    doc.setDrawColor(COLORS.DIVIDER[0], COLORS.DIVIDER[1], COLORS.DIVIDER[2]);
    doc.setLineWidth(0.5);
    doc.line(SPACING.MARGIN_LEFT, 12, width - SPACING.MARGIN_RIGHT, 12);
  };

  /**
   * Professional footer with journal information
   */
  const addFooter = (doc: jsPDF, width: number, height: number): void => {
    const footerY = height - 12;

    // Top divider line
    doc.setDrawColor(COLORS.DIVIDER[0], COLORS.DIVIDER[1], COLORS.DIVIDER[2]);
    doc.setLineWidth(0.3);
    doc.line(SPACING.MARGIN_LEFT, footerY - 3, width - SPACING.MARGIN_RIGHT, footerY - 3);

    setFont(FONTS.FOOTER, COLORS.LIGHT_GRAY);

    // Left: Copyright notice
    const year = data.issue?.year || new Date().getFullYear();
    doc.text(`© ${year} ${JOURNAL_SHORT_NAME}`, SPACING.MARGIN_LEFT, footerY);

    // Center: ISSN
    const issnText = `ISSN: ${ISSN_PRINT} (Print) | ${ISSN_ONLINE} (Online)`;
    doc.text(issnText, width / 2, footerY, { align: 'center' });

    // Right: Website
    doc.text(WEBSITE, width - SPACING.MARGIN_RIGHT, footerY, { align: 'right' });
  };

  /**
   * Add a professional section heading
   */
  const addSectionHeading = (title: string, numbered: boolean = true, number?: number): void => {
    checkPageBreak(25);

    setFont(FONTS.SECTION_HEADING, COLORS.PRIMARY_TEXT);
    
    const headingText = numbered && number ? `${number}. ${title.toUpperCase()}` : title.toUpperCase();
    
    // Add heading
    pdf.text(headingText, SPACING.MARGIN_LEFT, currentY);
    
    // Underline with accent color
    const textWidth = pdf.getTextWidth(headingText);
    pdf.setDrawColor(COLORS.ACCENT[0], COLORS.ACCENT[1], COLORS.ACCENT[2]);
    pdf.setLineWidth(0.8);
    pdf.line(SPACING.MARGIN_LEFT, currentY + 1.5, SPACING.MARGIN_LEFT + textWidth, currentY + 1.5);
    
    currentY += SPACING.SECTION_SPACING;
  };

  /**
   * Add a subsection heading (smaller, indented)
   */
  const addSubsectionHeading = (title: string): void => {
    checkPageBreak(20);

    setFont({ size: 10, family: 'times', style: 'bold' }, COLORS.PRIMARY_TEXT);
    
    // Add subsection heading (slightly indented)
    pdf.text(title, SPACING.MARGIN_LEFT, currentY);
    
    currentY += 6;
  };

  /**
   * Parse content for subsections (e.g., "1.1 Title. Content...")
   * Returns array of subsections with titles and content
   */
  const parseSubsections = (content: string): Array<{ title: string; content: string }> => {
    const subsections: Array<{ title: string; content: string }> = [];
    
    // Pattern to match subsection numbers like 1.1, 1.2, 2.1, etc.
    // Matches: "1.1 Title." or "1.1 Title.\n" - title ends at period
    const subsectionPattern = /(\d+\.\d+(?:\.\d+)?)\s+([^.\n]+?)\./g;
    
    let lastIndex = 0;
    let match;
    
    while ((match = subsectionPattern.exec(content)) !== null) {
      // Add any content before this subsection as part of previous subsection or main content
      if (lastIndex < match.index && subsections.length > 0) {
        const preContent = content.substring(lastIndex, match.index).trim();
        if (preContent) {
          subsections[subsections.length - 1].content += ' ' + preContent;
        }
      } else if (lastIndex < match.index) {
        // Content before first subsection
        const preContent = content.substring(lastIndex, match.index).trim();
        if (preContent) {
          subsections.push({ title: '', content: preContent });
        }
      }
      
      // Extract subsection number and title
      const subsectionNumber = match[1];
      const subsectionTitle = match[2].trim();
      
      // Start new subsection
      subsections.push({
        title: `${subsectionNumber} ${subsectionTitle}`,
        content: ''
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add remaining content to last subsection or as standalone
    if (lastIndex < content.length) {
      const remainingContent = content.substring(lastIndex).trim();
      if (remainingContent) {
        if (subsections.length > 0) {
          subsections[subsections.length - 1].content = remainingContent;
        } else {
          subsections.push({ title: '', content: remainingContent });
        }
      }
    }
    
    // If no subsections found, return the whole content
    if (subsections.length === 0) {
      subsections.push({ title: '', content: content.trim() });
    }
    
    return subsections;
  };

  // ========== TITLE PAGE GENERATION ==========
  
  // Top border accent
  pdf.setFillColor(COLORS.ACCENT[0], COLORS.ACCENT[1], COLORS.ACCENT[2]);
  pdf.rect(0, 0, pageWidth, 3, 'F');
  currentY += 5;

  // Journal name - Professional typography
  setFont({ size: 13, family: 'times', style: 'bold' }, COLORS.PRIMARY_TEXT);
  const journalLines = pdf.splitTextToSize(JOURNAL_NAME, contentWidth - 20);
  journalLines.forEach((line: string) => {
    pdf.text(line, pageWidth / 2, currentY, { align: 'center' });
    currentY += 5.5;
  });
  currentY += 2;

  // ISSN and website in elegant format
  setFont({ size: 9, family: 'times', style: 'normal' }, COLORS.SECONDARY_TEXT);
  pdf.text(`ISSN ${ISSN_PRINT} (Print) • ${ISSN_ONLINE} (Online)`, pageWidth / 2, currentY, { align: 'center' });
  currentY += 4;
  pdf.text(WEBSITE, pageWidth / 2, currentY, { align: 'center' });
  currentY += 8;

  // Elegant divider
  pdf.setDrawColor(COLORS.DIVIDER[0], COLORS.DIVIDER[1], COLORS.DIVIDER[2]);
  pdf.setLineWidth(0.5);
  pdf.line(SPACING.MARGIN_LEFT + 30, currentY, pageWidth - SPACING.MARGIN_RIGHT - 30, currentY);
  currentY += 10;

  // Volume and Issue - Prominent display
  if (data.issue?.volume && data.issue?.issueNumber) {
    setFont({ size: 10, family: 'times', style: 'bold' }, COLORS.ACCENT);
    const issueText = `Volume ${data.issue.volume} • Issue ${data.issue.issueNumber} • ${data.issue.year || new Date().getFullYear()}`;
    pdf.text(issueText, pageWidth / 2, currentY, { align: 'center' });
    currentY += 10;
  }

  // Article Type (if applicable)
  if (data.paperType) {
    const paperTypeText = data.paperType === 'REVIEW' ? 'REVIEW ARTICLE' : 'RESEARCH ARTICLE';
    setFont({ size: 9, family: 'times', style: 'italic' }, COLORS.SECONDARY_TEXT);
    pdf.text(paperTypeText, pageWidth / 2, currentY, { align: 'center' });
    currentY += 8;
  }

  // Article title - Bold, professional spacing
  setFont(FONTS.TITLE, COLORS.PRIMARY_TEXT);
  const titleLines = pdf.splitTextToSize(data.title, contentWidth - 40);
  titleLines.forEach((line: string, index: number) => {
    pdf.text(line, pageWidth / 2, currentY, { align: 'center' });
    currentY += index === titleLines.length - 1 ? SPACING.LINE_HEIGHT_TITLE + 5 : SPACING.LINE_HEIGHT_TITLE;
  });

  // Authors - Elegant formatting
  setFont(FONTS.AUTHOR, COLORS.SECONDARY_TEXT);
  const authorNames = data.authors
    .map(a => a.name || 'Author')
    .filter(n => n && n.trim())
    .join(', ') || 'Author(s)';
  
  const authorLines = pdf.splitTextToSize(authorNames, contentWidth - 40);
  authorLines.forEach((line: string) => {
    pdf.text(line, pageWidth / 2, currentY, { align: 'center' });
    currentY += 5;
  });
  currentY += 6;

  // Corresponding author email
  const correspondingAuthor = data.authors.find(a => a.isCorresponding);
  if (correspondingAuthor?.email) {
    setFont({ size: 9, family: 'times', style: 'italic' }, COLORS.SECONDARY_TEXT);
    pdf.text(`Corresponding author: ${correspondingAuthor.email}`, pageWidth / 2, currentY, { align: 'center' });
    currentY += 8;
  }

  // Divider before abstract
  pdf.setDrawColor(COLORS.DIVIDER[0], COLORS.DIVIDER[1], COLORS.DIVIDER[2]);
  pdf.line(SPACING.MARGIN_LEFT + 20, currentY, pageWidth - SPACING.MARGIN_RIGHT - 20, currentY);
  currentY += 10;

  // ABSTRACT section
  setFont({ size: 10, family: 'times', style: 'bold' }, COLORS.PRIMARY_TEXT);
  pdf.text('ABSTRACT', pageWidth / 2, currentY, { align: 'center' });
  currentY += 7;

  // Abstract content with proper justification
  setFont(FONTS.ABSTRACT, COLORS.PRIMARY_TEXT);
  const abstractHeight = addJustifiedText(
    data.abstract, 
    SPACING.MARGIN_LEFT + 5, 
    currentY, 
    contentWidth - 10, 
    SPACING.LINE_HEIGHT_ABSTRACT,
    true
  );
  currentY += abstractHeight + 8;

  // KEYWORDS section
  setFont({ size: 9.5, family: 'times', style: 'bold' }, COLORS.PRIMARY_TEXT);
  pdf.text('Keywords:', SPACING.MARGIN_LEFT + 5, currentY);
  currentY += 5;

  setFont(FONTS.KEYWORDS, COLORS.SECONDARY_TEXT);
  const keywordsText = data.keywords.join('; ');
  const keywordsHeight = addJustifiedText(
    keywordsText, 
    SPACING.MARGIN_LEFT + 5, 
    currentY, 
    contentWidth - 10, 
    4,
    false
  );
  currentY += keywordsHeight + 6;

  // Publication metadata
  const metadataY = currentY + 5;
  setFont({ size: 9, family: 'times', style: 'normal' }, COLORS.SECONDARY_TEXT);
  
  const metadata: string[] = [];
  
  if (data.issue?.publishDate) {
    const publishDate = new Date(data.issue.publishDate);
    metadata.push(`Published: ${publishDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`);
  }
  
  if (data.doi) {
    metadata.push(`DOI: ${data.doi}`);
  }
  
  metadata.forEach((line, index) => {
    pdf.text(line, pageWidth / 2, metadataY + (index * 4.5), { align: 'center' });
  });
  
  currentY = metadataY + (metadata.length * 4.5) + 8;

  // Bottom information box - professional styling
  const infoBoxY = pageHeight - 45;
  
  // Box with subtle shadow effect
  pdf.setFillColor(248, 249, 250);
  pdf.setDrawColor(COLORS.DIVIDER[0], COLORS.DIVIDER[1], COLORS.DIVIDER[2]);
  pdf.setLineWidth(0.3);
  pdf.roundedRect(SPACING.MARGIN_LEFT, infoBoxY, contentWidth, 25, 2, 2, 'FD');
  
  setFont({ size: 7.5, family: 'times', style: 'normal' }, COLORS.SECONDARY_TEXT);
  
  let infoY = infoBoxY + 6;
  const infoLines = [
    JOURNAL_NAME,
    `ISSN ${ISSN_PRINT} (Print) | ISSN ${ISSN_ONLINE} (Online)`,
    `Website: ${WEBSITE} | Email: editor@ijrcam.com`
  ];
  
  if (data.issue?.volume) {
    infoLines.push(`Volume ${data.issue.volume}, Issue ${data.issue.issueNumber}, ${data.issue.year || ''}`);
  }
  
  infoLines.forEach(line => {
    pdf.text(line, pageWidth / 2, infoY, { align: 'center' });
    infoY += 4;
  });

  // Footer for title page
  addFooter(pdf, pageWidth, pageHeight);

  // ========== CONTENT PAGES ==========
  
  // Start fresh page for main content
  pdf.addPage();
  pageCount++;
  currentY = SPACING.MARGIN_TOP + 15;
  addHeader(pdf, pageWidth, data.issue, pageCount);

  // Author affiliations section (professional format)
  if (data.authors && data.authors.length > 0) {
    setFont({ size: 10, family: 'times', style: 'bold' }, COLORS.PRIMARY_TEXT);
    pdf.text('Authors:', SPACING.MARGIN_LEFT, currentY);
    currentY += 6;

    setFont({ size: 9.5, family: 'times', style: 'normal' }, COLORS.SECONDARY_TEXT);
    const authorsText = data.authors
      .map((a, idx) => `${idx + 1}. ${a.name || 'Author'}${a.email ? ' (' + a.email + ')' : ''}`)
      .join('; ');
    
    const authorsHeight = addJustifiedText(
      authorsText, 
      SPACING.MARGIN_LEFT, 
      currentY, 
      contentWidth, 
      4,
      false
    );
    currentY += authorsHeight + SPACING.SECTION_SPACING;
  }

  // Add horizontal divider
  pdf.setDrawColor(COLORS.DIVIDER[0], COLORS.DIVIDER[1], COLORS.DIVIDER[2]);
  pdf.setLineWidth(0.3);
  pdf.line(SPACING.MARGIN_LEFT, currentY, pageWidth - SPACING.MARGIN_RIGHT, currentY);
  currentY += 8;

  // Main content sections
  const sections = buildSections(data);
  let sectionNumber = 1;

  if (sections.length > 0) {
    for (const section of sections) {
      // Determine if section should be numbered
      const unnumberedSections = ['abstract', 'keywords', 'references', 'acknowledgments', 'acknowledgements'];
      const isUnnumbered = unnumberedSections.includes(section.title.toLowerCase());

      if (isUnnumbered) {
        addSectionHeading(section.title, false);
      } else {
        addSectionHeading(section.title, true, sectionNumber);
        sectionNumber++;
      }

      // Section content with professional typography
      setFont(FONTS.BODY, COLORS.PRIMARY_TEXT);
      
      // Special formatting for references
      if (section.title.toLowerCase() === 'references') {
        setFont(FONTS.REFERENCES, COLORS.PRIMARY_TEXT);
        
        // Use special reference formatting
        const refHeight = addReferences(
          pdf,
          section.content,
          SPACING.MARGIN_LEFT,
          currentY,
          contentWidth,
          SPACING.LINE_HEIGHT_BODY - 0.5,
          pageHeight,
          pageWidth,
          data.issue,
          { count: pageCount }
        );
        currentY += refHeight;
      } else {
        // Parse content for subsections
        const subsections = parseSubsections(section.content);
        
        // Debug logging
        if (subsections.length > 1 || (subsections.length === 1 && subsections[0].title)) {
          console.log(`[PDF] Found ${subsections.length} subsections in "${section.title}":`, 
            subsections.map(s => s.title || '(no title)'));
        }
        
        for (const subsection of subsections) {
          // Add subsection heading if it exists
          if (subsection.title) {
            addSubsectionHeading(subsection.title);
          }
          
          // Add subsection content
          if (subsection.content) {
            const contentHeight = addJustifiedText(
              subsection.content, 
              SPACING.MARGIN_LEFT, 
              currentY, 
              contentWidth, 
              SPACING.LINE_HEIGHT_BODY,
              true
            );
            currentY += contentHeight;
            
            // Add spacing between subsections
            if (subsection.title) {
              currentY += 4;
            }
          }
        }
      }

      currentY += SPACING.SECTION_SPACING;
    }
  } else {
    // Default content structure if no sections provided
    const defaultSections = [
      { 
        title: 'Introduction', 
        content: `This research paper presents a comprehensive study in the field of ${data.category}. The study employs rigorous methodology to investigate key aspects and contribute meaningful insights to the academic community. Through systematic analysis and evidence-based approaches, this work addresses significant research questions and provides valuable contributions to existing knowledge in the domain.` 
      },
      { 
        title: 'Literature Review', 
        content: 'The literature review examines existing research and theoretical frameworks relevant to this study. Previous studies have established foundational knowledge in this area, highlighting both achievements and gaps in current understanding. This review synthesizes key findings from seminal works and recent publications, providing context for the current research and identifying opportunities for further investigation.' 
      },
      { 
        title: 'Methodology', 
        content: 'This study employs a systematic research methodology designed to ensure validity, reliability, and reproducibility of findings. The research design incorporates established academic practices and adheres to ethical guidelines. Data collection methods are carefully selected to address the research objectives, while analytical techniques are chosen to provide robust and meaningful results. Quality assurance measures are implemented throughout the research process.' 
      },
      { 
        title: 'Results and Analysis', 
        content: 'The research findings demonstrate significant outcomes that contribute to understanding the subject matter. Statistical analysis reveals important patterns, relationships, and insights. Results are presented systematically, with careful interpretation of data and consideration of potential implications. The findings address the research questions and provide empirical evidence supporting the study\'s conclusions.' 
      },
      { 
        title: 'Discussion', 
        content: 'The discussion interprets findings within the broader context of existing literature and theoretical frameworks. Results are critically analyzed, with consideration of their significance, limitations, and implications. Comparisons with previous research highlight both consistencies and novel contributions. The discussion also addresses potential applications and recommends directions for future research.' 
      },
      { 
        title: 'Conclusion', 
        content: 'This study concludes with a synthesis of key findings and their significance to the field. The research has successfully addressed its objectives and contributed valuable knowledge to the academic community. While certain limitations are acknowledged, the findings provide a solid foundation for future investigations. The study\'s implications extend to both theoretical understanding and practical applications in the field.' 
      }
    ];

    for (const section of defaultSections) {
      addSectionHeading(section.title, true, sectionNumber);
      sectionNumber++;

      setFont(FONTS.BODY, COLORS.PRIMARY_TEXT);
      const contentHeight = addJustifiedText(
        section.content, 
        SPACING.MARGIN_LEFT, 
        currentY, 
        contentWidth, 
        SPACING.LINE_HEIGHT_BODY,
        true
      );
      currentY += contentHeight + SPACING.SECTION_SPACING;
    }
  }

  // Add footer to final page
  addFooter(pdf, pageWidth, pageHeight);

  // Return PDF as buffer
  return Buffer.from(pdf.output('arraybuffer'));
}

/**
 * Build structured sections from paper data
 * Handles both new structured format and legacy content strings
 */
function buildSections(data: PaperData): Array<{ title: string; content: string }> {
  const sections: Array<{ title: string; content: string }> = [];
  
  // Process structured content fields
  const structuredSections = [
    { field: data.introduction, title: 'Introduction' },
    { field: data.literatureReview, title: 'Literature Review & Hypothesis Development' },
    { field: data.methodology, title: 'Methodology' },
    { field: data.results, title: 'Results' },
    { field: data.discussion, title: 'Discussion' },
    { field: data.conclusion, title: 'Conclusion' },
    { field: data.references, title: 'References' }
  ];

  for (const section of structuredSections) {
    if (section.field && section.field.trim()) {
      sections.push({ title: section.title, content: section.field.trim() });
    }
  }
  
  // Process legacy content field if present
  if (data.content && data.content.trim() && sections.length === 0) {
    const parsedSections = parseContentSections(data.content);
    sections.push(...parsedSections);
  }
  
  return sections;
}

/**
 * Parse legacy content string into structured sections
 * Handles various heading formats (numbered, all-caps, etc.)
 */
function parseContentSections(content: string): Array<{ title: string; content: string }> {
  const sections: Array<{ title: string; content: string }> = [];
  const lines = content.split('\n');
  let currentSection: { title: string; content: string } | null = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    // Skip empty lines
    if (!trimmedLine) continue;
    
    // Detect section headers (numbered or all-caps)
    const isNumberedHeader = /^\d+\.\s+[A-Z][A-Z\s]+$/.test(trimmedLine);
    const isAllCapsHeader = /^[A-Z][A-Z\s]{3,}$/.test(trimmedLine) && trimmedLine.length < 50;
    
    if (isNumberedHeader || isAllCapsHeader) {
      // Save previous section
      if (currentSection && currentSection.content.trim()) {
        sections.push({
          title: currentSection.title,
          content: currentSection.content.trim()
        });
      }
      
      // Start new section
      const cleanTitle = trimmedLine.replace(/^\d+\.\s+/, '');
      currentSection = { 
        title: cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1).toLowerCase(), 
        content: '' 
      };
    } else if (currentSection) {
      // Add content to current section
      currentSection.content += (currentSection.content ? '\n' : '') + trimmedLine;
    } else {
      // Content without a header - create generic introduction
      if (!currentSection) {
        currentSection = { title: 'Introduction', content: '' };
      }
      currentSection.content += (currentSection.content ? '\n' : '') + trimmedLine;
    }
  }
  
  // Save final section
  if (currentSection && currentSection.content.trim()) {
    sections.push({
      title: currentSection.title,
      content: currentSection.content.trim()
    });
  }
  
  // If no sections were parsed, treat entire content as introduction
  if (sections.length === 0 && content.trim()) {
    sections.push({ title: 'Introduction', content: content.trim() });
  }
  
  return sections;
}
