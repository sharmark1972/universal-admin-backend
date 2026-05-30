import { countTableColumns, isWideTable } from './table-analyzer';

export interface SectionAnalysis {
  heading: string;
  contentLength: number;
  hasTable: boolean;
  tableColumns?: number;
  hasImage: boolean;
  isFullWidth: boolean;
}

const FULL_WIDTH_HEADINGS = [
  'Abstract',
  'References',
  'Bibliography',
  'Conclusion',
  'Conclusions',
  'Acknowledgements',
  'Acknowledgments',
  'Appendix',
];

export function analyzeSectionLayout(
  heading: string,
  htmlContent: string
): boolean {
  // Rule 1: Check if heading matches full-width list
  if (FULL_WIDTH_HEADINGS.some((fw) => heading.toLowerCase().includes(fw.toLowerCase()))) {
    return true;
  }

  // Rule 2: Content longer than 2000 characters → full width
  if (htmlContent.length > 2000) {
    return true;
  }

  // Rule 3: Has images → full width
  if (/<img/i.test(htmlContent)) {
    return true;
  }

  // Rule 4: Has wide table (4+ columns) → full width
  if (/<table/i.test(htmlContent)) {
    const tableHtml = extractTableHtml(htmlContent);
    if (tableHtml && isWideTable(tableHtml)) {
      return true;
    }
  }

  // Rule 5: Has multiple tables → full width
  const tableCount = (htmlContent.match(/<table/gi) || []).length;
  if (tableCount > 1) {
    return true;
  }

  // Default: 2-column
  return false;
}

function extractTableHtml(htmlContent: string): string | null {
  const tableMatch = htmlContent.match(/<table[^>]*>[\s\S]*?<\/table>/i);
  return tableMatch ? tableMatch[0] : null;
}

export function analyzeSection(
  heading: string,
  htmlContent: string
): SectionAnalysis {
  const hasTable = /<table/i.test(htmlContent);
  const hasImage = /<img/i.test(htmlContent);
  const isFullWidth = analyzeSectionLayout(heading, htmlContent);

  let tableColumns: number | undefined;
  if (hasTable) {
    const tableHtml = extractTableHtml(htmlContent);
    if (tableHtml) {
      tableColumns = countTableColumns(tableHtml);
    }
  }

  return {
    heading,
    contentLength: htmlContent.length,
    hasTable,
    tableColumns,
    hasImage,
    isFullWidth,
  };
}
