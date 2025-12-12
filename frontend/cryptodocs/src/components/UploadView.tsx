import React, { useState } from 'react';
import { api } from '../api';

interface UploadViewProps {
  onUploadSuccess?: () => void;
}

export const UploadView: React.FC<UploadViewProps> = ({ onUploadSuccess }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [tags, setTags] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Simulate AI Tag Generation
  const generateAITags = (file: File) => {
    setIsAnalyzing(true);
    setTags(''); // Reset

    // Simulate network delay
    setTimeout(() => {
      const fileName = file.name.toLowerCase();
      let detectedTags = ['Document'];

      if (fileName.includes('invoice') || fileName.includes('receipt') || fileName.includes('bill')) {
        detectedTags.push('Finance', 'Expense');
      } else if (fileName.includes('contract') || fileName.includes('agreement') || fileName.includes('legal')) {
        detectedTags.push('Legal', 'Contract');
      } else if (fileName.includes('report') || fileName.includes('audit')) {
        detectedTags.push('Business', 'Report');
      } else if (fileName.includes('id') || fileName.includes('passport') || fileName.includes('scan')) {
        detectedTags.push('Identity', 'KYC');
      } else {
        detectedTags.push('General', 'Pending Review');
      }

      setTags(detectedTags.join(', '));
      setIsAnalyzing(false);
    }, 1500);
  };

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
      generateAITags(file);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      generateAITags(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setIsUploading(true);
    try {
      await api.uploadDocument(selectedFile, tags);
      alert("Upload successful!");
      if (onUploadSuccess) {
        onUploadSuccess();
      }
    } catch (error: any) {
      alert("Upload failed: " + error.message);
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
            accept=".pdf,application/pdf"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            onChange={handleChange}
            disabled={isUploading}
          />

          {selectedFile ? (
            <div className="flex flex-col items-center gap-3">
              <div className="size-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                <span className="material-symbols-outlined text-4xl">picture_as_pdf</span>
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
                  setIsAnalyzing(false);
                }}
                className="text-red-500 hover:text-red-600 text-sm font-medium z-20 hover:underline"
                disabled={isUploading}
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
                <p className="text-[#637588] dark:text-[#92a4c9] text-sm">PDF files only (max. 20MB)</p>
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
              placeholder="e.g. Q3 Financial Report"
              className="px-4 py-2.5 rounded-lg bg-[#f9fafb] dark:bg-[#232f48] border border-[#e5e7eb] dark:border-[#324467] text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all"
              disabled={isUploading}
            />
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-text-main dark:text-white">Tags / Category</label>
              {isAnalyzing && (
                <span className="text-xs font-bold text-secondary flex items-center gap-1 animate-pulse">
                  <span className="material-symbols-outlined text-[14px] animate-spin">refresh</span>
                  AI Analyzing...
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[#92a4c9] text-[18px]">
                {isAnalyzing ? 'auto_awesome' : 'label'}
              </span>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder={isAnalyzing ? "AI is generating tags..." : "e.g. Finance, Confidential"}
                className={`w-full pl-10 px-4 py-2.5 rounded-lg bg-[#f9fafb] dark:bg-[#232f48] border text-text-main dark:text-white focus:outline-none focus:ring-2 focus:ring-secondary/50 transition-all ${isAnalyzing ? 'border-secondary/50' : 'border-[#e5e7eb] dark:border-[#324467]'}`}
                disabled={isUploading}
              />
            </div>
          </div>
        </div>

        {/* Options */}
        <div className="flex flex-col gap-4 border-t border-[#e5e7eb] dark:border-[#324467] pt-6">
          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-secondary focus:ring-secondary bg-gray-100 dark:bg-[#232f48] dark:border-[#324467]" defaultChecked disabled={isUploading} />
            <div className="flex flex-col">
              <span className="text-sm font-bold text-text-main dark:text-white group-hover:text-secondary transition-colors">Run AI Analysis</span>
              <span className="text-xs text-[#637588] dark:text-[#92a4c9]">Automatically extract insights and summaries upon upload.</span>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer group">
            <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-secondary focus:ring-secondary bg-gray-100 dark:bg-[#232f48] dark:border-[#324467]" defaultChecked disabled={isUploading} />
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
                <span className="material-symbols-outlined animate-spin">refresh</span>
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