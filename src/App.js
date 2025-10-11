import React, { useState, useEffect } from 'react';
import DocumentViewer from './components/DocumentViewer';
import CountdownTimer from './components/CountdownTimer';
import Header from './components/Header';
import apiService from './services/api';
import './App.css';

function App() {
  const [documentData, setDocumentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasViewed, setHasViewed] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // Extract share_id from URL query parameters
  const getShareId = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const shareIdFromUrl = urlParams.get('share_id');
    
    if (!shareIdFromUrl) {
      throw new Error('Share ID is required. Please provide a valid share_id in the URL parameters.');
    }
    
    return shareIdFromUrl;
  };

  // Check if document has expired
  const checkIfExpired = (expiryDate) => {
    if (!expiryDate) {
      return false; // No expiry date means document doesn't expire
    }

    try {
      const expiryDateObj = new Date(expiryDate);
      const now = new Date();
      
      // Parse expiry time properly with timezone handling
      let expiryTime;
      if (expiryDate.includes('Z') || expiryDate.includes('+') || expiryDate.includes('T')) {
        expiryTime = expiryDateObj.getTime();
      } else {
        expiryTime = Date.UTC(
          expiryDateObj.getUTCFullYear(),
          expiryDateObj.getUTCMonth(),
          expiryDateObj.getUTCDate(),
          expiryDateObj.getUTCHours(),
          expiryDateObj.getUTCMinutes(),
          expiryDateObj.getUTCSeconds()
        );
      }
      
      return now.getTime() >= expiryTime;
    } catch (error) {
      console.error('Error checking expiry date:', error);
      return false;
    }
  };

  useEffect(() => {
    loadDocument();
  }, []);

  // Periodically check if document has expired while viewing
  useEffect(() => {
    if (documentData && documentData.expiry_date) {
      const checkExpiry = () => {
        if (checkIfExpired(documentData.expiry_date)) {
          setIsExpired(true);
          setError('This document has expired and is no longer available.');
          setDocumentData(null);
        }
      };

      // Check every 1 minute (60 seconds)
      const intervalId = setInterval(checkExpiry, 60000);

      return () => clearInterval(intervalId);
    }
  }, [documentData]);

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
      
      // Check if document has expired
      if (checkIfExpired(data.expiry_date)) {
        setIsExpired(true);
        setError('This document has expired and is no longer available.');
        return;
      }
      
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
        <Header />
        <div className="error">
          {isExpired ? (
            <>
              <div className="error-icon">⏰</div>
              <h2>Document Expired</h2>
              <p>{error}</p>
              <p className="error-detail">
                This document is no longer accessible as it has passed its expiration date.
              </p>
            </>
          ) : (
            <>
              <div className="error-icon">⚠️</div>
              <h2>Unable to Load Document</h2>
              <p>{error}</p>
              {!hasViewed && !isExpired && (
                <button className="retry-button" onClick={loadDocument}>
                  Try Again
                </button>
              )}
            </>
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
      <Header />
      <div className="document-viewer">
        {/* Floating Expiry Timer - only show if expiry date exists */}
        {documentData.expiry_date && (
          <div className="expiry-controls">
            <CountdownTimer expiryDate={documentData.expiry_date} />
          </div>
        )}
        
        <DocumentViewer 
          documentData={documentData} 
          s3Url={documentData.s3_url} 
        />
      </div>
    </div>
  );
}

export default App;
