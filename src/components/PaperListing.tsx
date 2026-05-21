'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Download, 
  ExternalLink, 
  Calendar, 
  User, 
  BookOpen,
  ChevronDown,
  ChevronUp,
  Quote,
  Users
} from 'lucide-react';
import PDFThumbnail from '@/components/PDFThumbnail';

interface Author {
  firstName: string;
  lastName: string;
  institution?: string;
  email?: string;
}

interface PaperData {
  id: string;
  title: string;
  authors: string;
  authorDetails?: Author[];
  abstract?: string;
  keywords?: string;
  doi?: string;
  pdfUrl?: string;
  publishedAt?: string;
  issuePublishDate?: string;
  pageRange?: string;
  volume?: string;
  issue?: string;
  journal?: string;
  citation?: string;
  downloads?: number;
  views?: number;
  category?: string;
}

interface PaperListingProps {
  paper: PaperData;
  showThumbnail?: boolean;
  showAbstract?: boolean;
  showKeywords?: boolean;
  showCitation?: boolean;
  compact?: boolean;
  className?: string;
}

export function generateCitation(paper: PaperData): string {
  const authors = paper.authors || 'Unknown Author';
  const publishDate = paper.issuePublishDate || paper.publishedAt;
  const year = publishDate ? new Date(publishDate).getFullYear() : 'n.d.';
  const title = paper.title;
  const journal = paper.journal || 'International Journal of Research in Computer Applications and Management (IJARCM)';
  const volume = paper.volume ? `Vol. ${paper.volume}` : '';
  const issue = paper.issue ? `No. ${paper.issue}` : '';
  const pages = paper.pageRange || '';
  const doi = paper.doi ? `DOI: ${paper.doi}` : '';
  
  let citation = `${authors} (${year}). ${title}. ${journal}`;
  if (volume || issue) {
    citation += `, ${volume}${issue ? `(${issue})` : ''}`;
  }
  if (pages) {
    citation += `, pp. ${pages}`;
  }
  citation += '.';
  if (doi) {
    citation += ` ${doi}`;
  }
  
  return citation;
}

