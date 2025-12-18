import React, { useState } from 'react';
import { api } from '../services/api';
import { Document } from '../types';

interface UploadViewProps {
  onUploadComplete?: (doc: Document) => void;
}

export const UploadView: React.FC<UploadViewProps> = ({ onUploadComplete }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tags, setTags] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      // Auto-detect some basic tags based on filename
      const fileName = file.name.toLowerCase();
      const detectedTags = ['Document', 'Pending'];
      if (fileName.includes('invoice')) detectedTags.push('Finance');
      if (fileName.includes('contract')) detectedTags.push('Legal');
      setTags(detectedTags.join(', '));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Auto-detect some basic tags based on filename
      const fileName = file.name.toLowerCase();
      const detectedTags = ['Document', 'Pending'];
      if (fileName.includes('invoice')) detectedTags.push('Finance');
      if (fileName.includes('contract')) detectedTags.push('Legal');
      setTags(detectedTags.join(', '));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    setError(null);

    try {
      // Call the API service
      const newDoc = await api.uploadDocument(selectedFile, tags);

      if (newDoc) {
        if (onUploadComplete) {
          onUploadComplete(newDoc);
        } else {
          alert("Upload Successful!");
          setSelectedFile(null);
          setTags('');
        }
      }
    } catch (err: any) {
      console.error("Upload Error:", err);
      setError(err.message || "Upload failed due to server error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 animate-fade-in">
      <div className="flex flex-col gap-1">
        <h2 className="text-text-main dark:text-white text-2xl font-bold">Upload Document</h2>
        <p className="text-[#637588] dark:text-[#92a4c9]">
          Upload your files to securely hash them on the blockchain and analyze them with AI.
        </p>
      </div>

      <div className="flex flex-col gap-6 bg-white dark:bg-[#1a2436] p-6 rounded-xl border border-[#e5e7eb] dark:border-[#324467] shadow-sm">

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm font-medium">
            <span className="material-symbols-outlined text-[18px]">error</span>
            {error}
          </div>
        )}

        {/* Drag & Drop Zone */}
        <div
          className={`relative flex flex-col items-center justify-center w-full h-64 rounded-xl border-2 border-dashed transition-all duration-300 ${dragActive
              ? "border-secondary bg-secondary/5 scale-[1.01]"
              : "border-[#d1d5db] dark:border-[#324467] hover:border-secondary/50 hover:bg-[#f9fafb] dark:hover:bg-[#232f48]"
            }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            disabled={isUploading}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 disabled:cursor-not-allowed"
            onChange={handleChange}
          />

          {selectedFile ? (
            <div className="flex flex-col items-center gap-3">
              <div className="size-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-4xl">description</span>
              </div>
              <div className="text-center">
                <p className="text-text-main dark:text-white font-bold text-lg">{selectedFile.name}</p>
                <p className="text-[#637588] dark:text-[#92a4c9] text-sm">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedFile(null);
                  setTags('');
                }}
                disabled={isUploading}
                className="text-red-500 hover:text-red-600 text-sm font-medium z-20 hover:underline disabled:opacity-50"
              >
                Remove file
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 pointer-events-none">
              <div className="size-16 rounded-full bg-[#f0f2f5] dark:bg-[#232f48] flex items-center justify-center text-[#637588] dark:text-[#92a4c9]">
                <span className="material-symbols-outlined text-3xl">cloud_upload</span>
              </div>
              <div className="text-center">
                <p className="text-text-main dark:text-white font-bold text-lg">Click to upload or drag and drop</p>
                <p className="text-[#637588] dark:text-[#92a4c9] text-sm">SVG, PNG, JPG, PDF or DOCX (max. 20MB)</p>
              </div>
            </div>
          )}
        </div>

        {/* Metadata Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold text-text-main dark:text-white">Document Name</label>
            <input
              type="text"
              defaultValue={selectedFile?.name.split('.')[0] || ''}
              disabled={isUploading}
              placeholder="e.g. Q3 Financial Report"
              className="px-4 py-2.5 rounded-lg bg-[#f9fafb] dark:bg-[#232f48] border border-[#e5e7eb] dark:border-[#324467] text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all disabled:opacity-50"
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-text-main dark:text-white">Tags / Category</label>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#92a4c9] text-[18px]">
                label
              </span>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                disabled={isUploading}
                placeholder="e.g. Finance, Confidential"
                className="w-full pl-10 px-4 py-2.5 rounded-lg bg-[#f9fafb] dark:bg-[#232f48] border border-[#e5e7eb] dark:border-[#324467] text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all disabled:opacity-50"
              />
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-4 border-t border-[#e5e7eb] dark:border-[#324467] pt-6">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-secondary focus:ring-secondary bg-gray-100 dark:bg-[#232f48] dark:border-[#324467]" defaultChecked />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-text-main dark:text-white group-hover:text-secondary transition-colors">Run AI Analysis</span>
              <span className="text-xs text-[#637588] dark:text-[#92a4c9]">Automatically extract insights and summaries upon upload.</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-secondary focus:ring-secondary bg-gray-100 dark:bg-[#232f48] dark:border-[#324467]" defaultChecked />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-text-main dark:text-white group-hover:text-secondary transition-colors">Blockchain Verification</span>
              <span className="text-xs text-[#637588] dark:text-[#92a4c9]">Generate a unique hash and timestamp on the ledger.</span>
            </div>
          </label>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={handleUpload}
            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold text-white shadow-lg transition-all ${selectedFile && !isUploading
                ? "bg-primary hover:bg-blue-700 shadow-blue-500/20"
                : "bg-gray-400 cursor-not-allowed opacity-50"
              }`}
            disabled={!selectedFile || isUploading}
          >
            {isUploading ? (
              <>
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                Uploading...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">upload_file</span>
                Upload to Blockchain
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};