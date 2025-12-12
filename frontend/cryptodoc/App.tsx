import React, { useState, useEffect } from 'react';
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
import { api } from './services/api';
import { AuthProvider, useAuth } from './context/AuthContext';

const AuthenticatedApp: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [documents, setDocuments] = useState<Document[]>([]);
  const [stats, setStats] = useState<Stat[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string | undefined>(undefined);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      const [docsData, statsData] = await Promise.all([
        api.getDocuments(),
        api.getStats()
      ]);
      setDocuments(docsData);
      setStats(statsData);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this document?")) {
      try {
        await api.deleteDocument(id);
        setDocuments(prev => prev.filter(doc => doc.id !== id));
        // Refresh stats after delete
        const statsData = await api.getStats();
        setStats(statsData);
      } catch (error) {
        alert('Failed to delete document');
      }
    }
  };

  const handleViewInsights = (doc: Document) => {
    setSelectedDocId(doc.id);
    setCurrentView('insights');
  };

  const handlePreview = async (doc: Document) => {
    if (doc.url) {
      setPreviewDoc(doc);
    } else {
      try {
        const url = await api.getPreviewUrl(doc.id);
        setPreviewDoc({ ...doc, url });
      } catch (error) {
        console.error('Failed to get preview URL:', error);
        alert('Could not preview document');
      }
    }
  };

  const renderContent = () => {
    if (loading && currentView === 'dashboard') {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    switch (currentView) {
      case 'dashboard':
        return (
          <div className="flex flex-col gap-8 animate-fade-in">
            {/* Page Heading */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="flex flex-col gap-1">
                <h1 className="text-text-main dark:text-white text-3xl md:text-4xl font-extrabold tracking-tight">
                  Welcome back, {user?.email?.split('@')[0] || 'User'}
                </h1>
                <p className="text-[#637588] dark:text-[#92a4c9] text-base">
                  Manage your secured documents and AI insights.
                </p>
              </div>
              <button
                onClick={() => setCurrentView('upload')}
                className="flex items-center gap-2 bg-primary hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold shadow-lg shadow-blue-500/20 transition-all"
              >
                <span className="material-symbols-outlined text-[20px]">add</span>
                Upload Document
              </button>
            </div>

            {/* Stats Grid */}
            <StatsGrid stats={stats} />

            {/* Main Content Panel */}
            <DocumentTable
              documents={documents}
              onDelete={handleDelete}
              onViewInsights={handleViewInsights}
              onPreview={handlePreview}
            />
          </div>
        );
      case 'upload':
        return <UploadView onUploadSuccess={() => {
          fetchData();
          setCurrentView('dashboard');
        }} />;
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
        return <SettingsView />;
      default:
        return null;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background-light dark:bg-background-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginView />;
  }

  return (
    <div className="flex h-screen w-full">
      <Sidebar currentView={currentView} onNavigate={setCurrentView} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full overflow-y-auto bg-background-light dark:bg-background-dark relative">
        {/* Mobile Header Placeholder (visible only on small screens) */}
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

      {/* Preview Modal */}
      {previewDoc && (
        <PreviewModal
          document={previewDoc}
          onClose={() => setPreviewDoc(null)}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AuthenticatedApp />
    </AuthProvider>
  );
};

export default App;