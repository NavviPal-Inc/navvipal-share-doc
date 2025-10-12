import React from 'react';

const DocumentMetadata = ({ documentData }) => {
  const formatExpiryDate = (dateString) => {
    if (!dateString) return 'No expiration';
    
    try {
      const date = new Date(dateString);
      const options = { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      };
      return date.toLocaleDateString('en-US', options);
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getDocumentId = () => {
    if (documentData.document_id) return documentData.document_id;
    if (documentData.share_id) return `DOC-${documentData.share_id.substring(0, 8).toUpperCase()}`;
    return 'N/A';
  };

  const getDocumentTitle = () => {
    if (documentData.document_name) return documentData.document_name;
    if (documentData.s3_url) {
      const fileName = documentData.s3_url.split('/').pop().split('?')[0];
      return decodeURIComponent(fileName);
    }
    return 'Shared Document';
  };

  return (
    <div className="document-metadata">
      <h1 className="document-title">{getDocumentTitle()}</h1>
      
      <div className="metadata-grid">
        <div className="metadata-item">
          <span className="metadata-label">Document ID</span>
          <span className="metadata-value">{getDocumentId()}</span>
        </div>

        <div className="metadata-item">
          <span className="metadata-label">Shared By</span>
          <span className="metadata-value">
            {documentData.shared_by || documentData.owner || 'Anonymous'}
          </span>
        </div>

        {documentData.expiry_date && (
          <div className="metadata-item">
            <span className="metadata-label">Expires</span>
            <span className="metadata-value">
              {formatExpiryDate(documentData.expiry_date)}
            </span>
          </div>
        )}

        <div className="metadata-item">
          <span className="metadata-label">Access Type</span>
          <span className="metadata-value">
            {documentData.view_once ? (
              <span className="badge badge-warning">View Once</span>
            ) : (
              <span className="badge badge-info">Multiple Views</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default DocumentMetadata;