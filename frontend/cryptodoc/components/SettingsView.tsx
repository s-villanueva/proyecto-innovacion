import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

interface SettingsViewProps {
  onLogout: () => void;
  currentUserEmail: string | null;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onLogout, currentUserEmail }) => {
  const [isDarkMode, setIsDarkMode] = useState(true);

  // Sync state with DOM on mount
  useEffect(() => {
    if (document.documentElement.classList.contains('dark')) {
      setIsDarkMode(true);
    } else {
      setIsDarkMode(false);
    }
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  const handleSignOut = async () => {
    // Call parent logout handler
    onLogout();
  };

  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-6 animate-fade-in pb-10">
      <div className="flex flex-col gap-1">
        <h2 className="text-text-main dark:text-white text-2xl font-bold">Settings</h2>
        <p className="text-[#637588] dark:text-[#92a4c9]">
          Manage your account preferences and application configuration.
        </p>
      </div>

      {/* Profile Section */}
      <div className="flex flex-col gap-4 bg-white dark:bg-[#1a2436] p-6 rounded-xl border border-[#e5e7eb] dark:border-[#324467] shadow-sm">
        <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">account_circle</span>
          Profile Information
        </h3>
        <div className="flex items-center gap-6 mt-2">
          <div className="relative group cursor-pointer">
            <div
              className="bg-center bg-no-repeat bg-cover rounded-full size-20 border-2 border-white dark:border-[#324467] shadow-md bg-gradient-to-br from-primary to-secondary"
            >
              <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                {(currentUserEmail || 'U').substring(0, 2).toUpperCase()}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase text-[#637588] dark:text-[#92a4c9]">Account Email</label>
              <input type="email" value={currentUserEmail || ''} disabled className="px-3 py-2 rounded-lg bg-[#f9fafb] dark:bg-[#232f48] border border-[#e5e7eb] dark:border-[#324467] text-text-main dark:text-white opacity-70 cursor-not-allowed" />
            </div>
            <div className="flex flex-col gap-1 justify-end">
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">logout</span>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Appearance */}
      <div className="flex flex-col gap-4 bg-white dark:bg-[#1a2436] p-6 rounded-xl border border-[#e5e7eb] dark:border-[#324467] shadow-sm">
        <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">palette</span>
          Appearance
        </h3>
        <div className="flex items-center justify-between p-4 bg-[#f9fafb] dark:bg-[#232f48] rounded-lg border border-[#e5e7eb] dark:border-[#324467]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#637588] dark:text-[#92a4c9]">{isDarkMode ? 'dark_mode' : 'light_mode'}</span>
            <div>
              <p className="font-bold text-text-main dark:text-white">Dark Mode</p>
              <p className="text-xs text-[#637588] dark:text-[#92a4c9]">Toggle between light and dark themes</p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${isDarkMode ? 'bg-primary' : 'bg-gray-300'}`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="flex flex-col gap-4 bg-white dark:bg-[#1a2436] p-6 rounded-xl border border-[#e5e7eb] dark:border-[#324467] shadow-sm">
        <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">notifications</span>
          Notifications
        </h3>
        <div className="flex flex-col gap-3">
          <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-[#f9fafb] dark:hover:bg-[#232f48] rounded-lg transition-colors">
            <span className="text-sm font-medium text-text-main dark:text-white">Email alerts for new documents</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-secondary focus:ring-secondary bg-gray-100 dark:bg-[#232f48] border-gray-300 dark:border-[#324467]" />
          </label>
          <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-[#f9fafb] dark:hover:bg-[#232f48] rounded-lg transition-colors">
            <span className="text-sm font-medium text-text-main dark:text-white">Daily AI Summary Digest</span>
            <input type="checkbox" className="w-5 h-5 rounded text-secondary focus:ring-secondary bg-gray-100 dark:bg-[#232f48] border-gray-300 dark:border-[#324467]" />
          </label>
          <label className="flex items-center justify-between cursor-pointer p-2 hover:bg-[#f9fafb] dark:hover:bg-[#232f48] rounded-lg transition-colors">
            <span className="text-sm font-medium text-text-main dark:text-white">Security Alerts (Login, Key Usage)</span>
            <input type="checkbox" defaultChecked className="w-5 h-5 rounded text-secondary focus:ring-secondary bg-gray-100 dark:bg-[#232f48] border-gray-300 dark:border-[#324467]" />
          </label>
        </div>
      </div>

    </div>
  );
};