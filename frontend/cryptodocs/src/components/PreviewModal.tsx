import React from 'react';
import type { Document } from '../types';

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

    // Always show PDF preview
    return (
      <iframe
        src={document.url}
        className="w-full h-[80vh] rounded-lg shadow-lg bg-white"
        title="PDF Preview"
      ></iframe>
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