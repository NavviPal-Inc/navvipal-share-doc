import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import AdvancedPDFViewer from './AdvancedPDFViewer';
import AdvancedImageViewer from './AdvancedImageViewer';
import DocumentMetadata from './DocumentMetadata';
import CountdownTimer from './CountdownTimer';
import apiService from '../services/api';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const DocumentViewer = ({ documentData, s3Url }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileType, setFileType] = useState('');
  const [contentVisible, setContentVisible] = useState(true);
  const [, setPdfControls] = useState(null);
  const pdfApiRef = useRef(null);
  const imageApiRef = useRef(null);
  const [pdfZoomLabel, setPdfZoomLabel] = useState('Fit');
  const [imageZoomLabel, setImageZoomLabel] = useState('100%');
  
  const noDownload = documentData?.no_download || false;
  const noScreenshots = documentData?.no_screenshots || false;

  useEffect(() => {
    loadDocument();
  }, [s3Url]);

  useEffect(() => {
    if (fileType !== 'pdf') {
      setPdfControls(null);
    }
  }, [fileType]);

  useEffect(() => {
    if (fileType === 'pdf') {
      const label = pdfApiRef.current?.getZoomLabel?.();
      setPdfZoomLabel(label ?? 'Fit');
    } else if (fileType === 'image') {
      const label = imageApiRef.current?.getZoomLabel?.();
      setImageZoomLabel(label ?? '100%');
    }
  }, [fileType]);

  useEffect(() => {
    if (noScreenshots) {
      // Prevent right-click context menu
      const preventContextMenu = (e) => {
        e.preventDefault();
        return false;
      };

      // Detect when user might be taking screenshot - hide content temporarily
      const handleVisibilityChange = () => {
        if (document.hidden || !document.hasFocus()) {
          setContentVisible(false);
          // Show content again after a delay
          setTimeout(() => setContentVisible(true), 100);
        }
      };

      const handleBlur = () => {
        setContentVisible(false);
        setTimeout(() => {
          if (document.hasFocus()) {
            setContentVisible(true);
          }
        }, 100);
      };

      const handleFocus = () => {
        setTimeout(() => setContentVisible(true), 50);
      };

      // Detect key combinations that might trigger screenshots
      const handleKeyDown = (e) => {
        // Detect Cmd+Shift+3/4/5 (Mac) or Win+Shift+S (Windows) or PrtScn
        if (
          (e.metaKey && e.shiftKey && ['3', '4', '5'].includes(e.key)) ||
          (e.key === 's' && e.shiftKey && (e.metaKey || e.ctrlKey)) ||
          e.key === 'PrintScreen'
        ) {
          // Hide content immediately when screenshot key is detected
          setContentVisible(false);
          setTimeout(() => setContentVisible(true), 500);
        }
        
        // Prevent dev tools
        if (
          e.key === 'F12' ||
          (e.ctrlKey && e.shiftKey && e.key === 'I') ||
          (e.ctrlKey && e.shiftKey && e.key === 'J') ||
          (e.ctrlKey && e.key === 'U')
        ) {
          e.preventDefault();
          return false;
        }
      };

      // Monitor mouse leaving window (could indicate screenshot tool selection)
      const handleMouseLeave = () => {
        setContentVisible(false);
        setTimeout(() => setContentVisible(true), 300);
      };

      document.addEventListener('contextmenu', preventContextMenu);
      document.addEventListener('visibilitychange', handleVisibilityChange);
      document.addEventListener('keydown', handleKeyDown);
      window.addEventListener('blur', handleBlur);
      window.addEventListener('focus', handleFocus);
      document.addEventListener('mouseleave', handleMouseLeave);

      return () => {
        document.removeEventListener('contextmenu', preventContextMenu);
        document.removeEventListener('visibilitychange', handleVisibilityChange);
        document.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('blur', handleBlur);
        window.removeEventListener('focus', handleFocus);
        document.removeEventListener('mouseleave', handleMouseLeave);
      };
    }
  }, [noScreenshots]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      setPdfControls(null);
      setPdfZoomLabel('Fit');
      setImageZoomLabel('100%');
      
      const blob = await apiService.fetchDocumentContent(s3Url);
      const url = URL.createObjectURL(blob);
      
      // Determine file type from URL or content
      const fileName = s3Url.split('/').pop().toLowerCase();
      let detectedType = '';
      
      if (fileName.includes('.pdf') || blob.type === 'application/pdf') {
        detectedType = 'pdf';
      } else if (fileName.includes('.jpg') || fileName.includes('.jpeg') || 
                 fileName.includes('.png') || fileName.includes('.gif') || 
                 fileName.includes('.webp') || fileName.includes('.bmp') || 
                 blob.type.startsWith('image/')) {
        detectedType = 'image';
      } else if (fileName.includes('.csv') || blob.type === 'text/csv') {
        detectedType = 'csv';
      } else if (fileName.includes('.xlsx') || fileName.includes('.xls') || 
                 blob.type.includes('spreadsheet') || blob.type.includes('excel')) {
        detectedType = 'excel';
      } else if (fileName.includes('.txt') || blob.type === 'text/plain') {
        detectedType = 'text';
      }
      
      setFileType(detectedType);
      
      if (detectedType === 'image') {
        setContent(url);
      } else if (detectedType === 'pdf') {
        setContent(url);
      } else if (detectedType === 'csv') {
        const text = await blob.text();
        const parsed = Papa.parse(text, { header: true, skipEmptyLines: true });
        setContent(parsed.data);
      } else if (detectedType === 'excel') {
        const arrayBuffer = await blob.arrayBuffer();
        const workbook = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        setContent(jsonData);
      } else if (detectedType === 'text') {
        const text = await blob.text();
        setContent(text);
      } else {
        setContent(url);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderImage = () => (
    <AdvancedImageViewer 
      ref={imageApiRef}
      src={content} 
      alt="Document"
      noDownload={noDownload}
      onZoomChange={setImageZoomLabel}
    />
  );

  const renderPDF = () => (
    <AdvancedPDFViewer
      ref={pdfApiRef}
      file={content}
      onControlsRender={setPdfControls}
      onZoomChange={setPdfZoomLabel}
    />
  );

  const renderCSV = () => (
    <div className="csv-viewer">
      <table>
        <thead>
          <tr>
            {content.length > 0 && Object.keys(content[0]).map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {content.slice(0, 100).map((row, index) => (
            <tr key={index}>
              {Object.values(row).map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {content.length > 100 && (
        <p style={{ textAlign: 'center', marginTop: '20px', color: 'rgba(255, 255, 255, 0.5)' }}>
          Showing first 100 rows of {content.length} total rows
        </p>
      )}
    </div>
  );

  const renderExcel = () => (
    <div className="excel-viewer">
      <table>
        <tbody>
          {content.slice(0, 100).map((row, index) => (
            <tr key={index}>
              {row.map((cell, cellIndex) => (
                <td key={cellIndex}>{cell}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {content.length > 100 && (
        <p style={{ textAlign: 'center', marginTop: '20px', color: 'rgba(255, 255, 255, 0.5)' }}>
          Showing first 100 rows of {content.length} total rows
        </p>
      )}
    </div>
  );

  const renderText = () => (
    <div className="text-viewer">
      <pre>{content}</pre>
    </div>
  );

  const renderUnsupported = () => (
    <div className="unsupported-file">
      <p>This file type is not supported for preview.</p>
      {!noDownload ? (
        <a 
          href={s3Url} 
          download 
          className="download-btn"
          style={{ marginTop: '20px' }}
        >
          Download File
        </a>
      ) : (
        <p style={{ marginTop: '20px', color: '#e74c3c', fontWeight: 'bold' }}>
          Downloads are disabled for this document
        </p>
      )}
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading document...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error">
          <h2>Error</h2>
          <p>{error}</p>
          <button className="retry-button" onClick={loadDocument}>
            Retry
          </button>
        </div>
      );
    }

    if (!content) {
      return (
        <div className="loading">
          <p>No content to display</p>
        </div>
      );
    }

    switch (fileType) {
      case 'image':
        return renderImage();
      case 'pdf':
        return renderPDF();
      case 'csv':
        return renderCSV();
      case 'excel':
        return renderExcel();
      case 'text':
        return renderText();
      default:
        return renderUnsupported();
    }
  };

  const isZoomable = fileType === 'pdf' || fileType === 'image';
  const activeViewerRef = isZoomable ? (fileType === 'pdf' ? pdfApiRef : imageApiRef) : null;
  const hasViewerApi = Boolean(activeViewerRef?.current);
  const zoomLabel = isZoomable ? (fileType === 'pdf' ? pdfZoomLabel : imageZoomLabel) : '—';
  const zoomButtonsDisabled = !hasViewerApi || loading;

  const handleFullscreenToggle = () => {
    if (typeof document === 'undefined') {
      return;
    }
    const el = document.querySelector('.document-viewer') || document.body;
    if (!document.fullscreenElement) {
      el?.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
  };

  return (
    <>
      <section className="viewer-topbar">
        <div className="viewer-topbar-left">
          {documentData && (
            <DocumentMetadata documentData={documentData} compact />
          )}
        </div>

        <div className="viewer-topbar-center">
          {documentData?.expiry_date && (
            <CountdownTimer expiryDate={documentData.expiry_date} variant="chip" />
          )}
        </div>

        <div className="viewer-topbar-right">
          <button
            className="viewer-topbar-btn"
            aria-label="Zoom Out"
            onClick={() => {
              if (fileType === 'pdf') {
                pdfApiRef.current?.zoomOut?.();
              } else if (fileType === 'image') {
                imageApiRef.current?.zoomOut?.();
              }
            }}
            title="Zoom Out"
            disabled={zoomButtonsDisabled}
          >
            −
          </button>
          <span className="viewer-topbar-zoom-level">
            {zoomLabel}
          </span>
          <button
            className="viewer-topbar-btn"
            aria-label="Zoom In"
            onClick={() => {
              if (fileType === 'pdf') {
                pdfApiRef.current?.zoomIn?.();
              } else if (fileType === 'image') {
                imageApiRef.current?.zoomIn?.();
              }
            }}
            title="Zoom In"
            disabled={zoomButtonsDisabled}
          >
            +
          </button>
          <button
            className="viewer-topbar-btn"
            aria-label="Fullscreen"
            onClick={handleFullscreenToggle}
            title="Fullscreen"
          >
            ⛶
          </button>
        </div>
      </section>

      <div className="document-viewer">
        <section className="document-content">
          <div className={`document-body ${noScreenshots ? 'no-screenshots' : ''}`}>
            {noScreenshots && !contentVisible ? (
              <div className="screenshot-protection-overlay">
                <div className="protection-message">
                  <h2>🔒 Screenshot Protection Active</h2>
                  <p>Content temporarily hidden</p>
                </div>
              </div>
            ) : (
              <>
                {renderContent()}
                {documentData.watermark && (
                  <div className="watermark">NAVVIPAL</div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default DocumentViewer;
