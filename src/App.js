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
  const [isExpired, setIsExpired] = useState(false);
  const [isHeaderHidden, setIsHeaderHidden] = useState(false);

  // Extract share_id from URL query parameters
  const getShareId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const shareIdFromUrl = urlParams.get('share_id');

    if (!shareIdFromUrl) {
      throw new Error('This secure document link is missing a reference. Please open the exact link provided in your NavviPal email.');
    }

    return shareIdFromUrl;
  };

  // Check if document has expired
  const checkIfExpired = (expiryDate) => {
    if (!expiryDate) {
      return false;
    }

    try {
      const now = new Date();
      
      // Ensure the date is treated as UTC
      let utcDateString = expiryDate;
      
      // If date has 'T' but no 'Z' and no timezone offset, add 'Z' to treat as UTC
      if (expiryDate.includes('T') && !expiryDate.includes('Z') && !expiryDate.includes('+') && !expiryDate.includes('-', 10)) {
        utcDateString = expiryDate + 'Z';
      }
      
      const expiryDateObj = new Date(utcDateString);
      
      // Validate the parsed date
      if (isNaN(expiryDateObj.getTime())) {
        console.error('Invalid expiry date:', expiryDate);
        return false;
      }
      
      return now.getTime() >= expiryDateObj.getTime();
    } catch (err) {
      console.error('Error checking expiry date:', err);
      return false;
    }
  };

  useEffect(() => {
    loadDocument();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const viewerEl = document.querySelector('.document-viewer');

    const handleScroll = () => {
      const viewerScrollTop = viewerEl?.scrollTop ?? 0;
      const windowScrollTop = typeof window !== 'undefined' ? window.scrollY : 0;
      const scrollPosition = Math.max(windowScrollTop, viewerScrollTop);
      setIsHeaderHidden(scrollPosition > 20);
    };

    if (!viewerEl) {
      setIsHeaderHidden(false);
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    viewerEl?.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      viewerEl?.removeEventListener('scroll', handleScroll);
    };
  }, [documentData]);

  // Periodically check if document has expired while viewing
  useEffect(() => {
    if (documentData?.expiry_date) {
      const intervalId = setInterval(() => {
        if (checkIfExpired(documentData.expiry_date)) {
          setIsExpired(true);
          setError('This document has expired and is no longer available.');
          setDocumentData(null);
        }
      }, 60000);

      return () => clearInterval(intervalId);
    }
  }, [documentData]);

  const loadDocument = async () => {
    try {
      setLoading(true);
      setError(null);
      setIsExpired(false);
      setHasViewed(false);

      const shareId = getShareId();

      // Check if document has already been viewed (for view-once functionality)
      if (apiService.hasBeenViewed()) {
        setError('This document can only be viewed once and has already been accessed.');
        setHasViewed(true);
        return;
      }

      const data = await apiService.fetchDocumentDetails(shareId);

      if (checkIfExpired(data.expiry_date)) {
        setIsExpired(true);
        setError('This document has expired and is no longer available.');
        setDocumentData(null);
        return;
      }

      setDocumentData(data);

      // Mark as viewed if view_once is true
      if (data.view_once) {
        apiService.markAsViewed();
        setHasViewed(true);
      } else {
        setHasViewed(false);
      }
    } catch (err) {
      console.error('Document load failed:', err);
      setError(err.message);
      setDocumentData(null);
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

  const containerClassName = isHeaderHidden ? 'container header-hidden' : 'container';

  if (loading) {
    return (
      <div className={containerClassName}>
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading document...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={containerClassName}>
        <div className="error">
          <div className="error-icon">{isExpired ? '⏰' : '⚠️'}</div>
          <h2>{isExpired ? 'Document Expired' : 'Unable to Load Document'}</h2>
          <p>{error}</p>
          {isExpired ? (
            <p className="error-detail">
              This document is no longer accessible as it has passed its expiration date.
            </p>
          ) : (
            !hasViewed && (
              <button className="retry-button" onClick={loadDocument}>
                Try Again
              </button>
            )
          )}
        </div>
      </div>
    );
  }

  if (!documentData) {
    return (
      <div className={containerClassName}>
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
    <div className={containerClassName}>
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
