import { ResearchPaperStatus, PrismaClient } from '@prisma/client';
import { prisma as defaultPrisma } from '@/lib/prisma';
import {
  extractStructuredDataFromDocx,
} from './docx-extractor';
import type { ExtractedStructuredData } from './docx-extractor';
import { tryGeminiOnly, tryZaiOnly } from './gemini-extractor';
import {
  removeStoredResearchPaperFile,
  validateResearchPaperFile,
} from './storage';
import { validateDraftUpdate, validatePublishReady } from './validation';
import type { ResearchPaperDraftUpdateInput } from './types';

const includeDraftRelations = {
  authors: { orderBy: { authorOrder: 'asc' as const } },
  sections: { orderBy: { sectionOrder: 'asc' as const } },
  issue: {
    select: {
      id: true,
      title: true,
      volume: true,
      issueNumber: true,
      year: true,
      publishDate: true,
      isPublished: true,
    },
  },
};

const includePaperRelations = {
  paperAuthors: {
    include: {
      user: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          institution: true,
        },
      },
    },
    orderBy: { authorOrder: 'asc' as const },
  },
  sections: { orderBy: { sectionOrder: 'asc' as const } },
  issue: {
    select: {
      id: true,
      title: true,
      volume: true,
      issueNumber: true,
      year: true,
      publishDate: true,
      isPublished: true,
    },
  },
} as const;

export type ExtractionStep = 'gemini' | 'zai' | 'basic';

export type ExtractionMode = 'auto' | 'gemini' | 'zai' | 'basic';

function resolvePrismaClient(prismaClient?: PrismaClient) {
  return prismaClient ?? defaultPrisma;
}

