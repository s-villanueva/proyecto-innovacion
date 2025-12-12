import React from 'react';
import { NavItem, ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'upload', label: 'Upload', icon: 'upload_file' },
  { id: 'analytics', label: 'Analytics', icon: 'monitoring' },
  { id: 'insights', label: 'AI Insights', icon: 'analytics' },
];

export const Sidebar: React.FC<SidebarProps> = ({ currentView, onNavigate }) => {
  return (
    <aside className="flex w-64 flex-col border-r border-[#e5e7eb] bg-white dark:border-[#1e2a40] dark:bg-background-dark transition-all duration-300 hidden md:flex shrink-0">
      <div className="flex h-full flex-col justify-between p-4">
        <div className="flex flex-col gap-4">
          {/* Brand */}
          <div className="flex gap-3 items-center px-2 py-4 cursor-pointer" onClick={() => onNavigate('dashboard')}>
            {/* Custom SVG Logo matching CryptoDoc style */}
            <div className="size-10 shrink-0 text-secondary">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14 2 14 8 20 8" />
                <circle cx="16" cy="13" r="2" className="fill-current text-secondary" stroke="none" />
                <circle cx="16" cy="18" r="1.5" className="fill-current text-secondary" stroke="none" />
                <path d="M16 13V18" strokeWidth="1.5" />
                <path d="M8 13H10" strokeWidth="2" />
                <path d="M8 17H12" strokeWidth="2" />
              </svg>
            </div>
            <div className="flex flex-col justify-center">
              <h1 className="text-primary dark:text-white text-2xl font-extrabold leading-none tracking-tight">CryptoDoc</h1>
              <p className="text-primary dark:text-[#92a4c9] text-[10px] font-bold tracking-widest uppercase ml-0.5">S.R.L.</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-2 mt-2">
            {NAV_ITEMS.map((item) => {
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group w-full text-left ${
                    isActive
                      ? 'bg-primary/10 text-primary dark:bg-[#232f48] dark:text-white'
                      : 'text-[#637588] dark:text-[#92a4c9] hover:bg-[#f0f2f5] dark:hover:bg-[#1e2a40]'
                  }`}
                >
                  <span className={`material-symbols-outlined ${!isActive ? 'group-hover:text-primary dark:group-hover:text-white' : ''} transition-colors`}>
                    {item.icon}
                  </span>
                  <p className={`text-sm ${isActive ? 'font-bold' : 'font-medium'}`}>{item.label}</p>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex flex-col gap-2">
          <div className="w-full h-[1px] bg-[#e5e7eb] dark:bg-[#1e2a40] my-2"></div>
          <button
            onClick={() => onNavigate('settings')}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors w-full text-left ${
              currentView === 'settings'
                ? 'bg-primary/10 text-primary dark:bg-[#232f48] dark:text-white'
                : 'text-[#637588] dark:text-[#92a4c9] hover:bg-[#f0f2f5] dark:hover:bg-[#1e2a40]'
            }`}
          >
            <span className={`material-symbols-outlined ${currentView !== 'settings' ? 'group-hover:text-primary dark:group-hover:text-white' : ''}`}>settings</span>
            <p className={`text-sm ${currentView === 'settings' ? 'font-bold' : 'font-medium'}`}>Settings</p>
          </button>
        </div>
      </div>
    </aside>
  );
};