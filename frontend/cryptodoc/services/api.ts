import { Document, Stat } from '../types';

const API_BASE_URL = 'http://localhost:8080';

export const api = {
    uploadDocument: async (file: File, tag: string): Promise<any> => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('tag', tag);

        const response = await fetch(`${API_BASE_URL}/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Upload failed');
        }

        return response.json();
    },

    getDocuments: async (): Promise<Document[]> => {
        const response = await fetch(`${API_BASE_URL}/documents`);
        if (!response.ok) {
            throw new Error('Failed to fetch documents');
        }
        return response.json();
    },

    getStats: async (): Promise<Stat[]> => {
        const response = await fetch(`${API_BASE_URL}/stats`);
        if (!response.ok) {
            throw new Error('Failed to fetch stats');
        }
        return response.json();
    },

    deleteDocument: async (id: string): Promise<void> => {
        const response = await fetch(`${API_BASE_URL}/documents/${id}`, {
            method: 'DELETE',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Delete failed');
        }
    },

    getPreviewUrl: async (id: string): Promise<string> => {
        const response = await fetch(`${API_BASE_URL}/documents/${id}/preview`);
        if (!response.ok) {
            throw new Error('Failed to get preview URL');
        }
        const data = await response.json();
        return data.url;
    },

    chatWithDocument: async (id: string, question: string): Promise<string> => {
        const response = await fetch(`${API_BASE_URL}/documents/${id}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question }),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || 'Chat failed');
        }

        const data = await response.json();
        return data.answer;
    },

    regenerateSummary: async (id: string): Promise<any> => {
        const response = await fetch(`${API_BASE_URL}/documents/${id}/regenerate-summary`, {
            method: 'POST',
        });

        if (!response.ok) {
            throw new Error('Failed to regenerate summary');
        }

        return response.json();
    }
};
