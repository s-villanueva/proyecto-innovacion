import { Document, Stat } from './types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export const api = {
    async fetchDocuments(): Promise<Document[]> {
        const response = await fetch(`${API_BASE}/documents`);
        if (!response.ok) throw new Error('Failed to fetch documents');
        return response.json();
    },

    async fetchStats(): Promise<Stat[]> {
        const response = await fetch(`${API_BASE}/stats`);
        if (!response.ok) throw new Error('Failed to fetch stats');
        return response.json();
    },

    async uploadDocument(file: File, tag: string): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('tag', tag);

        const response = await fetch(`${API_BASE}/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Upload failed');
        }
        return response.json();
    },

    async deleteDocument(id: string): Promise<void> {
        const response = await fetch(`${API_BASE}/documents/${id}`, {
            method: 'DELETE',
        });
        if (!response.ok) throw new Error('Failed to delete document');
    },

    async verifyDocument(id: string, hash: string): Promise<boolean> {
        const response = await fetch(`${API_BASE}/documents/${id}/verify?hash=${hash}`);
        if (!response.ok) throw new Error('Verification failed');
        const data = await response.json();
        return data.match;
    },

    async chatWithDocument(id: string, question: string): Promise<string> {
        const response = await fetch(`${API_BASE}/documents/${id}/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question }),
        });
        if (!response.ok) throw new Error('Chat failed');
        const data = await response.json();
        return data.answer;
    },

    async regenerateSummary(id: string): Promise<{ summary: string, category: string, validity: string }> {
        const response = await fetch(`${API_BASE}/documents/${id}/regenerate-summary`, {
            method: 'POST',
        });
        if (!response.ok) throw new Error('Summary regeneration failed');
        const data = await response.json();
        return {
            summary: data.summary,
            category: data.category,
            validity: data.validity
        };
    }
};
