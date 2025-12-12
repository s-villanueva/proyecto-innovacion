import React, { useState, useEffect, useRef } from 'react';
import { Document } from '../types';
import { api } from '../services/api';

interface InsightsViewProps {
  documents: Document[];
  initialDocId?: string;
}

export const InsightsView: React.FC<InsightsViewProps> = ({ documents, initialDocId }) => {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(initialDocId || (documents.length > 0 ? documents[0].id : null));
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'agent', text: string }[]>([
    { role: 'agent', text: 'Hello! I have analyzed this document. Feel free to ask me anything about its contents, dates, or financial figures.' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedDoc = documents.find(d => d.id === selectedDocId);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Reset chat when switching docs
  useEffect(() => {
    if (selectedDocId) {
      setMessages([{ role: 'agent', text: `I'm ready to answer questions about "${documents.find(d => d.id === selectedDocId)?.name}".` }]);
    }
  }, [selectedDocId, documents]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedDocId) return;

    const question = chatInput;
    setMessages(prev => [...prev, { role: 'user', text: question }]);
    setChatInput('');
    setIsTyping(true);

    try {
      const answer = await api.chatWithDocument(selectedDocId, question);
      setMessages(prev => [...prev, { role: 'agent', text: answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'agent', text: "Sorry, I encountered an error processing your request." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleRegenerateSummary = async () => {
    if (!selectedDocId) return;
    try {
      await api.regenerateSummary(selectedDocId);
      alert('Summary regenerated! Please refresh to see changes.');
      // Ideally we would trigger a refresh of the documents list here
    } catch (error) {
      alert('Failed to regenerate summary');
    }
  };

  if (!selectedDoc) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-8">
        <span className="material-symbols-outlined text-6xl text-[#637588] dark:text-[#92a4c9] mb-4">analytics</span>
        <h2 className="text-2xl font-bold text-text-main dark:text-white mb-2">No Documents Available</h2>
        <p className="text-[#637588] dark:text-[#92a4c9]">Upload a document to see AI insights.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-[calc(100vh-140px)] gap-6 animate-fade-in">
      {/* Left Sidebar: Document List */}
      <div className="w-full lg:w-1/4 flex flex-col gap-4 bg-white dark:bg-[#1a2436] rounded-xl border border-[#e5e7eb] dark:border-[#324467] overflow-hidden shadow-sm">
        <div className="p-4 border-b border-[#e5e7eb] dark:border-[#324467] bg-[#f9fafb] dark:bg-[#151d2b]">
          <h3 className="font-bold text-text-main dark:text-white flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">library_books</span>
            Documents
          </h3>
        </div>
        <div className="overflow-y-auto flex-1 p-2">
          {documents.map(doc => (
            <button
              key={doc.id}
              onClick={() => setSelectedDocId(doc.id)}
              className={`w-full text-left p-3 rounded-lg mb-2 transition-all flex items-start gap-3 ${selectedDocId === doc.id
                  ? 'bg-primary/10 border border-primary/20 dark:bg-primary/20'
                  : 'hover:bg-[#f0f2f5] dark:hover:bg-[#232f48] border border-transparent'
                }`}
            >
              <div className={`mt-1 size-2 rounded-full shrink-0 ${doc.aiStatus === 'Processed' ? 'bg-success' : 'bg-gray-400'}`}></div>
              <div className="overflow-hidden">
                <p className={`text-sm font-bold truncate ${selectedDocId === doc.id ? 'text-primary dark:text-white' : 'text-text-main dark:text-gray-300'}`}>
                  {doc.name}
                </p>
                <p className="text-xs text-[#637588] dark:text-[#92a4c9] truncate">{doc.date}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Center: Details & Summary */}
      <div className="w-full lg:w-2/5 flex flex-col gap-4 overflow-y-auto pr-2">
        {/* Metadata Card */}
        <div className="bg-white dark:bg-[#1a2436] rounded-xl border border-[#e5e7eb] dark:border-[#324467] p-6 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-text-main dark:text-white mb-1">{selectedDoc.name}</h2>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-[#f0f2f5] dark:bg-[#232f48] text-xs font-medium text-[#637588] dark:text-[#92a4c9] border border-[#e5e7eb] dark:border-[#324467]">
                  {selectedDoc.type.toUpperCase()}
                </span>
                <span className="px-2 py-0.5 rounded bg-[#f0f2f5] dark:bg-[#232f48] text-xs font-medium text-[#637588] dark:text-[#92a4c9] border border-[#e5e7eb] dark:border-[#324467]">
                  {selectedDoc.size}
                </span>
              </div>
            </div>
            <button className="text-secondary hover:text-blue-600 text-sm font-bold flex items-center gap-1">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Download
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="p-3 bg-[#f9fafb] dark:bg-[#151d2b] rounded-lg border border-[#e5e7eb] dark:border-[#324467]">
              <p className="text-xs text-[#637588] dark:text-[#92a4c9] uppercase font-bold mb-1">Category</p>
              <p className="text-sm font-medium text-text-main dark:text-white">{selectedDoc.category}</p>
            </div>
            <div className="p-3 bg-[#f9fafb] dark:bg-[#151d2b] rounded-lg border border-[#e5e7eb] dark:border-[#324467]">
              <p className="text-xs text-[#637588] dark:text-[#92a4c9] uppercase font-bold mb-1">Uploaded On</p>
              <p className="text-sm font-medium text-text-main dark:text-white">{selectedDoc.date}</p>
            </div>
            <div className="p-3 bg-[#f9fafb] dark:bg-[#151d2b] rounded-lg border border-[#e5e7eb] dark:border-[#324467] col-span-2">
              <p className="text-xs text-[#637588] dark:text-[#92a4c9] uppercase font-bold mb-1">Validity / Expiry</p>
              {selectedDoc.validity ? (
                <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
                  <span className="material-symbols-outlined text-[18px]">event_busy</span>
                  <p className="text-sm font-bold">{selectedDoc.validity}</p>
                </div>
              ) : (
                <p className="text-sm text-[#637588] dark:text-[#92a4c9]">No expiration date detected</p>
              )}
            </div>
          </div>
        </div>

        {/* AI Summary */}
        <div className="bg-white dark:bg-[#1a2436] rounded-xl border border-[#e5e7eb] dark:border-[#324467] p-6 shadow-sm flex-1">
          <div className="flex items-center gap-2 mb-4">
            <span className="material-symbols-outlined text-secondary text-2xl">auto_awesome</span>
            <h3 className="text-lg font-bold text-text-main dark:text-white">AI Summary</h3>
          </div>
          <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed text-text-main dark:text-[#e2e8f0]">
            {selectedDoc.summary ? (
              <p>{selectedDoc.summary}</p>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center opacity-60">
                <span className="material-symbols-outlined text-3xl mb-2">pending</span>
                <p>Summary is being generated...</p>
              </div>
            )}
          </div>
          <div className="mt-4 pt-4 border-t border-[#e5e7eb] dark:border-[#324467] flex gap-2">
            <button onClick={handleRegenerateSummary} className="text-xs font-bold text-secondary hover:underline">Regenerate</button>
            <button className="text-xs font-bold text-[#637588] hover:text-text-main dark:text-[#92a4c9] dark:hover:text-white">Copy Text</button>
          </div>
        </div>
      </div>

      {/* Right: Chat Agent */}
      <div className="w-full lg:w-[35%] flex flex-col bg-white dark:bg-[#1a2436] rounded-xl border border-[#e5e7eb] dark:border-[#324467] shadow-sm overflow-hidden">
        <div className="p-4 border-b border-[#e5e7eb] dark:border-[#324467] bg-[#f9fafb] dark:bg-[#151d2b] flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="relative">
              <span className="material-symbols-outlined text-secondary bg-secondary/10 p-1.5 rounded-lg">smart_toy</span>
              <span className="absolute -bottom-1 -right-1 flex size-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full size-3 bg-success"></span>
              </span>
            </div>
            <div>
              <h3 className="font-bold text-text-main dark:text-white text-sm">DocuAgent</h3>
              <p className="text-[10px] text-[#637588] dark:text-[#92a4c9]">Online • Context: {selectedDoc.name}</p>
            </div>
          </div>
          <button onClick={() => setMessages([])} className="text-[#637588] hover:text-secondary dark:text-[#92a4c9]">
            <span className="material-symbols-outlined text-[18px]">refresh</span>
          </button>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-[#f6f6f8] dark:bg-[#0d121c]">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === 'user'
                  ? 'bg-primary text-white rounded-br-none'
                  : 'bg-white dark:bg-[#1e2a40] text-text-main dark:text-[#e2e8f0] border border-[#e5e7eb] dark:border-[#324467] rounded-bl-none'
                }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-white dark:bg-[#1e2a40] border border-[#e5e7eb] dark:border-[#324467] rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-[#1a2436] border-t border-[#e5e7eb] dark:border-[#324467]">
          <div className="relative">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask a question about this file..."
              className="w-full pl-4 pr-12 py-3 rounded-xl bg-[#f0f2f5] dark:bg-[#232f48] border-transparent focus:bg-white dark:focus:bg-[#1a2436] focus:border-secondary focus:ring-0 text-sm text-text-main dark:text-white transition-all shadow-inner"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!chatInput.trim() || isTyping}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-primary text-white hover:bg-blue-600 disabled:opacity-50 disabled:hover:bg-primary transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">send</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};