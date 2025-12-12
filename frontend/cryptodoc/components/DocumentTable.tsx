import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Document } from '../types';

interface DocumentTableProps {
  documents: Document[];
  onViewInsights: (doc: Document) => void;
  onPreview: (doc: Document) => void;
  onDelete: (id: string) => void;
}

const getIconForType = (type: Document['type']) => {
  switch (type) {
    case 'pdf': return 'picture_as_pdf';
    case 'doc': return 'description';
    case 'image': return 'image';
    case 'sheet': return 'table_chart';
    default: return 'article';
  }
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  if (status === 'Verified') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-success/10 dark:bg-success/20 text-success border border-success/20">
        <span className="w-1.5 h-1.5 rounded-full bg-success"></span>
        Verified
      </span>
    );
  }
  if (status === 'Mining') {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 dark:bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse"></span>
        Mining
      </span>
    );
  }
  return null;
};

const AIStatus: React.FC<{ status: Document['aiStatus'] }> = ({ status }) => {
  if (status === 'Processed') {
    return (
      <div className="flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[18px] text-secondary">auto_awesome</span>
        <span className="text-xs font-medium text-text-main dark:text-white">Processed</span>
      </div>
    );
  }
  if (status === 'Queued') {
    return (
      <div className="flex items-center gap-1.5 opacity-50">
        <span className="material-symbols-outlined text-[18px]">hourglass_empty</span>
        <span className="text-xs font-medium text-text-main dark:text-white">Queued</span>
      </div>
    );
  }
  if (status === 'Failed') {
    return (
      <div className="flex items-center gap-1.5">
        <span className="material-symbols-outlined text-[18px] text-red-400">warning</span>
        <span className="text-xs font-medium text-text-main dark:text-white">Failed</span>
      </div>
    );
  }
  return null;
};

const ActionMenu: React.FC<{ 
  onView: () => void; 
  onPreview: () => void;
  onDelete: () => void; 
  isOpen: boolean; 
  close: () => void; 
}> = ({ onView, onPreview, onDelete, isOpen, close }) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        close();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, close]);

  if (!isOpen) return null;

  return (
    <div ref={ref} className="absolute right-0 top-8 z-10 w-48 rounded-lg bg-white dark:bg-[#1e2a40] shadow-xl border border-[#e5e7eb] dark:border-[#324467] py-1 animate-in fade-in zoom-in-95 duration-100">
      <button 
        onClick={(e) => { e.stopPropagation(); onPreview(); close(); }}
        className="w-full text-left px-4 py-2 text-sm text-text-main dark:text-white hover:bg-[#f0f2f5] dark:hover:bg-[#324467] flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-[18px]">visibility</span>
        Preview File
      </button>
      <button 
        onClick={(e) => { e.stopPropagation(); onView(); close(); }}
        className="w-full text-left px-4 py-2 text-sm text-text-main dark:text-white hover:bg-[#f0f2f5] dark:hover:bg-[#324467] flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-[18px]">analytics</span>
        View Insights
      </button>
      <div className="h-[1px] bg-[#e5e7eb] dark:bg-[#324467] my-1"></div>
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(); close(); }}
        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2"
      >
        <span className="material-symbols-outlined text-[18px]">delete</span>
        Delete
      </button>
    </div>
  );
};