export default function PaperListing({
  paper,
  showThumbnail = true,
  showAbstract = true,
  showKeywords = true,
  showCitation = true,
  compact = false,
  className = ''
}: PaperListingProps) {
  const [showFullAbstract, setShowFullAbstract] = useState(false);
  const [showFullCitation, setShowFullCitation] = useState(false);
  
  const citation = paper.citation || generateCitation(paper);
  const abstract = paper.abstract || '';
  const keywords = paper.keywords ? paper.keywords.split(',').map(k => k.trim()) : [];
  
  // Truncate abstract for compact view
  const displayAbstract = compact && abstract.length > 200 
    ? abstract.substring(0, 200) + '...' 
    : abstract;
  
  // Display only first 3 keywords in compact view
  const displayKeywords = compact ? keywords.slice(0, 3) : keywords;
  
  return (
    <Card className={`hover:shadow-lg transition-shadow duration-200 ${className}`}>
      <CardHeader className={compact ? 'pb-3' : 'pb-4'}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <CardTitle className={`font-semibold text-gray-900 mb-2 line-clamp-${compact ? '2' : '3'}`}>
              <Link 
                href={`/papers/${paper.id}`}
                className="hover:text-blue-600 transition-colors"
              >
                {paper.title}
              </Link>
            </CardTitle>
            
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>{paper.authors}</span>
              </div>
              
              {paper.publishedAt && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  <span>{new Date(paper.publishedAt).toLocaleDateString()}</span>
                </div>
              )}
              
              {paper.category && (
                <Badge variant="secondary" className="text-xs">
                  {paper.category}
                </Badge>
              )}
            </div>
            
            {paper.authorDetails && paper.authorDetails.length > 0 && (
              <div className="mt-2 text-sm text-gray-600">
                <div className="font-medium mb-1">Affiliations:</div>
                <div className="space-y-1">
                  {paper.authorDetails.slice(0, 3).map((author, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <User className="w-3 h-3 mt-0.5 flex-shrink-0" />
                      <span>
                        {author.firstName} {author.lastName}
                        {author.institution && (
                          <span className="text-gray-500"> - {author.institution}</span>
                        )}
                      </span>
                    </div>
                  ))}
                  {paper.authorDetails.length > 3 && (
                    <div className="text-xs text-gray-500">
                      +{paper.authorDetails.length - 3} more authors
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
          
          {showThumbnail && paper.pdfUrl && !compact && (
            <div className="flex-shrink-0">
              <PDFThumbnail 
                fileUrl={paper.pdfUrl} 
                className="w-24 h-32 object-cover rounded border shadow-sm"
              />
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className={compact ? 'pt-0' : 'pt-0'}>
        {showAbstract && abstract && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 text-sm">Abstract</h4>
              {abstract.length > 200 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFullAbstract(!showFullAbstract)}
                  className="h-auto p-0 text-xs text-blue-600"
                >
                  {showFullAbstract ? (
                    <>
                      <ChevronUp className="w-3 h-3 mr-1" />
                      Show less
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3 mr-1" />
                      Show more
                    </>
                  )}
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">
              {showFullAbstract ? abstract : displayAbstract}
            </p>
          </div>
        )}
        
        {showKeywords && keywords.length > 0 && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 text-sm mb-2">Keywords</h4>
            <div className="flex flex-wrap gap-1">
              {displayKeywords.map((keyword, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {keyword}
                </Badge>
              ))}
              {compact && keywords.length > 3 && (
                <span className="text-xs text-gray-500">+{keywords.length - 3} more</span>
              )}
            </div>
          </div>
        )}
        
        {showCitation && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium text-gray-900 text-sm flex items-center gap-1">
                <Quote className="w-3 h-3" />
                Citation
              </h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(citation);
                  // You could add a toast notification here
                }}
                className="h-auto p-0 text-xs text-blue-600"
              >
                Copy
              </Button>
            </div>
            <div className="bg-gray-50 p-3 rounded text-xs text-gray-700 font-mono">
              {showFullCitation || citation.length <= 150 ? (
                citation
              ) : (
                <div>
                  {citation.substring(0, 150)}...
                  <Button
                    variant="link"
                    size="sm"
                    onClick={() => setShowFullCitation(true)}
                    className="h-auto p-0 text-xs text-blue-600 ml-1"
                  >
                    Show more
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {paper.downloads !== undefined && (
              <div className="flex items-center gap-1">
                <Download className="w-4 h-4" />
                <span>{paper.downloads}</span>
              </div>
            )}
            
            {paper.views !== undefined && (
              <div className="flex items-center gap-1">
                <FileText className="w-4 h-4" />
                <span>{paper.views}</span>
              </div>
            )}
            
            {paper.pageRange && (
              <span className="text-xs">Pages: {paper.pageRange}</span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {paper.doi && (
              <Button size="sm" variant="ghost" asChild>
                <a 
                  href={`https://doi.org/${paper.doi}`}
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  DOI
                </a>
              </Button>
            )}
            
            {paper.pdfUrl && (
              <Button size="sm" variant="ghost" asChild>
                <a 
                  href={paper.pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1"
                >
                  <Download className="w-3 h-3" />
                  PDF
                </a>
              </Button>
            )}
            
            <Button size="sm" variant="ghost" asChild>
              <Link href={`/papers/${paper.id}`} className="flex items-center gap-1">
                <BookOpen className="w-3 h-3" />
                View
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Component for displaying papers in a list format
export function PaperList({ 
  papers, 
  loading = false,
  title = "Papers",
  className = ""
}: { 
  papers: PaperData[];
  loading?: boolean;
  title?: string;
  className?: string;
}) {
  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 w-3/4 mb-2 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      {papers.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No papers found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {papers.map((paper) => (
            <PaperListing key={paper.id} paper={paper} compact={true} />
          ))}
        </div>
      )}
    </div>
  );
}

// Component for displaying papers in a grid format
export function PaperGrid({ 
  papers, 
  loading = false,
  title = "Papers",
  className = ""
}: { 
  papers: PaperData[];
  loading?: boolean;
  title?: string;
  className?: string;
}) {
  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-full mb-2 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div className="h-4 w-2/3 bg-gray-200 rounded animate-pulse" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
      {papers.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No papers found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {papers.map((paper) => (
            <PaperListing key={paper.id} paper={paper} />
          ))}
        </div>
      )}
    </div>
  );
}