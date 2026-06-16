'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize,
  Minimize,
  Loader2
} from 'lucide-react';

interface PDFViewerProps {
  fileUrl: string;
  fileName?: string;
  maxPages?: number;
  onPageChange?: (page: number) => void;
  className?: string;
}

const PDFViewer: React.FC<PDFViewerProps> = ({
  fileUrl,
  fileName = 'Document',
  maxPages,
  onPageChange,
  className = ''
}) => {
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState<number>(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleLoad = () => {
      setIsLoading(false);
      setError(null);
    };

    const handleError = () => {
      setIsLoading(false);
      setError('Failed to load PDF document');
    };

    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleLoad);
      iframe.addEventListener('error', handleError);
      
      return () => {
        iframe.removeEventListener('load', handleLoad);
        iframe.removeEventListener('error', handleError);
      };
    }
  }, [fileUrl]);

  const goToPrevPage = useCallback(() => {
    if (pageNumber > 1) {
      const newPage = pageNumber - 1;
      setPageNumber(newPage);
      onPageChange?.(newPage);
      // Update iframe URL with new page
      if (iframeRef.current) {
        iframeRef.current.src = `${fileUrl}#page=${newPage}`;
      }
    }
  }, [pageNumber, onPageChange, fileUrl]);

  const goToNextPage = useCallback(() => {
    const maxPage = maxPages ? Math.min(totalPages, maxPages) : totalPages;
    if (pageNumber < maxPage && pageNumber < totalPages) {
      const newPage = pageNumber + 1;
      setPageNumber(newPage);
      onPageChange?.(newPage);
      // Update iframe URL with new page
      if (iframeRef.current) {
        iframeRef.current.src = `${fileUrl}#page=${newPage}`;
      }
    }
  }, [pageNumber, totalPages, maxPages, onPageChange, fileUrl]);

  const handlePageInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const page = parseInt(e.target.value);
    const maxPage = maxPages ? Math.min(totalPages, maxPages) : totalPages;
    if (page >= 1 && page <= maxPage) {
      setPageNumber(page);
      onPageChange?.(page);
      // Update iframe URL with new page
      if (iframeRef.current) {
        iframeRef.current.src = `${fileUrl}#page=${page}`;
      }
    }
  }, [totalPages, maxPages, onPageChange, fileUrl]);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  const downloadPDF = useCallback(() => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = `${fileName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [fileUrl, fileName]);

  const maxPage = maxPages ? Math.min(totalPages, maxPages) : totalPages;

  // Create a URL with page parameter for the PDF
  const getPdfUrl = useCallback(() => {
    // For local files, we need to handle them differently
    if (fileUrl.startsWith('/')) {
      // It's a local file, add the page parameter
      return `${fileUrl}#page=${pageNumber}`;
    }
    
    // For external URLs, use URL object
    try {
      const url = new URL(fileUrl);
      url.hash = `page=${pageNumber}`;
      return url.toString();
    } catch {
      // If URL parsing fails, just append the hash
      return `${fileUrl}#page=${pageNumber}`;
    }
  }, [fileUrl, pageNumber]);

  return (
    <div className={`flex flex-col h-full bg-gray-100 ${className} ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Toolbar */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          {/* Page Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrevPage}
              disabled={pageNumber <= 1}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100 transition-colors"
              title="Previous page"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            <div className="flex items-center space-x-2">
              <input
                type="number"
                value={pageNumber}
                onChange={handlePageInputChange}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={1}
                max={maxPage || 1}
              />
              <span className="text-sm text-gray-600">/ {maxPage || '?'}</span>
            </div>

            <button
              onClick={goToNextPage}
              disabled={pageNumber >= (maxPage || 1)}
              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed rounded-md hover:bg-gray-100 transition-colors"
              title="Next page"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Right side controls */}
        <div className="flex items-center space-x-2">
          <button
            onClick={downloadPDF}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
            title="Download PDF"
          >
            <Download className="h-5 w-5" />
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* PDF Content */}
      <div className="flex-1 overflow-auto bg-gray-200 p-4">
        <div className="flex justify-center">
          {isLoading && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
                <p className="text-gray-600">Loading PDF...</p>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="text-red-500 mb-4">
                  <svg className="h-16 w-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                </div>
                <p className="text-gray-600">{error}</p>
              </div>
            </div>
          )}
          
          {!error && (
            <iframe
              ref={iframeRef}
              src={getPdfUrl()}
              className="w-full h-full shadow-lg"
              style={{ minHeight: '600px', border: 'none' }}
              title="PDF Viewer"
              onLoad={() => {
                setIsLoading(false);
                // Use maxPages as total pages if available
                setTotalPages(maxPages || 100);
              }}
              onError={() => {
                setIsLoading(false);
                setError('Failed to load PDF. Please try downloading the file instead.');
              }}
            />
          )}
        </div>
      </div>

      {/* Page Progress */}
      {!isLoading && !error && (
        <div className="bg-white border-t border-gray-200 px-4 py-2">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>Page {pageNumber} of {maxPage || '?'}</span>
            <div className="flex-1 mx-4">
              <div className="bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${maxPage ? (pageNumber / maxPage) * 100 : 0}%` }}
                ></div>
              </div>
            </div>
            <span>{maxPage ? Math.round((pageNumber / maxPage) * 100) : 0}%</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default PDFViewer;