export const DocumentTable: React.FC<DocumentTableProps> = ({ documents, onViewInsights, onPreview, onDelete }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const filteredDocs = useMemo(() => {
    return documents.filter(doc => 
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      doc.hash.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [documents, searchTerm]);

  return (
    <div className="flex flex-col bg-white dark:bg-[#1a2436] rounded-xl border border-[#e5e7eb] dark:border-[#324467] shadow-sm overflow-hidden min-h-[400px]">
      {/* Filters Toolbar */}
      <div className="p-4 border-b border-[#e5e7eb] dark:border-[#324467] flex flex-col lg:flex-row gap-4 justify-between items-center bg-[#f9fafb] dark:bg-[#151d2b]">
        {/* Search */}
        <div className="w-full lg:max-w-md relative group">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#92a4c9] group-focus-within:text-secondary transition-colors">
            search
          </span>
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white dark:bg-[#232f48] border border-[#e5e7eb] dark:border-transparent text-text-main dark:text-white placeholder-[#92a4c9] focus:outline-none focus:ring-2 focus:ring-secondary/50 text-sm transition-all"
            placeholder="Search by document name or hash..."
          />
        </div>
        {/* Action Chips */}
        <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 no-scrollbar">
          <button className="flex items-center gap-2 h-9 px-3 rounded-lg border border-[#e5e7eb] dark:border-[#324467] bg-white dark:bg-[#232f48] hover:bg-[#f0f2f5] dark:hover:bg-[#324467] transition-colors whitespace-nowrap">
            <span className="text-text-main dark:text-white text-sm font-medium">Status: All</span>
            <span className="material-symbols-outlined text-[#637588] dark:text-[#92a4c9] text-[20px]">expand_more</span>
          </button>
          <button className="flex items-center gap-2 h-9 px-3 rounded-lg border border-[#e5e7eb] dark:border-[#324467] bg-white dark:bg-[#232f48] hover:bg-[#f0f2f5] dark:hover:bg-[#324467] transition-colors whitespace-nowrap">
            <span className="text-text-main dark:text-white text-sm font-medium">Date Range</span>
            <span className="material-symbols-outlined text-[#637588] dark:text-[#92a4c9] text-[20px]">calendar_month</span>
          </button>
          <button className="flex items-center gap-2 h-9 px-3 rounded-lg border border-[#e5e7eb] dark:border-[#324467] bg-white dark:bg-[#232f48] hover:bg-[#f0f2f5] dark:hover:bg-[#324467] transition-colors whitespace-nowrap">
            <span className="material-symbols-outlined text-[#637588] dark:text-[#92a4c9] text-[20px]">filter_list</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f9fafb] dark:bg-[#1e2a40] border-b border-[#e5e7eb] dark:border-[#324467]">
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#637588] dark:text-[#92a4c9] whitespace-nowrap">Document Name</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#637588] dark:text-[#92a4c9] whitespace-nowrap">Date Uploaded</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#637588] dark:text-[#92a4c9] whitespace-nowrap">Blockchain Hash</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#637588] dark:text-[#92a4c9] whitespace-nowrap">AI Status</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#637588] dark:text-[#92a4c9] whitespace-nowrap">Status</th>
              <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#637588] dark:text-[#92a4c9] text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#324467]">
            {filteredDocs.length > 0 ? (
              filteredDocs.map((doc) => (
                <tr key={doc.id} className="group hover:bg-[#f0f2f5] dark:hover:bg-[#232f48] transition-colors relative">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded bg-[#f0f2f5] dark:bg-[#324467] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[#637588] dark:text-[#92a4c9]">
                          {getIconForType(doc.type)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-text-main dark:text-white cursor-pointer hover:text-secondary transition-colors" onClick={() => onViewInsights(doc)}>{doc.name}</p>
                        <p className="text-xs text-[#637588] dark:text-[#92a4c9]">{doc.size} • {doc.category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-text-main dark:text-[#e2e8f0] whitespace-nowrap">{doc.date}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 group/hash cursor-pointer">
                      <code className="bg-[#f0f2f5] dark:bg-[#101622] px-2 py-1 rounded text-xs text-[#637588] dark:text-[#92a4c9] font-mono border border-[#e5e7eb] dark:border-[#324467]">
                        {doc.hash}
                      </code>
                      <span className="material-symbols-outlined text-[16px] text-[#92a4c9] opacity-0 group-hover/hash:opacity-100 transition-opacity">content_copy</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <AIStatus status={doc.aiStatus} />
                  </td>
                  <td className="p-4">
                    <StatusBadge status={doc.verificationStatus} />
                  </td>
                  <td className="p-4 text-right relative">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setOpenMenuId(openMenuId === doc.id ? null : doc.id);
                      }}
                      className={`text-[#92a4c9] hover:text-white p-2 rounded-full transition-colors ${openMenuId === doc.id ? 'bg-[#324467] text-white' : 'hover:bg-[#324467]'}`}
                    >
                      <span className="material-symbols-outlined text-[20px]">more_vert</span>
                    </button>
                    <ActionMenu 
                      isOpen={openMenuId === doc.id} 
                      onView={() => onViewInsights(doc)} 
                      onPreview={() => onPreview(doc)}
                      onDelete={() => onDelete(doc.id)}
                      close={() => setOpenMenuId(null)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="p-8 text-center text-[#637588] dark:text-[#92a4c9]">
                  <div className="flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-4xl opacity-50">search_off</span>
                    <p>No documents found matching "{searchTerm}"</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t border-[#e5e7eb] dark:border-[#324467] bg-[#f9fafb] dark:bg-[#151d2b]">
        <p className="text-xs text-[#637588] dark:text-[#92a4c9]">
          Showing <span className="font-bold text-text-main dark:text-white">{filteredDocs.length > 0 ? 1 : 0}-{Math.min(4, filteredDocs.length)}</span> of <span className="font-bold text-text-main dark:text-white">{filteredDocs.length}</span> documents
        </p>
        <div className="flex gap-2">
          <button className="p-1 rounded-md text-[#637588] dark:text-[#92a4c9] hover:bg-[#e5e7eb] dark:hover:bg-[#324467] disabled:opacity-50">
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button className="p-1 rounded-md text-[#637588] dark:text-[#92a4c9] hover:bg-[#e5e7eb] dark:hover:bg-[#324467]">
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};