function normalizeKeywords(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(String).map((item) => item.trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function paperStatusIsValid(status: unknown): status is 'SUBMITTED' | 'UNDER_REVIEW' | 'REVISION_REQUIRED' | 'ACCEPTED' | 'PUBLISHED' | 'REJECTED' {
  return typeof status === 'string' && ['SUBMITTED', 'UNDER_REVIEW', 'REVISION_REQUIRED', 'ACCEPTED', 'PUBLISHED', 'REJECTED'].includes(status);
}

function mapPaperAuthors(paperAuthors: Array<{
  authorOrder: number;
  isCorresponding: boolean;
  user: { firstName: string; lastName: string; email: string | null; institution: string | null };
}>) {
  return paperAuthors.map((author, index) => ({
    id: `${author.authorOrder}-${index}`,
    name: `${author.user.firstName} ${author.user.lastName}`.trim(),
    email: author.user.email || '',
    affiliation: author.user.institution || '',
    isCorresponding: Boolean(author.isCorresponding),
    authorOrder: author.authorOrder,
  }));
}

function mapPaperSections(sections: Array<{
  id: string;
  heading: string;
  content: string;
  sectionOrder: number;
  isFullWidth: boolean;
}>) {
  return sections.map((section) => ({
    id: section.id,
    heading: section.heading,
    content: section.content,
    sectionOrder: section.sectionOrder,
    isFullWidth: section.isFullWidth,
  }));
}

export function mapPaperToLegacyResearchPaper(paper: any) {
  if (!paper) return null;

  return {
    id: paper.id,
    title: paper.title,
    shortTitle: null,
    abstract: paper.abstract,
    keywords: normalizeKeywords(paper.keywords),
    doi: paper.doi,
    sourceFilePath: paper.sourceFilePath,
    sourceFileName: paper.sourceFileName,
    sourceFileSize: paper.sourceFileSize,
    extractedText: null,
    pdfPath: paper.filePath,
    previewPdfPath: null,
    status: paper.status,
    issueId: paper.issueId,
    createdBy: paper.submitterId,
    publishedAt: paper.publishedAt,
    createdAt: paper.submittedAt,
    updatedAt: paper.submittedAt,
    bodyColumnMode: normalizeBodyColumnMode(paper.bodyColumnMode),
    authors: mapPaperAuthors(paper.paperAuthors || []),
    sections: mapPaperSections(paper.sections || []),
    issue: paper.issue,
  };
}

async function loadCanonicalPaper(id: string, prismaClient?: PrismaClient) {
  const prisma = resolvePrismaClient(prismaClient);
  return prisma.paper.findUnique({
    where: { id },
    include: includePaperRelations,
  });
}

async function deletePaperDependencies(prisma: any, paperId: string) {
  await Promise.all([
    prisma.review.deleteMany({ where: { paperId } }),
    prisma.reviewAssignment.deleteMany({ where: { paperId } }),
    prisma.download.deleteMany({ where: { paperId } }),
    prisma.bookmark.deleteMany({ where: { paperId } }),
    prisma.citation.deleteMany({ where: { paperId } }),
    prisma.plagiarismCheck.deleteMany({ where: { paperId } }),
    prisma.archivePaper.deleteMany({ where: { paperId } }),
    prisma.paperAuthor.deleteMany({ where: { paperId } }),
    prisma.paperSection.deleteMany({ where: { paperId } }),
    prisma.paperContent.deleteMany({ where: { paperId } }),
    prisma.certificate.deleteMany({ where: { paperId } }),
  ]);
}

export async function extractResearchPaperFromUpload(
  file: File,
  onStep: (step: ExtractionStep) => void,
  extractionMode: ExtractionMode = 'auto',
) {
  const fileBuffer = Buffer.from(await file.arrayBuffer());
  const extension = validateResearchPaperFile(file);
  const structured = await extractStructuredDataFromDocx(fileBuffer, extension);
  const plainText = structured.rawHtml
    ? structured.rawHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    : '';

  const { aiResult, usedStep } = await runAiExtraction(plainText, onStep, extractionMode);

  const title = aiResult?.title || structured.title;
  const abstract = aiResult?.abstract || structured.abstract;
  const keywords = aiResult?.keywords?.length ? aiResult.keywords : structured.keywords;
  const affiliation = aiResult?.affiliation || structured.affiliation;
  const authors = aiResult?.authors?.length
    ? aiResult.authors.map((a) => ({
        name: a.name,
        email: aiResult?.email || undefined,
        affiliation: affiliation || undefined,
        isCorresponding: a.isCorresponding,
      }))
    : structured.authors;

  const sanitizedKeywords = keywords.filter((k) => typeof k === 'string');
  const sectionsForDraft = structured.sections.map((section, index) => ({
    heading: section.heading ? section.heading.trim() : 'Untitled Section',
    content: section.content ? section.content.trim() : '',
    sectionOrder: index,
    isFullWidth: true,
  }));

  return {
    extractedData: {
      title: title ? title.trim() : '',
      abstract: abstract ? abstract.trim() : '',
      keywords: sanitizedKeywords,
      authors: authors.map((author, index) => ({
        name: author.name.trim(),
        email: author.email ? author.email.trim() : '',
        affiliation: author.affiliation ? author.affiliation.trim() : '',
        isCorresponding: Boolean(author.isCorresponding),
        authorOrder: index,
      })),
      sections: sectionsForDraft,
      sourceFileName: file.name,
      sourceFileSize: file.size,
    },
    extractionMethod: usedStep,
  };
}

export async function enhanceExtractedResearchPaperData(
  structured: ExtractedStructuredData,
  sourceFileName: string,
  sourceFileSize: number,
  onStep: (step: ExtractionStep) => void,
  extractionMode: ExtractionMode = 'auto',
) {
  const plainText = structured.rawHtml
    ? structured.rawHtml.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    : '';

  const { aiResult, usedStep } = await runAiExtraction(plainText, onStep, extractionMode);

  const title = aiResult?.title || structured.title;
  const abstract = aiResult?.abstract || structured.abstract;
  const keywords = aiResult?.keywords?.length ? aiResult.keywords : structured.keywords;
  const affiliation = aiResult?.affiliation || structured.affiliation;
  const authors = aiResult?.authors?.length
    ? aiResult.authors.map((a) => ({
        name: a.name,
        email: aiResult?.email || undefined,
        affiliation: affiliation || undefined,
        isCorresponding: a.isCorresponding,
      }))
    : structured.authors;

  const sanitizedKeywords = keywords.filter((k) => typeof k === 'string');

  const sectionsForDraft = structured.sections.map((section, index) => ({
    heading: section.heading ? section.heading.trim() : 'Untitled Section',
    content: section.content ? section.content.trim() : '',
    sectionOrder: index,
    isFullWidth: true,
  }));

  return {
    extractedData: {
      title: title ? title.trim() : '',
      abstract: abstract ? abstract.trim() : '',
      keywords: sanitizedKeywords,
      authors: authors.map((author, index) => ({
        name: author.name.trim(),
        email: author.email ? author.email.trim() : '',
        affiliation: author.affiliation ? author.affiliation.trim() : '',
        isCorresponding: Boolean(author.isCorresponding),
        authorOrder: index,
      })),
      sections: sectionsForDraft,
      sourceFileName,
      sourceFileSize,
    },
    extractionMethod: usedStep,
  };
}

async function runAiExtraction(
  plainText: string,
  onStep: (step: ExtractionStep) => void,
  extractionMode: ExtractionMode,
) {
  type AiResult = Awaited<ReturnType<typeof tryGeminiOnly>>;
  let aiResult: AiResult = null;
  let usedStep: ExtractionStep = 'basic';

  if (extractionMode === 'basic') {
    onStep('basic');
    return { aiResult, usedStep };
  }

  if (extractionMode === 'gemini') {
    onStep('gemini');
    aiResult = await tryGeminiOnly(plainText);
    usedStep = aiResult ? 'gemini' : 'basic';
    if (!aiResult) onStep('basic');
    return { aiResult, usedStep };
  }

  if (extractionMode === 'zai') {
    onStep('zai');
    aiResult = await tryZaiOnly(plainText);
    usedStep = aiResult ? 'zai' : 'basic';
    if (!aiResult) onStep('basic');
    return { aiResult, usedStep };
  }

  onStep('gemini');
  aiResult = await tryGeminiOnly(plainText);
  usedStep = aiResult ? 'gemini' : 'basic';

  if (!aiResult) {
    onStep('zai');
    aiResult = await tryZaiOnly(plainText);
    usedStep = aiResult ? 'zai' : 'basic';
  }

  if (!aiResult) onStep('basic');
  return { aiResult, usedStep };
}


export async function listResearchPapers(params: {
  page?: number;
  limit?: number;
  status?: ResearchPaperStatus | 'ALL';
  search?: string;
}, prismaClient?: PrismaClient) {
  const prisma = resolvePrismaClient(prismaClient);
  const page = Math.max(params.page || 1, 1);
  const limit = Math.min(Math.max(params.limit || 10, 1), 50);
  const where: any = {};

  if (params.status && params.status !== 'ALL') {
    if (paperStatusIsValid(params.status)) {
      where.status = params.status;
    }
  }

  if (params.search) {
    where.OR = [
      { title: { contains: params.search } },
      { abstract: { contains: params.search } },
      { sourceFileName: { contains: params.search } },
      { keywords: { contains: params.search } },
    ];
  }

  const [drafts, total] = await Promise.all([
    prisma.paper.findMany({
      where,
      include: includePaperRelations,
      orderBy: { submittedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.paper.count({ where }),
  ]);

  return {
    drafts: drafts.map(mapPaperToLegacyResearchPaper),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function getCanonicalResearchPaper(id: string, prismaClient?: PrismaClient) {
  const paper = await loadCanonicalPaper(id, prismaClient);
  return mapPaperToLegacyResearchPaper(paper);
}

export async function updateResearchPaper(
  id: string,
  input: ResearchPaperDraftUpdateInput,
  prismaClient?: PrismaClient,
) {
  const prisma = resolvePrismaClient(prismaClient);
  validateDraftUpdate(input);

  const existing = await loadCanonicalPaper(id, prisma);
  if (!existing) throw new Error('Research paper draft not found.');

  const bodyColumnMode = normalizeBodyColumnMode(input.bodyColumnMode);

  await prisma.$transaction(async (tx) => {
    await tx.paper.update({
      where: { id },
      data: {
        title: input.title === undefined ? undefined : input.title || null,
        abstract: input.abstract === undefined ? undefined : input.abstract || null,
        keywords: input.keywords === undefined ? undefined : input.keywords.join(', '),
        doi: input.doi === undefined ? undefined : input.doi || null,
        issueId: input.issueId === undefined ? undefined : input.issueId || null,
        bodyColumnMode: input.bodyColumnMode === undefined ? undefined : bodyColumnMode,
        status: input.status && paperStatusIsValid(input.status) ? input.status : undefined,
      } as any,
    });

    if (input.authors) {
      await tx.paperAuthor.deleteMany({ where: { paperId: id } });
      const authorsToCreate = input.authors
        .map((author, index) => ({
          paperId: id,
          userId: null as unknown as string,
          authorOrder: index + 1,
          isCorresponding: Boolean(author.isCorresponding),
          author,
        }))
        .filter(({ author }) => author.name.trim().length > 0);

      for (const item of authorsToCreate) {
        const email = item.author.email?.trim().toLowerCase();
        let user = email ? await tx.user.findUnique({ where: { email } }) : null;
        if (!user) {
          const nameParts = item.author.name.trim().split(' ');
          user = await tx.user.create({
            data: {
              email: email || undefined,
              firstName: nameParts[0] || item.author.name.trim(),
              lastName: nameParts.slice(1).join(' ') || 'Author',
              passwordHash: '',
              role: 'AUTHOR',
              isVerified: false,
            },
          });
        }

        await tx.paperAuthor.create({
          data: {
            paperId: id,
            userId: user.id,
            authorOrder: item.authorOrder,
            isCorresponding: item.isCorresponding,
          },
        });
      }
    }

    if (input.sections) {
      await tx.paperSection.deleteMany({ where: { paperId: id } });
      const sectionsToCreate = input.sections
        .map((section, index) => ({
          paperId: id,
          heading: section.heading.trim(),
          content: section.content || '',
          sectionOrder: index,
          isFullWidth: section.isFullWidth ?? true,
        }))
        .filter((section) => section.heading.length > 0 || section.content.length > 0);

      if (sectionsToCreate.length > 0) {
        await tx.paperSection.createMany({
          data: sectionsToCreate,
        });
      }
    }
  });

  return mapPaperToLegacyResearchPaper(await loadCanonicalPaper(id, prisma));
}

export async function deleteResearchPaper(id: string, prismaClient?: PrismaClient) {
  const prisma = resolvePrismaClient(prismaClient);
  const existing = await loadCanonicalPaper(id, prisma);
  if (!existing) throw new Error('Research paper draft not found.');

  await prisma.$transaction(async (tx) => {
    await deletePaperDependencies(tx, id);
    await tx.paper.delete({ where: { id } });
  });

  if (existing.sourceFilePath) {
    await removeStoredResearchPaperFile(existing.sourceFilePath);
  }
  if (existing.filePath) {
    await removeStoredResearchPaperFile(existing.filePath);
  }
  console.log('[DELETE] Canonical paper deleted ✅ — id:', id);
}

export async function publishResearchPaper(id: string, prismaClient?: PrismaClient) {
  const prisma = resolvePrismaClient(prismaClient);
  const draft = await loadCanonicalPaper(id, prisma);

  if (!draft) throw new Error('Research paper draft not found.');
  validatePublishReady({
    title: draft.title,
    abstract: draft.abstract,
    issueId: draft.issueId,
    status: draft.status,
    authors: draft.paperAuthors.map((author) => ({
      name: `${author.user.firstName} ${author.user.lastName}`.trim(),
    })),
    sections: draft.sections,
  });

  const updated = await prisma.paper.update({
    where: { id },
    data: {
      status: 'PUBLISHED',
      publishedAt: new Date(),
    },
    include: includePaperRelations,
  });
  return updated;
}

function styleUrlsInHtml(html: string): string {
  // Match URLs: https://example.com, www.example.com, or doi.org links
  const urlRegex = /(?<![">])(https?:\/\/[^\s<>")\]]+|www\.[^\s<>")\]]+|doi\.org\/[^\s<>")\]]+)/gi;

  return html.replace(urlRegex, (match) => {
    // Ensure proper URL format
    let fullUrl = match;
    if (match.startsWith('www.')) {
      fullUrl = `https://${match}`;
    }

    // Create styled link - will be rendered in PDF with blue color
    return `<a href="${escapeHtml(fullUrl)}" style="color: #0066cc; text-decoration: underline;">${escapeHtml(match)}</a>`;
  });
}

function detectTableCaptions(html: string): Array<{ caption: string; tableHtml: string; index: number }> {
  const results: Array<{ caption: string; tableHtml: string; index: number }> = [];

  // Match caption patterns: "Table 1:", "Figure 1:", "Fig 2.", etc.
  const captionRegex = /(Table|Figure|Fig|Figure)\s+(\d+[\w]*)\s*[:.\-]?\s*([^\n<]*)/gi;
  let match;

  while ((match = captionRegex.exec(html)) !== null) {
    const captionStart = match.index;
    const captionText = match[0];

    // Look for table after caption (within next 500 chars)
    const searchAfterCaption = html.slice(captionStart, captionStart + 1000);
    const tableMatch = searchAfterCaption.match(/<table[\s\S]*?<\/table>/i);

    if (tableMatch) {
      results.push({
        caption: captionText,
        tableHtml: tableMatch[0],
        index: captionStart,
      });
    }
  }

  return results;
}

function wrapTableWithCaption(html: string): string {
  const captions = detectTableCaptions(html);

  if (captions.length === 0) return html;

  let result = html;

  // Process captions in reverse order to maintain indices
  for (let i = captions.length - 1; i >= 0; i--) {
    const { caption, tableHtml, index } = captions[i];

    // Find the actual position of table in result (may have shifted)
    const tableIndex = result.indexOf(tableHtml);

    if (tableIndex !== -1) {
      // Wrap table with caption styling
      const wrapped = `<div style="text-align: center; margin: 12px 0;">
        <p style="font-weight: bold; font-size: 0.95em; margin: 0 0 8px 0;">${escapeHtml(caption)}</p>
        ${tableHtml}
      </div>`;

      result = result.substring(0, tableIndex) + wrapped + result.substring(tableIndex + tableHtml.length);
    }
  }

  return result;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function normalizeBodyColumnMode(value: unknown) {
  return value === 'single-column' ? 'single-column' : 'two-column';
}
