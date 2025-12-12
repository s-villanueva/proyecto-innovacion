import React, { useState, useEffect } from 'react';

export const SettingsView: React.FC = () => {
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
              className="bg-center bg-no-repeat bg-cover rounded-full size-20 border-2 border-white dark:border-[#324467] shadow-md" 
              style={{backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuBaIXvmZWIimPEWtwDiDsI1ntuy7WME_XHTbMJNrlAma8alxtim6hrfBb0XPIu1t24mBzcAUIHRYFC2_mPfRFdszQ9cm6xuy3GPBODCowqs5dmcSElzKn9xrSxs_3AmniCSyRPvohsH6cASMdBCZDSvm1qUTh93Bju3yXp4qdUQ0Wuc-aD_gA9A5vsehk8GMyr3mnxbuLZZdnClelXxMd0GjU4YFlgkL7UOjIMBgjV9MAvGCu5zmcpqSkO9utHNjUeJ1Qw_yTv-HNmk")'}}
            ></div>
            <div className="absolute bottom-0 right-0 bg-primary text-white p-1 rounded-full border border-white dark:border-[#324467]">
              <span className="material-symbols-outlined text-[16px] block">edit</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase text-[#637588] dark:text-[#92a4c9]">Full Name</label>
              <input type="text" defaultValue="Alex Morgan" className="px-3 py-2 rounded-lg bg-[#f9fafb] dark:bg-[#232f48] border border-[#e5e7eb] dark:border-[#324467] text-text-main dark:text-white focus:ring-secondary focus:border-secondary" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs font-bold uppercase text-[#637588] dark:text-[#92a4c9]">Email</label>
              <input type="email" defaultValue="alex.morgan@example.com" className="px-3 py-2 rounded-lg bg-[#f9fafb] dark:bg-[#232f48] border border-[#e5e7eb] dark:border-[#324467] text-text-main dark:text-white focus:ring-secondary focus:border-secondary" />
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

       {/* Security */}
      <div className="flex flex-col gap-4 bg-white dark:bg-[#1a2436] p-6 rounded-xl border border-[#e5e7eb] dark:border-[#324467] shadow-sm">
        <h3 className="text-lg font-bold text-text-main dark:text-white flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">security</span>
          Security & Keys
        </h3>
        <div className="flex flex-col gap-4">
           <div className="flex flex-col gap-2">
             <p className="text-sm font-bold text-text-main dark:text-white">API Key</p>
             <div className="flex gap-2">
               <input type="password" value="sk-xxxxxxxxxxxxxxxxxxxxxxxx" disabled className="flex-1 px-3 py-2 rounded-lg bg-[#f9fafb] dark:bg-[#232f48] border border-[#e5e7eb] dark:border-[#324467] text-[#637588] dark:text-[#92a4c9]" />
               <button className="px-4 py-2 bg-white dark:bg-[#232f48] border border-[#e5e7eb] dark:border-[#324467] rounded-lg text-sm font-bold hover:bg-[#f0f2f5] dark:hover:bg-[#324467] transition-colors">Reveal</button>
             </div>
           </div>
           <button className="text-red-500 text-sm font-bold text-left hover:underline">Revoke all active sessions</button>
        </div>
      </div>

    </div>
  );
};