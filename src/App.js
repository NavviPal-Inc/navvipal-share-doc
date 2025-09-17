import React, { useState, useEffect } from 'react';
import DocumentViewer from './components/DocumentViewer';
import apiService from './services/api';
import './App.css';

function App() {
  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasViewed, setHasViewed] = useState(false);

  // Extract share_id from URL query parameters
  const getShareId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const shareIdFromUrl = urlParams.get('share_id');
    
    if (!shareIdFromUrl) {
      throw new Error('Share ID is required. Please provide a valid share_id in the URL parameters.');
    }
    
    return shareIdFromUrl;
  };

  useEffect(() => {
    loadDocument();
  }, []);

  const loadDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if document has already been viewed (for view-once functionality)
      if (apiService.hasBeenViewed()) {
        setError('This document can only be viewed once and has already been accessed.');
        setHasViewed(true);
        return;
      }

      const shareId = getShareId();
      const data = await apiService.fetchDocumentDetails(shareId);
      
      setDocumentData(data);
      
      // Mark as viewed if view_once is true
      if (data.view_once) {
        apiService.markAsViewed();
        setHasViewed(true);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Unknown';
    }
  };

  const getFileTypeFromUrl = (url) => {
    const fileName = url.split('/').pop().toLowerCase();
    if (fileName.includes('.pdf')) return 'PDF';
    if (fileName.includes('.jpg') || fileName.includes('.jpeg')) return 'JPEG Image';
    if (fileName.includes('.png')) return 'PNG Image';
    if (fileName.includes('.gif')) return 'GIF Image';
    if (fileName.includes('.csv')) return 'CSV Spreadsheet';
    if (fileName.includes('.xlsx')) return 'Excel Spreadsheet';
    if (fileName.includes('.xls')) return 'Excel Spreadsheet';
    return 'Document';
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container">
        <div className="error">
          <h2>Unable to Load Document</h2>
          <p>{error}</p>
          {!hasViewed && (
            <button className="retry-button" onClick={loadDocument}>
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!documentData) {
    return (
      <div className="container">
        <div className="error">
          <h2>No Document Data</h2>
          <p>No document information was received from the server.</p>
          <button className="retry-button" onClick={loadDocument}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="document-viewer">
        <div className="document-header">
          <h1>Shared Document</h1>
          <div className="document-info">
            <p><strong>File Type:</strong> {getFileTypeFromUrl(documentData.s3_url)}</p>
            <p><strong>Access Level:</strong> {documentData.access}</p>
            <p><strong>Expires:</strong> {formatDate(documentData.expiry_date)}</p>
            {documentData.view_once && (
              <p><strong>View Policy:</strong> One-time view only</p>
            )}
            {documentData.watermark_enabled && (
              <p><strong>Watermark:</strong> Enabled</p>
            )}
          </div>
        </div>
        
        <DocumentViewer 
          documentData={documentData} 
          s3Url={documentData.s3_url} 
        />
      </div>
    </div>
  );
}

export default App;
