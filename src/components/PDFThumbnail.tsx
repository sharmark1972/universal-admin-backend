'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import { FileText, AlertCircle, Loader2 } from 'lucide-react';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Type definition for PDF page object
interface PDFPage {
  getViewport: (params: { scale: number }) => { width: number; height: number };
  render: (context: { canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }) => { promise: Promise<void> };
}

// Dynamically import PDF components to ensure client-side only rendering
const Document = dynamic(
  () => import('react-pdf').then(mod => ({ default: mod.Document })),
  { ssr: false }
);

const Page = dynamic(
  () => import('react-pdf').then(mod => ({ default: mod.Page })),
  { ssr: false }
);

// Set up PDF.js worker before any component renders
// For react-pdf v7.x with pdfjs-dist v3.x
if (typeof window !== 'undefined') {
  import('react-pdf').then(({ pdfjs }) => {
    // Use CDN worker for pdfjs-dist v3.x
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
  });
}

interface PDFThumbnailProps {
  fileUrl: string;
  width?: number | string;
  height?: number | string;
  aspectRatio?: number;
  className?: string;
  alt?: string;
  showFallback?: boolean;
  onClick?: () => void;
}

const PDFThumbnail: React.FC<PDFThumbnailProps> = ({
  fileUrl,
  width = 200,
  height = 280,
  aspectRatio,
  className = '',
  alt = 'PDF Thumbnail',
  showFallback = true,
  onClick
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [numPages, setNumPages] = useState<number>(0);
  const [isClient, setIsClient] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [thumbnailDataUrl, setThumbnailDataUrl] = useState<string | null>(null);

  // Ensure component only renders on client side
  useEffect(() => {
    setIsClient(true);
  }, []);

  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setError(null);
  }, []);

  const onDocumentLoadError = useCallback((error: Error) => {
    console.error('PDF thumbnail load error:', error);
    setError('Failed to load PDF');
    setIsLoading(false);
  }, []);

  const onPageLoadSuccess = useCallback((page: any) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    // Calculate scale to fit the desired dimensions while maintaining aspect ratio
    const viewport = page.getViewport({ scale: 1 });
    
    // Convert width/height to numbers for calculations
    const numericWidth = typeof width === 'number' ? width : 200;
    const numericHeight = typeof height === 'number' ? height : 280;
    
    const scaleX = numericWidth / viewport.width;
    const scaleY = numericHeight / viewport.height;
    const scale = Math.min(scaleX, scaleY);

    const scaledViewport = page.getViewport({ scale });
    
    canvas.width = scaledViewport.width;
    canvas.height = scaledViewport.height;

    const renderContext = {
      canvasContext: context,
      viewport: scaledViewport,
    };

    page.render(renderContext).promise.then(() => {
      // Convert canvas to data URL for display
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setThumbnailDataUrl(dataUrl);
      setIsLoading(false);
    }).catch((renderError: Error) => {
      console.error('PDF page render error:', renderError);
      setError('Failed to render PDF page');
      setIsLoading(false);
    });
  }, [width, height]);

  const onPageLoadError = useCallback((error: Error) => {
    console.error('PDF page load error:', error);
    setError('Failed to load PDF page');
    setIsLoading(false);
  }, []);

  // Reset state when fileUrl changes
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setThumbnailDataUrl(null);
  }, [fileUrl]);

  const containerStyle: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
    maxWidth: '100%',
    minWidth: '0',
    ...(aspectRatio && {
      aspectRatio: aspectRatio.toString(),
      height: 'auto'
    })
  };

  const FallbackComponent = () => (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 border border-gray-200 rounded-lg ${className} ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
      style={containerStyle}
      onClick={onClick}
    >
      {/* Decorative Pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, #1e40af 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}></div>
      </div>
      
      {/* Content */}
      <div className="relative flex flex-col items-center justify-center h-full p-4">
        {isLoading ? (
          <>
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-3" />
            <span className="text-sm text-gray-700 font-medium">Loading PDF...</span>
            <span className="text-xs text-gray-500 mt-1">Please wait</span>
          </>
        ) : error ? (
          <>
            <div className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center mb-3">
              <AlertCircle className="w-6 h-6 text-amber-500" />
            </div>
            <span className="text-sm text-gray-800 font-semibold mb-1">Preview Unavailable</span>
            <span className="text-xs text-gray-600 text-center px-2">PDF thumbnail could not be generated</span>
          </>
        ) : (
          <>
            <div className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center mb-3">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <span className="text-sm text-gray-800 font-semibold mb-1">PDF Document</span>
            <span className="text-xs text-gray-600 text-center px-2">Click to download</span>
          </>
        )}
      </div>
    </div>
  );

  if (!fileUrl) {
    return showFallback ? <FallbackComponent /> : null;
  }

  // Only render on client side to avoid SSR issues with DOMMatrix
  if (!isClient) {
    return showFallback ? <FallbackComponent /> : null;
  }

  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={containerStyle}
    >
      {/* Hidden canvas for rendering */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      
      {/* Hidden PDF document for loading */}
      <div style={{ display: 'none' }}>
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={null}
        >
          {numPages > 0 && (
            <Page
              pageNumber={1}
              onLoadSuccess={onPageLoadSuccess}
              onLoadError={onPageLoadError}
              loading={null}
              renderTextLayer={false}
              renderAnnotationLayer={false}
            />
          )}
        </Document>
      </div>

      {/* Display thumbnail or fallback */}
      {thumbnailDataUrl ? (
        <Image
          src={thumbnailDataUrl}
          alt={alt || 'PDF Thumbnail'}
          width={typeof width === 'number' ? width : 200}
          height={typeof height === 'number' ? height : 280}
          className={`w-full h-full object-contain rounded-lg shadow-sm border border-gray-200 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}
          onClick={onClick}
          style={{ maxWidth: '100%', maxHeight: '100%' }}
        />
      ) : (
        showFallback && <FallbackComponent />
      )}
    </div>
  );
};

export default PDFThumbnail;