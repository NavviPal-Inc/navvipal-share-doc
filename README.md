# Shared Document Viewer

A React application for viewing shared documents with watermark and view-once functionality.

## Features

- **Multi-format Support**: View images (JPG, PNG, GIF, WebP), PDFs, CSV files, and Excel spreadsheets
- **Watermark Protection**: Displays "NAVVIPAL" watermark when enabled
- **View-Once Security**: Prevents multiple views when `view_once` is set to true
- **Responsive Design**: Modern UI that works on desktop and mobile devices
- **Error Handling**: Comprehensive error handling with retry functionality

## API Integration

The app integrates with the document service API:
- **Endpoint**: `https://doc-service.navvipal.com/documents/shared`
- **Parameters**: `share_id` (document identifier)
- **Response**: Document metadata including S3 URL, access settings, and security options

## Document Types Supported

1. **Images**: JPG, JPEG, PNG, GIF, WebP
2. **PDFs**: Full PDF viewer with page navigation
3. **CSV Files**: Tabular data display with first 100 rows
4. **Excel Files**: Spreadsheet data display with first 100 rows
5. **Other Files**: Download link for unsupported formats

## Security Features

- **View-Once Protection**: Documents marked with `view_once: true` can only be accessed once
- **Watermark Display**: Shows "NAVVIPAL" watermark when `watermark_enabled: true`
- **Access Control**: Respects document access levels and expiry dates
- **Error Handling**: Graceful handling of expired, deleted, or restricted documents

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open [http://localhost:3000](http://localhost:3000) to view the app

## Usage

The app requires a share ID to be provided as a URL parameter. Use the following URL format:

```
http://localhost:3000/doc?share_id=your-share-id-here
```

**Example:**
```
http://localhost:3000/doc?share_id=f2517c85-620c-4789-8efd-a8d2db159df5
```

**Note:** The `share_id` parameter is required. If not provided, the app will display an error message asking for a valid share ID.

## Dependencies

- **React 18**: UI framework
- **Axios**: HTTP client for API calls
- **React-PDF**: PDF document rendering
- **XLSX**: Excel file parsing
- **PapaParse**: CSV file parsing

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Error Handling

The app handles various error scenarios:
- Network timeouts
- Document not found (404)
- Access denied (403)
- Already viewed (410)
- Corrupted or inaccessible files
- Unsupported file formats
