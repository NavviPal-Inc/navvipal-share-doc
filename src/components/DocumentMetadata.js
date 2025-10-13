import React from 'react';

const DocumentMetadata = ({ documentData, children, compact = false }) => {
  const cleanDocumentTitle = (rawTitle) => {
    if (!rawTitle) return 'Document.pdf';

    try {
      const decodedTitle = decodeURIComponent(rawTitle);
      const sanitized = decodedTitle.split('?')[0];
      const fileSegment = sanitized.split('/').pop();
      const withoutExtension = fileSegment.replace(/\.[^/.]+$/, '');

      return withoutExtension.trim() || 'Document.pdf';
    } catch (error) {
      return 'Document.pdf';
    }
  };

  const content = (
    <div className="metadata-header-row">
      <h1 className="document-title">
        {cleanDocumentTitle(documentData.document_name || documentData.s3_url)}
      </h1>

      {children}
    </div>
  );

  if (compact) {
    return content;
  }

  return (
    <header className="document-metadata">
      {content}
    </header>
  );
};

export default DocumentMetadata;
