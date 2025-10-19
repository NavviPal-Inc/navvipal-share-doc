import React, { useState, useRef, useEffect, useMemo, useCallback, useImperativeHandle } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const AdvancedPDFViewer = React.forwardRef(({ file, onControlsRender, onZoomChange, onPageChange }, ref) => {
  const [numPages, setNumPages] = useState(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageInputValue, setPageInputValue] = useState(1);
  const [scale, setScale] = useState(null);
  const [pageWidth, setPageWidth] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const containerRef = useRef(null);
  const widthContainerRef = useRef(null);
  const visibleRefs = useRef([]);
  visibleRefs.current = [];
  const setPageRef = useCallback((el) => {
    if (el) {
      visibleRefs.current.push(el);
    }
  }, []);
  const hasExternalRef = ref != null;

  const minScale = 0.5;
  const maxScale = 3;
  const scaleStep = 0.25;

  const calculateFitToWidth = useCallback(() => {
    const host = widthContainerRef.current || containerRef.current;
    if (!host) return;

    const horizontalPadding = 40;
    const availableWidth = host.clientWidth - horizontalPadding;

    if (availableWidth > 0) {
      setPageWidth(availableWidth);
    } else {
      setPageWidth(null);
    }
  }, []);

  const onDocumentLoadSuccess = ({ numPages }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setPageInputValue(1);
    setError(null);

    if (containerRef.current) {
      containerRef.current.scrollTo({ top: 0 });
    }

    const schedule = typeof window !== 'undefined' && typeof window.requestAnimationFrame === 'function'
      ? window.requestAnimationFrame
      : (cb) => setTimeout(cb, 0);

    schedule(() => {
      calculateFitToWidth();
      setIsLoading(false);
    });
  };

  // Recalculate on window resize
  useEffect(() => {
    const handleResize = () => {
      if (!isLoading && (widthContainerRef.current || containerRef.current)) {
        calculateFitToWidth();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isLoading, calculateFitToWidth]);

  const onDocumentLoadError = (error) => {
    console.error('PDF Load Error:', error);
    setError('Failed to load PDF document');
    setIsLoading(false);
  };

  const zoomIn = useCallback(() => {
    setScale(prev => {
      const current = prev ?? 1;
      return Math.min(current + scaleStep, maxScale);
    });
    setPageWidth(null);
  }, [maxScale]);

  const zoomOut = useCallback(() => {
    setScale(prev => {
      const current = prev ?? 1;
      return Math.max(current - scaleStep, minScale);
    });
    setPageWidth(null);
  }, [minScale]);

  const resetZoom = useCallback(() => {
    setScale(1);
    setPageWidth(null);
  }, []);

  const fitToWidth = useCallback(() => {
    setScale(null);
    calculateFitToWidth();
    if (typeof onZoomChange === 'function') {
      onZoomChange('Fit');
    }
  }, [calculateFitToWidth, onZoomChange]);

  useEffect(() => {
    setIsLoading(true);
    setNumPages(null);
    setPageNumber(1);
    setPageInputValue(1);
    setPageWidth(null);
    setScale(null);
  }, [file]);

  const scrollToPage = useCallback((target) => {
    if (!numPages || !containerRef.current) return;
    const clamped = Math.max(1, Math.min(target, numPages));
    const node = visibleRefs.current.find(n => Number(n?.dataset?.page) === clamped);
    if (!node) return;

    const container = containerRef.current;
    const topOffset = Math.max(node.offsetTop - 16, 0);

    container.scrollTo({
      top: topOffset,
      behavior: 'smooth'
    });
  }, [numPages]);

  const goToPage = useCallback((page) => {
    if (!numPages) return;
    const target = Math.max(1, Math.min(page, numPages));
    setPageInputValue(target);
    scrollToPage(target);
  }, [numPages, scrollToPage]);

  const nextPage = useCallback(() => {
    if (!numPages) return;
    const current = pageInputValue || pageNumber;
    const target = Math.min(current + 1, numPages);
    setPageInputValue(target);
    scrollToPage(target);
  }, [numPages, pageInputValue, pageNumber, scrollToPage]);

  const prevPage = useCallback(() => {
    if (!numPages) return;
    const current = pageInputValue || pageNumber;
    const target = Math.max(current - 1, 1);
    setPageInputValue(target);
    scrollToPage(target);
  }, [numPages, pageInputValue, pageNumber, scrollToPage]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT') return; // Don't trigger if typing in input

      switch (e.key) {
        case 'ArrowLeft':
          prevPage();
          break;
        case 'ArrowRight':
          nextPage();
          break;
        case '+':
        case '=':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            zoomIn();
          }
          break;
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            zoomOut();
          }
          break;
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            fitToWidth();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [pageNumber, numPages, scale, prevPage, nextPage, zoomIn, zoomOut, fitToWidth]);

  useEffect(() => {
    if (!numPages || !containerRef.current || visibleRefs.current.length === 0) return;

    const io = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(entry => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible) {
        const next = Number(visible.target.dataset.page);
        if (next && next !== pageNumber) {
          setPageNumber(next);
          if (typeof onPageChange === 'function') {
            onPageChange(next);
          }
        }
      }
    }, { root: containerRef.current, threshold: [0.6] });

    visibleRefs.current.forEach(node => node && io.observe(node));

    return () => io.disconnect();
  }, [numPages, pageNumber, onPageChange, containerRef]);

  useEffect(() => {
    setPageInputValue(pageNumber);
  }, [pageNumber]);

  const getZoomLabel = useCallback(() => {
    return scale !== null ? `${Math.round((scale || 1) * 100)}%` : 'Fit';
  }, [scale]);

  useImperativeHandle(ref, () => ({
    zoomIn,
    zoomOut,
    fitToWidth,
    resetZoom,
    getZoomLabel
  }), [zoomIn, zoomOut, fitToWidth, resetZoom, getZoomLabel]);

  useEffect(() => {
    if (typeof onZoomChange === 'function') {
      onZoomChange(getZoomLabel());
    }
  }, [scale, onZoomChange, getZoomLabel]);

  if (error) {
    return (
      <div className="pdf-error">
        <p>{error}</p>
        <button className="retry-button" onClick={() => window.location.reload()}>
          Retry
        </button>
      </div>
    );
  }

  const controls = useMemo(() => {
    if (isLoading || !numPages || hasExternalRef) {
      return null;
    }

    return (
      <div className="pdf-controls">
        <div className="page-controls">
          <button onClick={prevPage} disabled={pageNumber <= 1} title="Previous Page (←)">
            ←
          </button>
          <input
            type="number"
            value={pageInputValue}
            onChange={(e) => goToPage(parseInt(e.target.value, 10) || 1)}
            min={1}
            max={numPages}
            className="page-input"
          />
          <span className="page-info">of {numPages}</span>
          <button onClick={nextPage} disabled={pageNumber >= numPages} title="Next Page (→)">
            →
          </button>
        </div>

        <div className="zoom-controls">
          <button
            onClick={zoomOut}
            disabled={scale !== null && scale <= minScale}
            title="Zoom Out (Ctrl + -)"
          >
            −
          </button>
          <span className="zoom-level">
            {scale !== null ? `${Math.round(scale * 100)}%` : 'Fit'}
          </span>
          <button
            onClick={zoomIn}
            disabled={scale !== null && scale >= maxScale}
            title="Zoom In (Ctrl + +)"
          >
            +
          </button>
          <button onClick={resetZoom} title="Reset Zoom (100%)">
            ⌂
          </button>
          <button onClick={fitToWidth} title="Fit to Width (Ctrl + 0)">
            ⇄
          </button>
        </div>
      </div>
    );
  }, [
    isLoading,
    numPages,
    pageNumber,
    pageInputValue,
    scale,
    prevPage,
    nextPage,
    goToPage,
    zoomOut,
    zoomIn,
    resetZoom,
    fitToWidth,
    minScale,
    maxScale,
    hasExternalRef
  ]);

  useEffect(() => {
    if (onControlsRender) {
      onControlsRender(controls);
      return () => onControlsRender(null);
    }
  }, [controls, onControlsRender]);

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
      {!onControlsRender && controls}

      {/* PDF Container */}
      <div ref={widthContainerRef} className="pdf-container">
        <div ref={containerRef} className="pdf-scroll">
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
            {numPages && Array.from({ length: numPages }, (_, i) => {
              const n = i + 1;
              return (
                <div
                  key={n}
                  data-page={n}
                  ref={setPageRef}
                  className="pdf-page-wrap"
                >
                  <Page
                    pageNumber={n}
                    width={pageWidth ?? undefined}
                    scale={scale === null ? undefined : scale}
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
                </div>
              );
            })}
          </Document>
        </div>
      </div>

      {/* Instructions - show only when loaded
      {!isLoading && numPages && (
        <div className="pdf-instructions">
          <p>📄 Use arrow keys or buttons to navigate • 🔍 Ctrl+/- to zoom • ⌨️ Ctrl+0 to fit width</p>
        </div>
      )} */}
    </div>
  );
});

AdvancedPDFViewer.displayName = 'AdvancedPDFViewer';

export default AdvancedPDFViewer;
