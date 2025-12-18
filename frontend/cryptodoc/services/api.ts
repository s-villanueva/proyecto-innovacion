import { Document } from '../types';

const API_BASE_URL = 'http://localhost:8080';

// Helper to handle potential field name differences between backend and frontend
const mapApiDataToDocument = (data: any): Document => {
  return {
    id: data.id || data._id || data.doc_id,
    name: data.name || data.filename || data.title || 'Untitled',
    size: data.size || '0 KB',
    date: data.date || data.created_at || data.uploaded_at || new Date().toISOString().split('T')[0],
    hash: data.hash || data.tx_hash || 'Pending...',
    aiStatus: data.aiStatus || data.ai_status || 'Queued',
    verificationStatus: data.verificationStatus || data.verification_status || 'Mining',
    type: data.type || data.file_type || 'doc',
    category: data.category || data.tag || 'Uncategorized',
    summary: data.summary || data.description || '',
    validity: data.validity || data.expiry_date || '',
    url: data.url || data.file_url || data.download_url
  };
};

export const api = {
  /**
   * Fetch all documents
   * Note: This sends a custom header 'ngrok-skip-browser-warning'.
   * This WILL trigger a CORS preflight (OPTIONS request).
   * Your backend MUST handle OPTIONS requests and allow this header.
   */
  getDocuments: async (): Promise<Document[]> => {
    // Only send essential headers for GET to reduce preflight complexity
    const headers = {
      'Accept': 'application/json',
      // 'ngrok-skip-browser-warning': 'true',
    };

    const response = await fetch(`${API_BASE_URL}/documents`, {
      method: 'GET',
      headers: headers,
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    // Check content type to ensure we got JSON and not the Ngrok HTML warning
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      // If we got HTML despite the header, it's likely an auth page or error page
      console.error("Received non-JSON response from API:", text.substring(0, 100) + "...");
      throw new Error("Received invalid response (not JSON). The API URL might be incorrect or blocking requests.");
    }

    const jsonData = await response.json();
    const list = Array.isArray(jsonData) ? jsonData : (jsonData.data || []);
    return list.map(mapApiDataToDocument);
  },

  /**
   * Upload a document
   */
  uploadDocument: async (file: File, tags: string): Promise<Document> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('tags', tags);

    // For POST with FormData, do NOT set Content-Type.
    // We only set the ngrok header.
    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload Failed: ${response.status} ${response.statusText}`);
    }

    const jsonData = await response.json();
    const docData = jsonData.data || jsonData;

    return mapApiDataToDocument(docData);
  },

  /**
   * Delete a document
   */
  deleteDocument: async (id: string): Promise<boolean> => {
    const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
      method: 'DELETE',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });
    return response.ok;
  },

  /**
   * Chat with a document
   */
  chatWithDocument: async (id: string, question: string): Promise<string> => {
    const response = await fetch(`${API_BASE_URL}/documents/${id}/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
      body: JSON.stringify({ question }),
    });

    if (!response.ok) {
      throw new Error(`Chat Failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.answer;
  },

  /**
   * Regenerate document summary
   */
  regenerateSummary: async (id: string): Promise<any> => {
    const response = await fetch(`${API_BASE_URL}/documents/${id}/regenerate-summary`, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      throw new Error(`Regeneration Failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  },

  /**
   * Get system stats
   */
  getStats: async (): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/stats`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'ngrok-skip-browser-warning': 'true',
      },
    });

    if (!response.ok) {
      throw new Error(`Stats Failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }
};
