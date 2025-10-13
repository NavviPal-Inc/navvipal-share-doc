import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://doc-service.navvipal.com';

class ApiService {
  constructor() {
    this.viewedOnce = false;
  }

  async fetchDocumentDetails(shareId) {
    if (!shareId) {
      throw new Error('Missing document identifier. Please open the original secure share link.');
    }

    try {
      const response = await axios.get(`${API_BASE_URL}/documents/shared`, {
        params: { share_id: shareId },
        timeout: 10000
      });

      return response.data;
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 403) {
        throw new Error('Document not found or access denied. This document may have been viewed already or the link has expired.');
      } else if (error.response?.status === 410) {
        throw new Error('This document can only be viewed once and has already been accessed.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('Request timeout. Please check your internet connection and try again.');
      } else {
        throw new Error('Failed to load document. Please try again later.');
      }
    }
  }

  async fetchDocumentContent(s3Url) {
    if (!s3Url) {
      throw new Error('Missing document URL. Unable to load document content.');
    }

    try {
      const response = await axios.get(s3Url, {
        responseType: 'blob',
        timeout: 30000
      });

      return response.data;
    } catch (error) {
      throw new Error('Failed to load document content. The file may be corrupted or inaccessible.');
    }
  }

  markAsViewed() {
    this.viewedOnce = true;
  }

  hasBeenViewed() {
    return this.viewedOnce;
  }
}

export default new ApiService();
