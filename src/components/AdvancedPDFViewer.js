import React, { useState, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const AdvancedPDFViewer = ({ file }) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);

  const minScale = 0.5;
  const maxScale = 3;
  const scaleStep = 0.25;

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error) => {
    setError('Failed to load PDF document');
    setLoading(false);
  };

  const zoomIn = () => {
    setScale(prev => Math.min(prev + scaleStep, maxScale));
  };

  const zoomOut = () => {
    setScale(prev => Math.max(prev - scaleStep, minScale));
  };

  const resetZoom = () => {
    setScale(1);
  };

  const fitToWidth = () => {
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      setScale(containerWidth / 612); // Standard PDF page width
    }
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

  if (loading) {
    return (
      <div className="pdf-loading">
        <div className="spinner"></div>
        <p>Loading PDF...</p>
      </div>
    );
  }

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
      {/* Controls */}
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
          <button onClick={zoomOut} disabled={scale <= minScale} title="Zoom Out">
            −
          </button>
          <span className="zoom-level">{Math.round(scale * 100)}%</span>
          <button onClick={zoomIn} disabled={scale >= maxScale} title="Zoom In">
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

      {/* PDF Container */}
      <div ref={containerRef} className="pdf-container">
        <Document
          file={file}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          className="pdf-document"
        >
          <Page 
            pageNumber={pageNumber} 
            scale={scale}
            className="pdf-page"
          />
        </Document>
      </div>

      {/* Instructions */}
      <div className="pdf-instructions">
        <p>📄 Use arrow buttons or type page number • 🔍 Zoom controls • ⌨️ Keyboard shortcuts available</p>
      </div>
    </div>
  );
};

export default AdvancedPDFViewer;




