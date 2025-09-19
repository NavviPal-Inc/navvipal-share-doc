import React, { useState, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import AdvancedImageViewer from './AdvancedImageViewer';
import AdvancedPDFViewer from './AdvancedPDFViewer';
import apiService from '../services/api';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

const DocumentViewer = ({ documentData, s3Url }) => {
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [fileType, setFileType] = useState('');

  useEffect(() => {
    loadDocument();
  }, [s3Url]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const blob = await apiService.fetchDocumentContent(s3Url);
      const url = URL.createObjectURL(blob);
      
      // Determine file type from URL or content
      const fileName = s3Url.split('/').pop().toLowerCase();
      let detectedType = '';
      
      if (fileName.includes('.pdf') || blob.type === 'application/pdf') {
        detectedType = 'pdf';
      } else if (fileName.includes('.jpg') || fileName.includes('.jpeg') || 
                 fileName.includes('.png') || fileName.includes('.gif') || 
                 fileName.includes('.webp') || blob.type.startsWith('image/')) {
        detectedType = 'image';
      } else if (fileName.includes('.csv') || blob.type === 'text/csv') {
        detectedType = 'csv';
      } else if (fileName.includes('.xlsx') || fileName.includes('.xls') || 
                 blob.type.includes('spreadsheet') || blob.type.includes('excel')) {
        detectedType = 'excel';
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
      src={content} 
      alt="Document"
    />
  );

  const renderPDF = () => (
    <AdvancedPDFViewer file={content} />
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
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#7f8c8d' }}>
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
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#7f8c8d' }}>
          Showing first 100 rows of {content.length} total rows
        </p>
      )}
    </div>
  );

  const renderUnsupported = () => (
    <div className="unsupported-file">
      <p>This file type is not supported for preview.</p>
      <a 
        href={content} 
        download 
        style={{ 
          display: 'inline-block', 
          marginTop: '20px', 
          padding: '12px 24px', 
          backgroundColor: '#3498db', 
          color: 'white', 
          textDecoration: 'none', 
          borderRadius: '6px' 
        }}
      >
        Download File
      </a>
    </div>
  );

  const renderContent = () => {
    if (loading) {
      return <div className="loading">Loading document...</div>;
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
      return <div className="loading">No content to display</div>;
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
      default:
        return renderUnsupported();
    }
  };

  return (
    <div className="document-content">
      {renderContent()}
      {documentData.watermark_enabled && (
        <div className="watermark">NAVVIPAL</div>
      )}
    </div>
  );
};

export default DocumentViewer;

