import React from 'react';
import { Document } from '../types';

interface AnalyticsViewProps {
  documents: Document[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ documents }) => {
  // Helper to parse dates like "Dec 31, 2024" or "2024-12-31"
  const getDaysRemaining = (dateStr?: string) => {
    if (!dateStr) return null;

    // Handle "N/A", "Indefinido", "No aplica"
    const lowerDate = dateStr.toLowerCase();
    if (lowerDate.includes('n/a') || lowerDate.includes('indefinido') || lowerDate.includes('no aplica') || lowerDate.includes('vigente')) {
      return null;
    }

    const expiryDate = new Date(dateStr);
    if (isNaN(expiryDate.getTime())) return null;

    const today = new Date();
    // Reset hours to compare just dates
    today.setHours(0, 0, 0, 0);
    expiryDate.setHours(0, 0, 0, 0);

    const diffTime = expiryDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = (days: number) => {
    if (days < 0) return 'bg-red-500 text-white'; // Expired
    if (days <= 30) return 'bg-orange-500 text-white'; // Expiring soon
    return 'bg-success text-white'; // Valid
  };

  const getStatusLabel = (days: number) => {
    if (days < 0) return 'Expired';
    if (days <= 30) return 'Expiring Soon';
    return 'Valid';
  };

  const expiringDocs = documents
    .filter(doc => doc.validity)
    .map(doc => ({
      ...doc,
      daysRemaining: getDaysRemaining(doc.validity)
    }))
    .filter(doc => doc.daysRemaining !== null) // Filter out non-expiring docs
    .map(doc => ({
      ...doc,
      daysRemaining: doc.daysRemaining as number
    }))
    .sort((a, b) => a.daysRemaining - b.daysRemaining);

  const processedDocs = documents.filter(doc => doc.aiStatus === 'Processed');

  // Calculate simple stats
  const totalExpiringSoon = expiringDocs.filter(d => d.daysRemaining >= 0 && d.daysRemaining <= 90).length;
  const totalExpired = expiringDocs.filter(d => d.daysRemaining < 0).length;

  return (
    <div className="flex flex-col gap-8 animate-fade-in pb-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-text-main dark:text-white text-2xl font-bold">Analytics & Expirations</h2>
        <p className="text-[#637588] dark:text-[#92a4c9]">
          Track document validity and review stored AI insights.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl text-white shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white/20 rounded-lg">
              <span className="material-symbols-outlined">warning</span>
            </div>
            <p className="font-bold text-white/90">Action Required</p>
          </div>
          <p className="text-3xl font-bold">{totalExpired + totalExpiringSoon}</p>
          <p className="text-sm text-white/80 mt-1">Documents expired or expiring within 90 days</p>
        </div>

        <div className="p-6 bg-white dark:bg-[#1a2436] rounded-xl border border-[#e5e7eb] dark:border-[#324467] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-secondary/10 rounded-lg text-secondary">
              <span className="material-symbols-outlined">auto_awesome</span>
            </div>
            <p className="font-bold text-[#637588] dark:text-[#92a4c9]">Insights Generated</p>
          </div>
          <p className="text-3xl font-bold text-text-main dark:text-white">{processedDocs.length}</p>
          <p className="text-sm text-[#637588] dark:text-[#92a4c9] mt-1">Total documents processed by AI</p>
        </div>

        <div className="p-6 bg-white dark:bg-[#1a2436] rounded-xl border border-[#e5e7eb] dark:border-[#324467] shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-success/20 rounded-lg text-success">
              <span className="material-symbols-outlined">verified</span>
            </div>
            <p className="font-bold text-[#637588] dark:text-[#92a4c9]">Healthy Documents</p>
          </div>
          <p className="text-3xl font-bold text-text-main dark:text-white">{expiringDocs.filter(d => d.daysRemaining > 90).length}</p>
          <p className="text-sm text-[#637588] dark:text-[#92a4c9] mt-1">Valid for more than 3 months</p>
        </div>
      </div>

      {/* Expiration Tracker Section */}
      <div className="flex flex-col gap-4 bg-white dark:bg-[#1a2436] rounded-xl border border-[#e5e7eb] dark:border-[#324467] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#e5e7eb] dark:border-[#324467] bg-[#f9fafb] dark:bg-[#151d2b] flex items-center justify-between">
          <h3 className="font-bold text-text-main dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500">timer</span>
            Expiration Tracker
          </h3>
          <button className="text-xs font-bold text-secondary hover:underline">View Calendar</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f9fafb] dark:bg-[#1e2a40] border-b border-[#e5e7eb] dark:border-[#324467]">
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#637588] dark:text-[#92a4c9]">Document</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#637588] dark:text-[#92a4c9]">Validity Date</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#637588] dark:text-[#92a4c9]">Status</th>
                <th className="p-4 text-xs font-bold uppercase tracking-wider text-[#637588] dark:text-[#92a4c9]">Days Remaining</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#e5e7eb] dark:divide-[#324467]">
              {expiringDocs.length > 0 ? (
                expiringDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-[#f0f2f5] dark:hover:bg-[#232f48] transition-colors">
                    <td className="p-4 font-medium text-text-main dark:text-white">{doc.name}</td>
                    <td className="p-4 text-sm text-[#637588] dark:text-[#92a4c9]">{doc.validity}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${getStatusColor(doc.daysRemaining)}`}>
                        {getStatusLabel(doc.daysRemaining)}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-mono text-text-main dark:text-white">
                      {doc.daysRemaining < 0 ? `${Math.abs(doc.daysRemaining)} days ago` : `${doc.daysRemaining} days`}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-[#637588] dark:text-[#92a4c9]">
                    No documents with expiration dates found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Insight Repository Section */}
      <div className="flex flex-col gap-4 bg-white dark:bg-[#1a2436] rounded-xl border border-[#e5e7eb] dark:border-[#324467] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#e5e7eb] dark:border-[#324467] bg-[#f9fafb] dark:bg-[#151d2b]">
          <h3 className="font-bold text-text-main dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">storage</span>
            Stored AI Insights
          </h3>
        </div>
        <div className="grid grid-cols-1 gap-4 p-4">
          {processedDocs.map(doc => (
            <div key={doc.id} className="flex flex-col md:flex-row gap-4 p-4 border border-[#e5e7eb] dark:border-[#324467] rounded-lg bg-[#f9fafb] dark:bg-[#151d2b] hover:border-secondary/50 transition-colors">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h4 className="font-bold text-text-main dark:text-white">{doc.name}</h4>
                  <span className="px-2 py-0.5 rounded bg-[#e5e7eb] dark:bg-[#324467] text-[10px] font-bold uppercase text-[#637588] dark:text-[#92a4c9]">{doc.category}</span>
                </div>
                <p className="text-sm text-[#637588] dark:text-[#92a4c9] line-clamp-2">
                  {doc.summary}
                </p>
              </div>
              <div className="flex items-center md:flex-col justify-center gap-2 shrink-0">
                <div className="text-xs text-[#637588] dark:text-[#92a4c9]">{doc.date}</div>
                <button className="text-xs font-bold text-secondary border border-secondary/20 bg-secondary/5 px-3 py-1.5 rounded hover:bg-secondary hover:text-white transition-colors">
                  View Full
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};