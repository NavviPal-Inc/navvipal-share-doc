import React from 'react';

const DocumentMetadata = ({ documentData, children }) => {
  const cleanDocumentTitle = (rawTitle) => {
    if (!rawTitle) return 'Document.pdf';

    const decodedTitle = decodeURIComponent(rawTitle);
    const sanitized = decodedTitle.split('?')[0];
    const fileSegment = sanitized.split('/').pop();
    const withoutExtension = fileSegment.replace(/\.[^/.]+$/, '');

    return withoutExtension.trim() || 'Document.pdf';
  };

  const formatExpiryDate = (dateString) => {
    if (!dateString) return 'Never';

    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return 'Unknown';
    }
  };

  const getDocumentId = () => {
    if (documentData.document_id) return documentData.document_id;
    if (documentData.share_id) {
      return `DOC-${documentData.share_id.substring(0, 8).toUpperCase()}`;
    }
    return 'N/A';
  };

  const metadataItems = [
    {
      label: 'Document ID',
      value: getDocumentId()
    },
    {
      label: 'Shared By',
      value: documentData.shared_by || documentData.owner || 'Anonymous'
    },
    {
      label: 'Expires',
      value: formatExpiryDate(documentData.expiry_date)
    },
    {
      label: 'Access Type',
      value: documentData.view_once ? (
        <span className="badge badge-warning metadata-badge">View Once</span>
      ) : (
        <span className="badge badge-info metadata-badge">Multiple Views</span>
      )
    }
  ];

  return (
    <header className="document-metadata">
      <h1 className="document-title">
        {cleanDocumentTitle(documentData.document_name || documentData.s3_url)}
      </h1>

      <div className="metadata-grid">
        {metadataItems.map(({ label, value }) => (
          <div className="metadata-item" key={label}>
            <span className="metadata-label">{label}</span>
            <span className="metadata-value">{value}</span>
          </div>
        ))}
        {children}
      </div>
    </header>
  );
};

export default DocumentMetadata;
