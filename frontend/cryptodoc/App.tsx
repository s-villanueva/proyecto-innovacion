import React, { useState, useEffect, useMemo } from 'react';
import { api } from './services/api';
import { supabase } from './lib/supabase';
import { Sidebar } from './components/Sidebar';
import { StatsGrid } from './components/StatsGrid';
import { DocumentTable } from './components/DocumentTable';
import { UploadView } from './components/UploadView';
import { InsightsView } from './components/InsightsView';
import { PreviewModal } from './components/PreviewModal';
import { SettingsView } from './components/SettingsView';
import { AnalyticsView } from './components/AnalyticsView';
import { LoginView } from './components/LoginView';
import { Document, Stat, ViewState } from './types';

const App: React.FC = () => {
  // Simplified Auth State (No Supabase dependency for now)
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const [isDataLoading, setIsDataLoading] = useState(false);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<string | null>(null);

  const [documents, setDocuments] = useState<Document[]>([]);
  const [backendStats, setBackendStats] = useState<Stat[]>([]);

  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(undefined);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  // Check for existing session on mount and listen for changes
  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsLoggedIn(!!session);
      setUserEmail(session?.user.email ?? null);
    });

    // Listen for changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setUserEmail(session?.user.email ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchData();
    }
  }, [isLoggedIn]);

  const fetchData = async () => {
    setIsDataLoading(true);
    setError(null);
    setErrorDetails(null);
    try {
      const [docs, statsData] = await Promise.all([
        api.getDocuments(),
        api.getStats()
      ]);
      setDocuments(docs);
      setBackendStats(statsData);
    } catch (err: any) {
      console.error("Fetch error:", err);

      // Detect CORS/Network errors specifically
      /*if (err.message === "Failed to fetch" || err.name === "TypeError") {
        setError("Network or CORS Error");
        setErrorDetails("The browser blocked the request. This usually happens if your backend server (ngrok) doesn't handle the OPTIONS request or CORS headers correctly.");
      } else {
        setError(err.message || "Failed to connect to API");
      }*/

      setDocuments([]);
    } finally {
      setIsDataLoading(false);
    }
  };



  const handleLogout = async () => {
    await supabase.auth.signOut();
    // State update handled by listener
  };

  const stats: Stat[] = useMemo(() => {
    if (backendStats.length > 0) return backendStats;

    // Fallback calculation if backend stats fail or are empty
    const total = documents.length;
    const verified = documents.filter(d => d.verificationStatus === 'Verified').length;
    const insights = documents.filter(d => d.aiStatus === 'Processed').length;
    const verifiedPercent = total > 0 ? Math.round((verified / total) * 100) : 0;

    return [
      { label: 'Total Documents', value: total.toLocaleString(), change: 'Live', icon: 'description' },
      { label: 'Blockchain Verified', value: `${verifiedPercent}%`, change: `${verified} docs`, icon: 'verified_user' },
      { label: 'AI Insights', value: insights.toString(), change: 'Processed', icon: 'auto_awesome' },
    ];
  }, [documents, backendStats]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      const success = await api.deleteDocument(id);
      if (success) {
        setDocuments(prev => prev.filter(doc => doc.id !== id));
        // Refresh stats after delete
        fetchData();
      } else {
        alert("Failed to delete document from server.");
      }
    }
  };

  const handleUploadSuccess = (newDoc: Document) => {
    setDocuments(prev => [newDoc, ...prev]);
    setCurrentView('dashboard');
    fetchData(); // Refresh stats
  };

  const handleViewInsights = (doc: Document) => {
    setSelectedDocId(doc.id);
    setCurrentView('insights');
  };

  const renderContent = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <div className="flex flex-col gap-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="text-text-main dark:text-white text-3xl md:text-4xl font-extrabold tracking-tight">
                  Welcome back, {userEmail?.split('@')[0] || 'User'}
                </h1>
                <p className="text-[#637588] dark:text-[#92a4c9] text-base">
                  Manage your secured documents and AI insights.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchData}
                  className="p-2.5 rounded-lg text-[#637588] dark:text-[#92a4c9] hover:bg-[#f0f2f5] dark:hover:bg-[#1e2a40] transition-colors"
                  title="Refresh Data"
                >
                  <span className={`material-symbols-outlined ${isDataLoading ? 'animate-spin' : ''}`}>refresh</span>
                </button>
                <button
                  onClick={() => setCurrentView('upload')}
                  className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-500/20 transition-all"
                >
                  <span className="material-symbols-outlined text-[20px]">add</span>
                  Upload Document
                </button>
              </div>
            </div>

            {/* Enhanced Error Banner */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 p-4 rounded-xl flex items-start gap-3">
                <span className="material-symbols-outlined mt-0.5">error</span>
                <div className="flex-1">
                  <p className="font-bold text-sm">{error}</p>
                  {errorDetails && <p className="text-xs opacity-90 mt-1">{errorDetails}</p>}
                </div>
                <button
                  onClick={fetchData}
                  className="px-3 py-1.5 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors shrink-0"
                >
                  Retry
                </button>
              </div>
            )}

            <StatsGrid stats={stats} />

            <DocumentTable
              documents={documents}
              onDelete={handleDelete}
              onViewInsights={handleViewInsights}
              onPreview={setPreviewDoc}
            />
          </div>
        );
      case 'upload':
        return <UploadView onUploadComplete={handleUploadSuccess} />;
      case 'analytics':
        return <AnalyticsView documents={documents} />;
      case 'insights':
        return (
          <InsightsView
            documents={documents}
            initialDocId={selectedDocId}
          />
        );
      case 'settings':
        return (
          <SettingsView
            onLogout={handleLogout}
            currentUserEmail={userEmail}
          />
        );
      default:
        return null;
    }
  };

  if (!isLoggedIn) {
    return <LoginView onLogin={() => { }} />;
  }

  return (
    <div className="flex h-screen w-full">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />
      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-background-light dark:bg-background-dark relative">
        <div className="md:hidden flex items-center justify-between p-4 bg-white dark:bg-background-dark border-b border-[#e5e7eb] dark:border-[#1e2a40]">
          <span className="material-symbols-outlined text-text-main dark:text-white cursor-pointer">menu</span>
          <span className="text-primary dark:text-white font-bold text-lg">CryptoDoc</span>
          <div className="size-8 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
            <span className="material-symbols-outlined text-lg">description</span>
          </div>
        </div>
        <div className="max-w-[1400px] w-full mx-auto p-4 md:p-8">
          {renderContent()}
        </div>
      </main>
      {previewDoc && (
        <PreviewModal
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
};

export default App;