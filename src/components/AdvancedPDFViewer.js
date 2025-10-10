import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const AdvancedPDFViewer = ({ file }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(null);
  const [pageWidth, setPageWidth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  const minScale = 0.5;
  const maxScale = 3;
  const scaleStep = 0.25;

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
    // Calculate initial scale to fit width
    calculateFitToWidth();
  };

  const calculateFitToWidth = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth - 40; // Account for padding
      setPageWidth(containerWidth);
    }
  };

  // Recalculate on window resize
  useEffect(() => {
    const handleResize = () => {
      if (!isLoading && containerRef.current) {
        calculateFitToWidth();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isLoading]);

  const onDocumentLoadError = (error) => {
    console.error('PDF Load Error:', error);
    setError('Failed to load PDF document');
    setIsLoading(false);
  };

  const zoomIn = () => {
    if (scale !== null) {
      setScale(prev => Math.min(prev + scaleStep, maxScale));
      setPageWidth(null); // Clear width when using scale
    }
  };

  const zoomOut = () => {
    if (scale !== null) {
      setScale(prev => Math.max(prev - scaleStep, minScale));
      setPageWidth(null); // Clear width when using scale
    }
  };

  const resetZoom = () => {
    setScale(1);
    setPageWidth(null);
  };

  const fitToWidth = () => {
    setScale(null); // Clear scale to use width
    calculateFitToWidth();
  };

  const goToPage = (page) => {
    setPageNumber(Math.max(1, Math.min(page, numPages)));
  };

  const nextPage = () => {
    if (pageNumber < numPages) {
      setPageNumber(pageNumber + 1);
    }
  };

  const prevPage = () => {
    if (pageNumber > 1) {
      setPageNumber(pageNumber - 1);
    }
  };

  if (error) {
    return (
      <div className="pdf-error">
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="advanced-pdf-viewer">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="pdf-loading-overlay">
          <div className="spinner"></div>
          <p>Loading PDF...</p>
        </div>
      )}

      {/* Controls - show only when loaded */}
      {!isLoading && numPages && (
        <div className="pdf-controls">
          <div className="page-controls">
            <button onClick={prevPage} disabled={pageNumber <= 1} title="Previous Page">
              ←
            </button>
            <input
              type="number"
              value={pageNumber}
              onChange={(e) => goToPage(parseInt(e.target.value) || 1)}
              min={1}
              max={numPages}
              className="page-input"
            />
            <span className="page-info">of {numPages}</span>
            <button onClick={nextPage} disabled={pageNumber >= numPages} title="Next Page">
              →
            </button>
          </div>
          
          <div className="zoom-controls">
            <button onClick={zoomOut} disabled={scale !== null && scale <= minScale} title="Zoom Out">
              −
            </button>
            <span className="zoom-level">
              {scale !== null ? `${Math.round(scale * 100)}%` : 'Fit'}
            </span>
            <button onClick={zoomIn} disabled={scale !== null && scale >= maxScale} title="Zoom In">
              +
            </button>
            <button onClick={resetZoom} title="Reset Zoom">
              ⌂
            </button>
            <button onClick={fitToWidth} title="Fit to Width">
              ⇄
            </button>
          </div>
        </div>
      )}

      {/* PDF Container */}
      <div ref={containerRef} className="pdf-container">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="pdf-loading">
              <div className="spinner"></div>
              <p>Loading PDF...</p>
            </div>
          }
          className="pdf-document"
        >
          <Page 
            pageNumber={pageNumber} 
            width={pageWidth}
            scale={scale}
            className="pdf-page"
            renderTextLayer={true}
            renderAnnotationLayer={true}
            loading={
              <div className="pdf-loading">
                <div className="spinner"></div>
                <p>Loading page...</p>
              </div>
            }
          />
        </Document>
      </div>

      {/* Instructions - show only when loaded */}
      {!isLoading && numPages && (
        <div className="pdf-instructions">
          <p>📄 Use arrow buttons or type page number • 🔍 Zoom controls • ⌨️ Keyboard shortcuts available</p>
        </div>
      )}
    </div>
  );
};

export default AdvancedPDFViewer;




