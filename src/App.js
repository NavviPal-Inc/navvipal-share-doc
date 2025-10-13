import React, { useState, useEffect } from 'react';
import DocumentViewer from './components/DocumentViewer';
import Header from './components/Header';
import AppDownloadBanner from './components/AppDownloadBanner';
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

    if (shareIdFromUrl) {
      return shareIdFromUrl;
    }

    return null;
  };

  useEffect(() => {
    loadDocument();
  }, []);

  const loadDocument = async () => {
    try {
      setLoading(true);
      setError(null);

      const shareId = getShareId();

      if (!shareId) {
        setDocumentData(null);
        setHasViewed(false);
        setError('This secure document link is missing a reference. Please open the exact link provided in your NavviPal email.');
        return;
      }

      // Check if document has already been viewed (for view-once functionality)
      if (apiService.hasBeenViewed()) {
        setError('This document can only be viewed once and has already been accessed.');
        setHasViewed(true);
        return;
      }

      const data = await apiService.fetchDocumentDetails(shareId);
      setDocumentData(data);

      // Mark as viewed if view_once is true
      if (data.view_once) {
        apiService.markAsViewed();
        setHasViewed(true);
      } else {
        setHasViewed(false);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!documentData || documentData.no_download) return;

    try {
      const blob = await apiService.fetchDocumentContent(documentData.s3_url);
      const url = URL.createObjectURL(blob);
      const fileName = documentData.s3_url.split('/').pop().split('?')[0];

      const link = document.createElement('a');
      link.href = url;
      link.download = decodeURIComponent(fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Download failed:', err);
      alert('Failed to download document. Please try again.');
    }
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
      <Header
        documentData={documentData}
        onDownload={handleDownload}
      />

      <DocumentViewer
        documentData={documentData}
        s3Url={documentData.s3_url}
      />

      <AppDownloadBanner />
    </div>
  );
}

export default App;
