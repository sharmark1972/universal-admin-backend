'use client';

import { useState } from 'react';
import { Copy, Download, FileText } from 'lucide-react';
import { CitationStyle } from '@/lib/citations';

interface CitationExportProps {
  paperId: string;
  doi?: string;
}

export default function CitationExport({
  paperId,
  doi
}: CitationExportProps) {
  const [selectedStyle, setSelectedStyle] = useState<CitationStyle>(CitationStyle.APA);
  const [citation, setCitation] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const citationStyles = [
    { value: CitationStyle.APA, label: 'APA' },
    { value: CitationStyle.MLA, label: 'MLA' },
    { value: CitationStyle.CHICAGO, label: 'Chicago' },
    { value: CitationStyle.IEEE, label: 'IEEE' },
    { value: CitationStyle.HARVARD, label: 'Harvard' },
    { value: CitationStyle.BIBTEX, label: 'BibTeX' }
  ];

  const fetchCitation = async (style: CitationStyle) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/papers/${paperId}/citations?style=${style}`);
      const data = await response.json();
      setCitation(data.citation);
    } catch (error) {
      console.error('Error fetching citation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStyleChange = (style: CitationStyle) => {
    setSelectedStyle(style);
    fetchCitation(style);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(citation);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copying citation:', error);
    }
  };

  const handleDownload = async (format: 'txt' | 'bib') => {
    try {
      const response = await fetch(
        `/api/papers/${paperId}/citations?style=${selectedStyle}&format=${format}`
      );
      const text = await response.text();
      
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `citation_${paperId}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading citation:', error);
    }
  };

  // Fetch initial citation on mount
  useState(() => {
    fetchCitation(CitationStyle.APA);
  });

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 mt-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-slate-700" />
        <h3 className="text-lg font-serif font-bold text-slate-900">Cite This Article</h3>
      </div>

      {/* Citation Style Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Citation Style
        </label>
        <div className="flex flex-wrap gap-2">
          {citationStyles.map((style) => (
            <button
              key={style.value}
              onClick={() => handleStyleChange(style.value)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedStyle === style.value
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      {/* Citation Display */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-slate-700 mb-2">
          Citation
        </label>
        <div className="relative">
          <textarea
            value={citation}
            readOnly
            className="w-full p-4 border border-slate-300 rounded-md bg-slate-50 text-sm text-slate-900 resize-none font-mono"
            rows={selectedStyle === CitationStyle.BIBTEX ? 8 : 4}
          />
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 p-2 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
            title="Copy to clipboard"
          >
            {copied ? (
              <span className="text-green-600 text-sm font-medium">Copied!</span>
            ) : (
              <Copy className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>

      {/* Download Options */}
      <div className="flex gap-3">
        <button
          onClick={() => handleDownload('txt')}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Download as TXT
        </button>
        <button
          onClick={() => handleDownload('bib')}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-md hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
        >
          <Download className="w-4 h-4" />
          Download as BibTeX
        </button>
      </div>

      {/* DOI Link */}
      {doi && (
        <div className="mt-4 pt-4 border-t border-slate-200">
          <p className="text-sm text-slate-600">
            DOI:{' '}
            <a
              href={`https://doi.org/${doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 hover:underline"
            >
              {doi}
            </a>
          </p>
        </div>
      )}
    </div>
  );
}
