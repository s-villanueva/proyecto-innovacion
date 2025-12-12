import React from 'react';
import { Document } from '../types';

interface PreviewModalProps {
  document: Document;
  onClose: () => void;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({ document, onClose }) => {
  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const renderContent = () => {
    if (!document.url) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-[#637588] dark:text-[#92a4c9]">
          <span className="material-symbols-outlined text-4xl mb-2">broken_image</span>
          <p>No preview URL available.</p>
        </div>
      );
    }

    if (document.type === 'image') {
      return (
        <img 
          src={document.url} 
          alt={document.name} 
          className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-lg"
        />
      );
    }

    if (document.type === 'pdf') {
      return (
        <iframe 
          src={document.url} 
          className="w-full h-[80vh] rounded-lg shadow-lg bg-white"
          title="PDF Preview"
        ></iframe>
      );
    }

    // Fallback for other types
    return (
      <div className="flex flex-col items-center justify-center h-64 bg-[#f0f2f5] dark:bg-[#232f48] rounded-xl p-8 text-center">
        <span className="material-symbols-outlined text-5xl text-[#637588] dark:text-[#92a4c9] mb-4">
          {document.type === 'sheet' ? 'table_chart' : 'description'}
        </span>
        <h3 className="text-lg font-bold text-text-main dark:text-white mb-2">
          Preview not supported for this file type
        </h3>
        <p className="text-[#637588] dark:text-[#92a4c9] mb-4 max-w-sm">
          This file type ({document.type}) cannot be previewed directly in the browser.
        </p>
        <a 
          href={document.url} 
          target="_blank" 
          rel="noopener noreferrer"
          className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-blue-600 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined">download</span>
          Download to View
        </a>
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white dark:bg-[#1a2436] w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-[#e5e7eb] dark:border-[#324467]">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#e5e7eb] dark:border-[#324467] bg-[#f9fafb] dark:bg-[#151d2b]">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#e5e7eb] dark:bg-[#324467] rounded-lg">
              <span className="material-symbols-outlined text-text-main dark:text-white">visibility</span>
            </div>
            <div>
              <h3 className="text-lg font-bold text-text-main dark:text-white leading-tight">
                {document.name}
              </h3>
              <p className="text-xs text-[#637588] dark:text-[#92a4c9]">
                {document.size} • {document.type.toUpperCase()}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-[#e5e7eb] dark:hover:bg-[#324467] rounded-full transition-colors text-[#637588] dark:text-[#92a4c9]"
          >
            <span className="material-symbols-outlined text-2xl">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#f0f2f5] dark:bg-[#0d121c]">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};