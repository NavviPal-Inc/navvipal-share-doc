import React from 'react';
import navvipalLogo from './navvipal-logo-wit.svg';

const Header = ({ documentData, onDownload }) => {
  const canDownload = documentData && !documentData.no_download;

  const handleDownload = () => {
    if (canDownload && onDownload) {
      onDownload();
    }
  };

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="brand-logo">
          <img src={navvipalLogo} alt="NavviPal" className="brand-logo-image" />
        </div>
        
        <div className="header-actions">
          <button 
            className="header-btn header-btn-download"
            onClick={handleDownload}
            disabled={!canDownload}
            title={canDownload ? 'Download document' : 'Downloads disabled for this document'}
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
            </svg>
            Download
          </button>
          
          <a 
            href="https://apps.apple.com/app/navvipal" 
            className="header-btn header-btn-appstore" 
            target="_blank" 
            rel="noopener noreferrer"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
            </svg>
            App Store
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
